---
id: setup-env
title: Setup Development Environment
sidebar_label: Setup Environment
---

## Fork the repository

First, you need to create a fork of the repository.
This can be done by clicking on the `Fork`-Button on the upper right of the repository.
More information on forking can be found in the [official GitHub guides](https://docs.github.com/en/free-pro-team@latest/github/getting-started-with-github/fork-a-repo).

In addition you need to change a few things regarding the used actions inside the repository. Please follow the guide in the [Fork section][fork-doc] of this documentation.

## Requirements

To get started you need a few development tools. The following are required to run and test your changes locally:

1. [NodeJS 14.x.x](https://nodejs.org)
   **Note:** You must use NodeJS 14.x.x or higher.
2. Package manager [pnpm](https://pnpm.js.org/en/)
   If you have not already you can install `pnpm` with
    ```cmd
    npm install -g pnpm
    ```

While [Docker](https://docs.docker.com/install/) is not needed it helps you to set up your environment more easily. It's mostly used to spin up a Mongo database on your system in closely to no time. If you don't use Docker you need to provide an alternative MongoDB database (_Note: Technically any `mongoose` compatible database should work aswell._) and to change the configuration in `server/config/development.yml`.

:::warning
Make sure that you do **NOT** commit & push any sensitive information (ie authentication data) to the repository!
:::

## Set up your environment

After pulling your fork and creating a new branch for your issue you have to setup the development environment first.

1. **Navigate** into the repository folder and install all needed npm packages by running the following command (_Please note that this might take some time for the first time installing._):

    ```sh
    pnpm install
    ```

1. **Download** the [`docker-compose.yml` file](../assets/dev/docker-compose.yml) for the development. It contains two services: `mongo` and `mongo-express`.

1. **Run** either of these two commands depending on your needs:

    1. Just set up a mongo database:

        ```sh
        docker-compose up -d mongo
        ```

    1. If you want to also get an administrative board for your local database:
        ```sh
        docker-compose up -d mongo mongo-express
        ```
        This starts the MongoDB aswell as a webinterface which connects to it. To access this interface visit [localhost:8081](localhost:8081).

**Note:** If you want to bring your own MongoDB you can do so. However, you have to make sure to change the `server/config/development.yml` to include the configuration of your MongoDB.

:::warning
Take care to **NOT** commit & push files which include credentials of yours!
:::

## Running development versions

### Visual Studio Code

If you use Visual Studio Code (short 'Code') starting the development servers is easy. You can pick one of the preconfigured launch options listed below. Both servers (frontend & backend) have hot-reloading preconfigured.

-   `Launch NodeJS server`: This starts the development version of the backend. During start up the Code debugger will be automatically attached to the running server.
-   `Launch NodeJS server & client`: This starts both development servers (frontend & backend - in this order). The Code debugger will be attached to the backend.
-   `Launch Chrome`: _Needs a running frontend server!_ Will open a seperate Chrome instance and attach a Code debugger to the running frontend server.

    :::important Required extension
    The [Debugger for Chrome](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome) extension is required.
    :::

Please note: Sometimes starting the server initially takes longer than 10s resulting in a "timeout error" appearing in Code. However, you can configure the debugger in Code to auto attach to a running node process and it will connect after the server started.

### Command line

Both servers can be run manually from the command line using the `pnpm start` command in the respective folder (`client/` or `server/`) or using the command `pnpm start:server` and `pnpm start:client` in the root folder.

## Editor

The choice which editor to use is up to you. However the editor must have TypeScript support to be able to properly assist you during development.

Below you find two of all possible choices:

1. [Visual Studio Code](https://code.visualstudio.com/):
   (**Recommended**) The editor from Microsoft is the recommended editor due to the fact that this repository contains the configuration files for this editor. These configurations include for example the launch configurations for the development servers.

2. [Atom](https://atom.io/):
   The editor from GitHub is another editor which fully supports TypeScript. You can choose this editor, however, there aren't any configurations files for the atom editor at this moment available in this repository (you can include some in your PR if you want).

## Docker Image

To build a Docker image one can execute the `./build-docker-image.ts` file. This can also be achieved by executing one of the following npm scripts: `docker:build` and `docker:build:pre`. For more information see the section below.

### Script parameters

The `build-docker-image.ts` script takes in the following parameters but all are _optional_. If the parameter itself needs a value the value has to be put after a `=` (ie `--version=2.0.0`). The image will be tagged with "ghcr.io/dudrie/tutor-management-system" as a name followed by the version from the root `package.json` by default.

| Parameter                  | Short | Description                                                                                                                 |
| -------------------------- | ----- | --------------------------------------------------------------------------------------------------------------------------- |
| `--version=`               | `-v=` | Overrides the version used for the image tag. Must be followed by the semantic version which should be used (ie `-v=2.0.1`) |
| `--pre`                    | -     | If provided the image tag will get a `-pre` suffix after the version ("ghcr.io/dudrie/tutor-management-system:2.0.1-pre")   |
| `--bundle`                 | -     | The image will get bundled into a `.tar` file.                                                                              |
| `--no-version-in-tar-name` | -     | The generated `.tar` file will **not** contain the version of the image tag.                                                |

### Npm scripts

#### `docker:build`

This will run the `build-docker-image.ts` script.
One can specify all of the parameters above for this script aswell.
If you run `pnpm run docker:build` you can pass in the parameters after a `--`:

```cmd
pnpm run docker:build -- <additional params>
```

:::info PowerShell on Windows
The PowerShell on Windows treats the `--` in a special manner: It simply removes it from the command.
You have to wrap it in `""` (like `"--"`) to use it inside the PowerShell.
:::

#### `docker:build:pre`

Executes the `build-docker-image.ts` script with the `--pre` parameter.
Additional parameters can be provided aswell (see above).

#### `docker:build:tar`

Executes the `build-docker-image.ts` script with the `--bundle` parameter.
Additional parameters can be provided aswell (see above).

[fork-doc]: ./fork
