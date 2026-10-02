import * as os from "node:os";
import * as fs from "node:fs";
import childProcessAsync from "promisify-child-process";
import { log } from "./log";

const HELPER_CONTAINER_NAME = "dockge-self-update";
const DOCKER_SOCKET = "/var/run/docker.sock";

// What is needed from `docker inspect` of the container Dockge runs in
export interface OwnContainerInfo {
    Id?: string;
    Image?: string;
    Config?: {
        Labels?: Record<string, string>;
    };
    Mounts?: { Destination?: string, Source?: string }[];
}

export interface SelfUpdatePlan {
    // Arguments of `docker run`
    runArgs: string[];
    project: string;
    service: string;
}

/**
 * Build the docker command that updates the compose service Dockge runs as.
 *
 * Recreating the container from inside itself would stop the very process doing the work,
 * so a short-lived helper container does it. The helper uses the image of the running container
 * (it already contains the docker CLI and the compose plugin).
 * All the values are given through the environment, the script itself is static.
 * @param info Result of `docker inspect` of the current container
 * @returns The command to run
 * @throws Error if Dockge is not started by docker compose
 */
export function buildSelfUpdatePlan(info: OwnContainerInfo): SelfUpdatePlan {
    const labels = info.Config?.Labels ?? {};
    const project = labels["com.docker.compose.project"];
    const service = labels["com.docker.compose.service"];
    const workingDir = labels["com.docker.compose.project.working_dir"];
    const configFiles = labels["com.docker.compose.project.config_files"];

    if (!project || !service || !workingDir || !configFiles) {
        throw new Error("Dockge is not started by docker compose, it cannot update itself.");
    }

    if (!info.Image) {
        throw new Error("Unable to find the image of the current container.");
    }

    // The socket is mounted from the host path that was given to Dockge
    const socketSource = info.Mounts?.find(m => m.Destination === DOCKER_SOCKET)?.Source || DOCKER_SOCKET;

    const script = "docker compose pull \"$DOCKGE_UPDATE_SERVICE\" && docker compose up -d --no-deps \"$DOCKGE_UPDATE_SERVICE\"";

    return {
        project,
        service,
        runArgs: [
            "run", "-d",
            "--name", HELPER_CONTAINER_NAME,
            "-v", `${socketSource}:${DOCKER_SOCKET}`,
            // Same path inside and outside: relative paths of the compose file resolve to the same host folders
            "-v", `${workingDir}:${workingDir}`,
            "-w", workingDir,
            "-e", `COMPOSE_PROJECT_NAME=${project}`,
            "-e", `COMPOSE_FILE=${configFiles.split(",").join(":")}`,
            "-e", `DOCKGE_UPDATE_SERVICE=${service}`,
            "--entrypoint", "sh",
            info.Image,
            "-c", script,
        ],
    };
}

/**
 * Does Dockge run inside a Docker container?
 * DOCKGE_IS_CONTAINER is not set by the image, so the marker file created by Docker is checked too.
 * @returns true if running in a container
 */
export function isRunningInContainer(): boolean {
    return process.env.DOCKGE_IS_CONTAINER === "1" || fs.existsSync("/.dockerenv");
}

/**
 * Find the id of the container Dockge runs in.
 * @returns The container id or name
 */
function getOwnContainerId(): string {
    try {
        // Docker bind mounts files from /var/lib/docker/containers/<id>/
        const match = fs.readFileSync("/proc/self/mountinfo", "utf-8").match(/\/containers\/([0-9a-f]{64})\//);
        if (match) {
            return match[1];
        }
    } catch (_) {
        // Fall through to the hostname
    }

    // By default the hostname of a container is its short id
    return os.hostname();
}

/**
 * Update Dockge itself: pull the new image and recreate the container, done by a helper container.
 * Returns as soon as the helper is started, Dockge restarts a few seconds later.
 * @throws Error if Dockge does not run in a container started by docker compose
 */
export async function startSelfUpdate(): Promise<void> {
    if (!isRunningInContainer()) {
        throw new Error("Dockge is not running in a container, update it manually.");
    }

    const inspect = await childProcessAsync.spawn("docker", [ "inspect", "--format", "json", "--", getOwnContainerId() ], {
        encoding: "utf-8",
    });

    const info = JSON.parse(inspect.stdout?.toString() ?? "[]")[0] as OwnContainerInfo | undefined;
    if (!info) {
        throw new Error("Unable to inspect the current container.");
    }

    const plan = buildSelfUpdatePlan(info);

    // A helper from a previous update is no longer needed
    await childProcessAsync.spawn("docker", [ "rm", "-f", HELPER_CONTAINER_NAME ], { encoding: "utf-8" }).catch(() => {});

    log.info("self-update", `Updating ${plan.project}/${plan.service}`);
    await childProcessAsync.spawn("docker", plan.runArgs, { encoding: "utf-8" });
}
