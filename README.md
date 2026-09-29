<div align="center" width="100%">
    <img src="./frontend/public/icon.svg" width="128" alt="" />
</div>

# Fork of Dockge

This is a fork of the excellent [Dockge](https://github.com/louislam/dockge) by [@louislam](https://github.com/louislam).  
Since I was missing some features and the project doesn’t seem to be actively maintained at the moment, I have implemented these features here in my fork.

For general information about Dockge, please refer to the original project.  
Details about my changes are available in the [release notes](https://github.com/hamphh/dockge/releases).

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

- This repository tracks [hamphh/dockge](https://github.com/hamphh/dockge) and cherry-picks security fixes from [louislam/dockge](https://github.com/louislam/dockge) when they are missing.
- Dockge needs access to the Docker socket, which is equivalent to root access on the host. Do not expose it directly to the internet, put it behind a reverse proxy with TLS and, if possible, an additional authentication layer.
- Only enable the `trustProxy` setting when Dockge is really behind a proxy you control.
