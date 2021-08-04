---
id: installation
title: Installation
sidebar_label: Installation
---

## Requirements

- [Docker](https://docs.docker.com/install/): The provided container image is a docker image for Linux containers therefore you need Docker to be able to run it.
- [Docker-Compose](https://docs.docker.com/compose/install/): While technically not required it helps you to get up the container(s) more easily.

## Installation

### Information about `sudo`

If you need to run docker (and docker-compose) with sudo right you have to prefix all following `docker-compose` and `docker` commands with `sudo`.
Furthermore, keep in mind adding the `-E` flag to the `sudo` command if the docker or docker-compose rely on environment variables so those get passed down, for example:

```shell
sudo -E docker-compose up
```

### Step-by-Step

This Step-by-Step guide uses docker-compose to set up the containers. You can find a sample [docker-compose.yml file here](../assets/docker-compose.yml). All steps marked with _(optional)_ can safely be skipped.

If you want to use `docker` commands instead of docker-compose you can find a list of those [below](#commands) aswell.

:::caution
If you are on a machine that requires manually starting the docker engine do so now.
:::

1. **Download** all configuration files as stated in the "Configuration" section of the [latest release][latest-release] (or the release you want to use).

1. **Unzip** the downloaded configuration files into a folder of your choice. The Step-by-Step guide assumes it is called `config/`.

   Those files contain a configuration file and some template files. For more information read the [Configuration][config-doc] page on this documentation.

   :::tip
   All important adjustments you have to make are described here as well.
   :::

1. **Download** the [`docker-compose.yml` file](../assets/docker-compose.yml) from this documentation.

1. **Adjust** the `docker-compose.yml` file:

   1. **Replace** `<version>` in the `tms-server` service with the version you want to use. You can also use `latest` as a tag but this makes updating the version harder in future.

      :::note Available versions
      You can find a list of the available versions [here][docker-image-versions].
      :::

   1. **Replace** `<path-to-CONFIG>` with the _relative_ path to the `config/` folder (relative to the `docker-compose.yml`). Leave the destination side _untouched_!

   1. **Replace** `<path-to-DB-FOLDER>` with the _relative_ path (relative to the `docker-compose.yml`) to the folder you want to store your database data in.

      :::caution
      Make sure the path you enter is **writeable**! If it is not (or you omit volume from the mongo container) the database data will **NOT** be persistent on the host and therefore can be lost if the container gets recreated!
      :::

   1. **Add** the nginx service as described in the [Setup with nginx section][nginx-doc] of this documentation. Nginx (or a similar proxy) is the recommand way to setup HTTPS for the Tutor-Management-System.

      :::note
      Please note that the tms-server container does **not** need to expose the port to the public. The nginx container and the tms-server container just need to be in the same docker network (see below).
      :::

      :::important Use existing nginx
      If you already have a running nginx or want to use a different proxy you can skip this step. However, it is highly recommended that you properly setup TSL/HTTPS for the TMS in either way.
      :::

1. _(optional)_ **Adjust** the `production.yml` configuration file. You can find more information about the individual entries on the [Configuration page](./configuration#applicationconfiguration).

1. _(optional)_ **Adjust** the pug templates. You can find more information about the templates and their placeholders on the [Configuration page](./configuration#pug-templates).

1. **Start** all services. This will create all containers of the services on the first start.

   1. **Open** a terminal and navigate to the folder containing the `docker-compose.yml`.

   1. **Export** the following environment variables in the terminal:

      | Env-Variable     | Purpose                                                                            |
      | ---------------- | ---------------------------------------------------------------------------------- |
      | `MONGO_USER`     | Username used to authenticate on the MongoDB.                                      |
      | `MONGO_PASSWORD` | Password used to authenticate on the MongoDB.                                      |
      | `TMS_SECRET`     | Secret to use to encrypt and decrypt sensitive database entries. **Keep it safe!** |

      :::caution
      They must be **exported** or else the docker-compose child process will not have access to them.
      :::

   1. **Run** the following command to create and start all the containers:

      ```shell
      sudo -E docker-compose up
      ```

      :::note
      Remember to put in the `-E` parameter so your environment variables get passed down to the process running docker-compose.
      :::

   1. **Check** that the presented logs do **NOT** contain any errors and that all services start successfully.

   1. _(optional)_ **Stop** all containers by quitting the process (`Ctrl + C`).

   1. _(optional)_ **Restart** all containers with the following command (please note the additional `-d`). This time the terminal will not hook into the container logs.

      ```shell
      sudo -E docker-compose up -d
      ```

1. **Login** as administrator. The TMS creates the credentials for the administrator on the first start. The credentials are `admin` for the username and `admin` (all lowercase) for the password. You are prompted to change your password on the first login (see [First Login](../handbook/login#first-login)).

   :::note
   You can also change the username of the administrator in the user management if you want to.
   :::

### Use `docker`

- **Create** a network for the MongoDB and the TMS containers:

  ```shell
  docker network create tms_db
  ```

- _(optional)_ **Create** a network for the nginx and the TMS containers (if not already done in the Setup with nginx part):

  ```shell
  docker network create proxy_network
  ```

- **Create** the MongoDB container and starting it:

  :::caution
  Remember to replace `<path-to-DB-FOLDER>` with the **absolute** path to the folder in which you want the database data to be stored in.
  :::

  ```shell
  docker run --name mongo --restart always --net tms_db -e MONGO_INITDB_ROOT_USERNAME=$MONGO_USER -e MONGO_INITDB_ROOT_PASSWORD=$MONGO_PASSWORD -v <path-to-DB-FOLDER>:/data/db -d mongo
  ```

* **Create** the TMS container and starting it:

  :::caution
  Remember to replace `<path-to-CONFIG>` with the **absolute** path to the folder containing the config files for the TMS.
  :::

  :::tip
  If you do not want to use the `proxy_network` you can remove the `--net proxy_network` part. But keep in mind that the nginx container and the TMS container will not be in the same network afterwards.
  :::

  ```shell
  docker run --name tms-server --restart on-failure:1 --net tms_db --net proxy_network -e TMS_MONGODB_USER=$MONGO_USER -e TMS_MONGODB_PW=$MONGO_PASSWORD -e TMS_SECRET=$TMS_SECRET -v <path-to-CONFING>:/tms/server/config ghcr.io/dudrie/tutor-management-system
  ```

## TLS / HTTPS

The TMS server itself does NOT support TLS / HTTPS. The reason why TLS did not (and still does not) have a high priority is simple: Most servers already use a proxy (like [nginx][nginx]) which handle SSL for all services running on the server. Furthermore, using a proxy is the recommended way of using an express server according to the [express documentation](http://expressjs.com/en/advanced/best-practice-security.html#use-tls).

If your server does not already use a proxy you should consider adding one. For more information on how to setup TMS with nginx see the [Setup with Nginx guide][nginx-doc].

However if you cannot (or do not want to) use a proxy on your server you can add the TLS support for the NestJS in a forked version of the repository following the [NestJS HTTPS guide][nestjs-https-guide].

[config-doc]: ./configuration/
[nginx-doc]: ./nginx/
[docker-image-versions]: https://github.com/users/Dudrie/packages/container/tutor-management-system/versions
[latest-release]: https://github.com/Dudrie/Tutor-Management-System/releases/latest
[mongo-docker]: https://hub.docker.com/_/mongo
[nestjs-https-guide]: https://docs.nestjs.com/faq/multiple-servers#https
[nginx]: https://www.nginx.com/
