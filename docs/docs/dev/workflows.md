---
id: gh-workflows
title: GitHub Workflows
sidebar_label: GitHub Workflows
---

## Introduction

The repository comes with a few GitHub Workflows preconfigured.
This page contains a description for each workflow and a note on when it gets triggered.
If you want to fork the repository please refer to the [fork page](./fork).

## Code Quality

| Trigger      | Branches     |
| ------------ | ------------ |
| Pull Request | All          |
| Push         | main, stable |

**Required to merge pull request:** Yes

This workflow has three jobs:

-   _Type Check Client_: Checks if the client compiles and does not contain any type errors.
-   _Type Check Server_: Checks if the server compiles and does not contain any type errors.
-   _Code Quality_: Checks all projects inside this repository if their code complies to the code styles configured in this repository.

## Unit Tests

| Trigger      | Branches     |
| ------------ | ------------ |
| Pull Request | All          |
| Push         | main, stable |

**Required to merge pull request:** Yes

Runs the unit tests in the server.

## Docker image test

| Trigger      | Branches     |
| ------------ | ------------ |
| Pull Request | main         |
| Push         | main, stable |

**Required to merge pull request:** Yes

Creates a docker image and test if the server would start using this image.
If the image starts successfully the job checks if a PDF could be generated.
This is done because using puppeteer inside an alpine image might fail after package updates.

## Build and push Docker image

| Trigger | State     |
| ------- | --------- |
| Release | published |

**Required to merge pull request:** No

If a release is published (not drafted or updated) this job will create a new docker image.
The version used is the tag of the release.
After the image is created it gets pushed to the [GitHub Container Registry](https://docs.github.com/en/packages/guides/about-github-container-registry) associated with this repository.

:::caution Semantic version
Make sure the version tag of your releases match the semantic versioning: `major`.`minor`.`patch`
:::

## Deploy docs

| Trigger      | Branches |
| ------------ | -------- |
| Pull Request | main     |
| Push         | main     |

**Required to merge pull request:** Yes

In a pull request made against the `main` branch one job of the workflow checks if this documentation could be build.
Due to the second job being skipped in pull requests it shows so inside the CI box at the bottom of the pull request.

Everytime something is **pushed** to the `main` branch of the repository this documentation gets build with the second job.
Afterwards it gets pushed to the corresponding GitHub pages branch of the repository.
If you push against the `main` branch of a fork the docs get updated inside the fork not the original repository.
