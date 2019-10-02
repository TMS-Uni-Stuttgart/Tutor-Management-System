# Get started
## Requirements
To get started you need a few development tools. The following are required to run and test your changes locally:
1. [NodeJS 10.x.x](https://nodejs.org)
  __Note:__ NodeJS 12.x.x might work aswell but 10.x.x is the officially supported version.
2. Package manager [yarn](https://yarnpkg.com)


While [Docker](https://docs.docker.com/install/) is not needed it helps you to set up your environment more easily. It's mostly used to spin up a MongoDB database on your system in closely to no time. If you don't use Docker you need to provide an alternative MongoDB database (_Note: Technically a `mongoose` compatible database should work aswell._) and to change the configuration in `server/config/default.yml`.

## Set up your environment
After pulling your fork and creating a new branch for your issue you have to setup the development environment first. After navigating into the repository folder (and installing all of the requirements above) install all needed npm packages by running the following command (_Please note that this might take some time for the first time installing._):
```sh
yarn
```

Now, you need a MongoDB for your development. The explanation below covers the setup with Docker and the provided `docker-compose.yml`. To setup the database just run:
```sh
docker-compose up -d mongo
```

If you want to get an administrative board to the database you can instead run:
```sh
docker-compose up -d mongo mongo-express
```
This starts the MongoDB aswell as a webinterface which connects to it. To access this interface visit [localhost:8081](localhost:8081).

__Note:__ If you want to bring your own MongoDB you can do so. However, you have to make sure to change the `server/config/default.yml` to include the configuration of your MongoDB. 
> ⚠ __Take care to NOT commit & push files which include credentials of yours!__

## Running development versions
### Visual Studio Code
If you use Visual Studio Code (short 'Code') starting the development servers is easy. You can pick one of the preconfigured launch options listed below. Both servers (frontend & backend) have hot-reloading preconfigured.
- `Launch NodeJS server`: This starts the development version of the backend. During start up the Code debugger will be automatically attached to the running server.
- `Launch NodeJS server & client`: This starts both development servers (frontend & backend - in this order). The Code debugger will be attached to the backend.
- `Launch Chrome`: _Needs a running frontend server!_ Will open a seperate Chrome instance and attach a Code debugger to the running frontend server. 
  > 📦 __The [Debugger for Chrome](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome) extension is required.__

### Command line
Both servers can be run manually from the command line using the `yarn start` command in the respective folder (`client/` or `server/`).

## Editor
The choice which editor to use is up to you. However the editor must have TypeScript support to be able to properly assist you during development.

Below you find two of all possible choices:

1. [Visual Studio Code](https://code.visualstudio.com/): 
  (__Recommended__) The editor from Microsoft is the recommended editor due to the fact that this repository contains the configuration files for this editor. These configurations include for example the launch configs for the dev servers.

2. [Atom](https://atom.io/): 
  The editor from GitHub is another editor which fully supports TypeScript. You can choose this editor, however, there aren't any configurations files for the atom editor at this moment (you can include some in your PR if you want).

## Docker image
One can build a Docker image from the project by simply using one of the following commands:

---
```sh
yarn docker:build<:pre>
```
Will create a docker image `tutor-management-system:latest` (or `tutor-management-system:pre` if the prefix `:pre` is provided) by first creating the build version and then bundling everything into one image. Afterwards the image is bundled in a `.tar` file in the project root.

---
```sh
yarn docker:build:image<:pre>
```
Will create a docker image `tutor-management-system:latest` (or `tutor-management-system:pre` if the prefix `:pre` is provided) by first creating the build version and then bundling everything into one image. This image is NOT bundled into a `.tar` file.

---
```sh
yarn docker:image:tar<:pre>
```
Will bundle the image `tutor-management-system:latest` (or `tutor-management-system:pre` if the prefix `:pre` is provided) into a `.tar` file. This command does NOT build the image first.

---

