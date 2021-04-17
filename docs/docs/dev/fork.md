---
id: fork
title: Fork Repository
sidebar_label: Create Fork
---

## Update GitHub Actions

This repository contains a GitHub action which automatically builds and published docker images after a release inside the repository gets published.
These images get pushed to the [GitHub Container Repository][gh-cr].
However, this means that you have to adjust the credentials used for this action if you want to publish your your own Docker images.
To do so just follow these steps:

:::tip
You could also just completly remove the action. In this case you have to make sure to **not** commit the removed action file in any PRs made to the parent repository!
:::

1. Generate a new Personal Access Token (PAT) and copy it for the next step. Make sure you follow the guide lines in the [official GitHub guide for generating a PAT for the Container Repository][get-pat-cr] and to set the permission described there.

   :::caution
   The PAT has to belong to the user who owns the repository!
   :::

1. Add the PAT as a secret to your fork and name it `GH_REGISTRY_TOKEN`. Go to `Settings` > `Secrets` on your repository page to do so. If you change the name of this token you have to follow the next step aswell.

1. (_Only if you changed the name of the token_) Replace the `GH_REGISTRY_TOKEN` name inside the workflow file (`.github/workflows/build-push-docker.yml`) in the login step to your name.

   ```yml
   # Login to repository
   - name: Login to DockerHub
     uses: docker/login-action@v1
     with:
       registry: ghcr.io
       username: ${{ github.repository_owner }}
       password: ${{ secrets.GH_REGISTRY_TOKEN }}
   ```

1. Update the name of the docker image to match the current repository. Replace `{REPO_OWNER}` inside the workflow file (`.github/workflows/build-push-docker.yml`) with the actual owner of your fork.

   ```yml
   - name: Build and push the image
     uses: docker/build-push-action@v2
     with:
           push: true
           no-cache: true
           tags: |
           ghcr.io/{REPO_OWNER}/tutor-management-system:${{ github.event.release.tag_name }}
           ghcr.io/{REPO_OWNER}/tutor-management-system:latest
   ```

<!-- References --->

[gh-cr]: https://docs.github.com/en/free-pro-team@latest/packages/getting-started-with-github-container-registry/about-github-container-registry
[get-pat-cr]: https://docs.github.com/en/free-pro-team@latest/packages/managing-container-images-with-github-container-registry/pushing-and-pulling-docker-images#authenticating-to-github-container-registry
