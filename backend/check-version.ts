import { log } from "./log";
import { compare, validate } from "compare-versions";
import packageJSON from "../package.json";
import { Settings } from "./settings";

// How much time in ms to wait between update checks
const UPDATE_CHECKER_INTERVAL_MS = 1000 * 60 * 60 * 48;
const REQUEST_TIMEOUT_MS = 10 * 1000;

// Updates are looked up on the GitHub releases of this fork (the original Dockge update service
// only knows about the versions of the upstream project, which are not comparable with ours).
const GITHUB_REPOSITORY = "Yogui26/dockge-custom";
const RELEASES_URL = `https://api.github.com/repos/${GITHUB_REPOSITORY}/releases?per_page=30`;
const TAGS_URL = `https://api.github.com/repos/${GITHUB_REPOSITORY}/tags?per_page=30`;

interface VersionCandidate {
    // Release tag, e.g. "v1.2.0" or "1.2.0-beta.1"
    tag: unknown;
    prerelease?: boolean;
    draft?: boolean;
}

/**
 * Get the highest version among release tags.
 * @param candidates Releases or tags returned by GitHub
 * @param includeBeta Also consider pre-releases (beta versions)
 * @returns The highest version without the leading "v", or undefined if there is none
 */
export function pickLatestVersion(candidates: VersionCandidate[], includeBeta: boolean): string | undefined {
    let latest: string | undefined;

    for (const candidate of candidates) {
        if (candidate.draft || typeof candidate.tag !== "string") {
            continue;
        }

        const version = candidate.tag.trim().replace(/^v/i, "");

        if (!validate(version)) {
            continue;
        }

        const isBeta = candidate.prerelease === true || version.includes("-");
        if (isBeta && !includeBeta) {
            continue;
        }

        if (latest === undefined || compare(version, latest, ">")) {
            latest = version;
        }
    }

    return latest;
}

/**
 * GET a GitHub API endpoint and return the parsed JSON array.
 * @param url API url
 * @returns The list returned by GitHub
 */
async function fetchList(url: string): Promise<unknown[]> {
    const res = await fetch(url, {
        headers: {
            "Accept": "application/vnd.github+json",
            "User-Agent": "dockge-custom-update-checker",
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!res.ok) {
        throw new Error(`GitHub answered ${res.status}`);
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
}

class CheckVersion {
    version = packageJSON.version;
    latestVersion? : string;
    interval? : NodeJS.Timeout;

    async startInterval() {
        const check = async () => {
            if (await Settings.get("checkUpdate") === false) {
                return;
            }

            log.debug("update-checker", "Retrieving latest versions");

            try {
                const checkBeta = await Settings.get("checkBeta") === true;

                // Published releases first, then plain git tags if no release has been created
                const releases = (await fetchList(RELEASES_URL)) as { tag_name?: unknown, prerelease?: boolean, draft?: boolean }[];
                let latest = pickLatestVersion(releases.map(r => ({
                    tag: r.tag_name,
                    prerelease: r.prerelease,
                    draft: r.draft,
                })), checkBeta);

                if (!latest) {
                    const tags = (await fetchList(TAGS_URL)) as { name?: unknown }[];
                    latest = pickLatestVersion(tags.map(t => ({ tag: t.name })), checkBeta);
                }

                // For debug
                if (process.env.TEST_CHECK_VERSION === "1") {
                    latest = "1000.0.0";
                }

                if (latest) {
                    this.latestVersion = latest;
                }
            } catch (_) {
                log.info("update-checker", "Failed to check for new versions");
            }

        };

        await check();
        this.interval = setInterval(check, UPDATE_CHECKER_INTERVAL_MS);
    }
}

const checkVersion = new CheckVersion();
export default checkVersion;
