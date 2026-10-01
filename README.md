<div align="center" width="100%">
    <img src="./frontend/public/icon.svg" width="128" alt="" />
</div>

# Dockge Custom

Dockge Custom is a fork of [hamphh/dockge](https://github.com/hamphh/dockge), which is itself a fork of the excellent [Dockge](https://github.com/louislam/dockge) by [@louislam](https://github.com/louislam).

```
louislam/dockge  ──►  hamphh/dockge  ──►  Yogui26/dockge-custom (this repository)
   original            1st fork              2nd fork
```

For general information about Dockge (what it is, how to use stacks, agents, the interactive editor…), please refer to the original project. This README only describes what differs.

## What each fork adds

### [louislam/dockge](https://github.com/louislam/dockge) — the original project

A self-hosted manager for Docker Compose stacks: compose editor, `docker run` to compose converter, interactive terminal, container logs and multi-server management through agents.

### [hamphh/dockge](https://github.com/hamphh/dockge) — first fork

- **Stack update management**: detects when a newer image exists for the services of a stack (local digest compared with the registry digest, using `skopeo`), shows an "Update available" indicator and filter, and lets you update a stack or a single service. It can be tuned per service with the labels `dockge.imageupdates.check`, `dockge.imageupdates.ignore` and `dockge.imageupdates.changelog`, and the status of a service can be ignored with `dockge.status.ignore`.
- **Server maintenance** (per agent): list, prune, pull and delete Docker images, networks and volumes.
- Resource usage statistics on the compose page and several UI fixes.

### Yogui26/dockge-custom — this fork

- **Published image** on `ghcr.io/yogui26/dockge-custom` (linux/amd64 and linux/arm64) built by GitHub Actions; the frontend is compiled inside the Docker build and `skopeo` is included in the image.
- **Dependencies and security**: major dependency upgrades (Vite 8, redbean-node 0.4, knex 3.3…), security fixes, hardened maintenance actions (allow-listed artefacts, validated identifiers, no `v-html` on image data), CI, Dependabot and refreshed security notes.
- **Home page**: disk space used / total for each agent, a compact maintenance button and a **live log** page for every agent (the log of the Dockge server itself).
- **About page and update check** rewritten for this fork: the logo, the links to the three projects and the new-version notice follow the releases of this repository.
- **Versioning**: versions start at 1.0.0 and moved to 2.x so that the agents are not refused by the minimum agent version (1.4.0) inherited from the original project. See the [changelog](CHANGELOG.md) for the details of each version.

All the agents connected to the same Dockge must use this image (and, for the newest features such as the live log, the same version).

## Usage

To use this fork, replace `louislam/dockge:1` with `ghcr.io/yogui26/dockge-custom:latest` in the [Dockge compose file](compose.yaml).  
The new image must be used on all endpoints.

The image is built and published automatically by GitHub Actions on every push to `master` (tags: `latest`, `master`, `sha-<commit>`). If `docker pull` is denied, the package is still private: make it public in the package settings on GitHub, or log in with `docker login ghcr.io` and a token that has the `read:packages` scope.

To build it yourself, no Node.js is needed on the host, the frontend is compiled inside the image:

```bash
docker build -f docker/Dockerfile --target release -t dockge-custom:test .
```

⚠️ **Important:** Make a backup of your Dockge data folder beforehand or use a different one, as this image modifies the database.  

Currently, the published image is built for **linux/amd64** and **linux/arm64**. **linux/arm/v7** can be added from the workflow's manual run (`Actions` > `Publish Docker image` > `Run workflow`).

## Security notes

- This repository tracks [hamphh/dockge](https://github.com/hamphh/dockge) (itself a fork of [louislam/dockge](https://github.com/louislam/dockge)) and cherry-picks security fixes from [louislam/dockge](https://github.com/louislam/dockge) when they are missing.
- Dockge needs access to the Docker socket, which is equivalent to root access on the host. Do not expose it directly to the internet, put it behind a reverse proxy with TLS and, if possible, an additional authentication layer.
- Only enable the `trustProxy` setting when Dockge is really behind a proxy you control.
