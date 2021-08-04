---
id: nginx
title: Setup with Nginx
sidebar_label: Nginx
---

## Introduction

This section covers how to set up [nginx][nginx] for the Tutor-Management-System (or your server in general). As for the installation itself docker is required because this setup steps through setting up a docker container running nginx. Furthermore, the steps assume you use docker-compose to set up the nginx container, but you can find the corresponding commands [below](#commands).

## Step-by-Step

### Using one docker-compose file

These sections should be considered a part of the [installation guide][installation-doc].
It assumes that you use docker-compose to manage the setup of all required containers.
However, if you want to use `docker` commands instead you can find a list of those [below](#commands) aswell.

:::tip
If you do _not_ want to put the nginx and the tms in the same docker-compose file you can find an explanation on how to do so [below](#using-two-docker-compose-files).
:::

1. **Download** the sample nginx configuration files [from the documentation](../assets/nginx-sample.zip).

1. **Unzip** the downloaded files into a folder of your choice. The Step-by-Step guide assumes it is called `nginx/`.

   Those files contain a `nginx.conf` file and a `sites/` folder with more `*.conf` files and folders in it.
   They contain a tested default configuration that works on most systems out-of-the-box.

   :::caution
   Make sure you do **NOT** put the `nginx/` folder inside the `config/` folder used for the TMS itself.
   :::

1. **Verify** that you have the following folder and files present:

   ```
   - nginx/
   |--+ certs/ (empty folder)
   |--| sites/
      |--| sites-available/
      |--|--+ tms.conf
      |--+ sites-enabled/ (empty folder)
      |--+ common_location.conf
      |--+ common.conf
      |--+ nginx.conf
      |--+ ssl.conf
   ```

1. **Gather** your SSL certificates and put them in a folder which can be mounted into the docker container. This Step-by-Step guide assumes they are in the `certs/` folder shown above.

   :::tip
   If you do not have a certificate you can use one from the CA [Let's Encrypt][lets-encrypt].
   :::

1. **Open** the `tms.conf` file inside the `sites/sites-available/` folder and make the following adjustment:

   1. **Replace** _all_ `<URL>` occurrences with the url (without protocol!) of your server
      \_For example: Your TMS instance has the URL `https://my-tms-instance.de` you only put `my-tms-instance.de` there.

      :::note
      If the TMS instance should be reachable through several URLs you can put all of them in there seperated with **spaces**, for example:

      ```
      server_name www.my-tms-instance.de my-tms-instance.de other-url.com;
      ```
      :::

   1. **Replace** `<PUBLIC_KEY>` with the _absolute_ path the public key will be _in the container_. For the example docker-compose service and folders this would be

      ```
      ssl_certificate /etc/nginx/certs/fullchain.pem;
      ```

   1. **Replace** `<PRIVATE>` with the _absolute_ path the private key will be _in the container_. For the example docker-compose service and folders this would be

      ```
      ssl_certificate_key /etc/nginx/certs/privkey.pem;
      ```

      :::important
      If you want to use your certificate for other configured sites aswell just move the entries `ssl_certificate` and `ssl_certificate_key` into the `ssl.conf` file found in the `sites/` folder. Remember to `include` the `ssl.conf` file in additional site configurations.
      :::

   1. **Verify** that the URL in the location `/` after `proxy_pass` matches the name of the TMS container followed by the port the server listens on (by default the name is `tms-server` and the port is `8080`).

1. **Create** a symbolic link inside the `sites-enabled/` folder which points to the `tms.conf` file by executing the following command inside the `sites-enabled/` folder:

   ```shell
   ln -s ../sites-available/tms.conf .
   ```

1. _(optional)_ You can add more sites to your nginx configuration by:

   1. **Create** a new `conf`-file inside the `sites-available/` folder containing the necessary configuration.

   1. **Create** a symbolic link inside the `sites-enabled/` folder which points to your created `conf`-file

      ```shell
      ln -s ../sites-available/<NAME-OF-FILE> .
      ```

1. **Add** the nginx service to your docker-compose file used during the installation. You can find the service in [this sample docker-compose file](../assets/docker-compose-nginx.yml).

   :::caution
   Make sure that the mounted folders match the ones you want to mount (if your folders have different names than this Step-by-Step guide assumes).
   :::

1. **Proceed** with the rest of the [installation guide][installation-doc-step-by-step].

### Using two docker-compose files

If you want to use different docker-compose files for nginx and the TMS follow these additional steps to get both containers into the same network:

1. **Create** a new docker network called "proxy_network" by running:

   ```shell
   docker network create proxy_network
   ```

   :::tip
   You can change the name to be what-ever you like but remember it for later.
   :::

1. **Change** the `proxy_network` property in the `networks` section of **both** docker-compose files to be like this:

   ```yml
   networks:
     proxy_network:
       external:
         name: proxy_network
   ```

   :::caution Use correct name of network
   If you changed the name earlier make sure to change the value of the `name` **attribute** accordingly.
   :::

### Commands

1. **Create** the proxy network

   ```shell
   docker network create proxy_network
   ```

1. **Create** the nginx container (_without_ starting it):

   ```shell
   docker create --name nginx --restart always -p 80:80 -p 433:433 --net proxy_network -v $PWD/nginx/nginx.conf:/etc/nginx/nginx.conf -v $PWD/nginx/sites:/etc/nginx/sites -v $PWD/nginx/certs:/etc/nginx/certs nginx
   ```

   :::caution
   Please note: If you renamed the `nginx/` and/or `certs/` folder make sure to adjust the corresponding volumes (`-v`) accordingly. All paths must be _absolute_ paths.
   :::

1. _(after completing the rest of the installation)_ **Start** the nginx container:

   ```shell
   docker start nginx
   ```

   :::warning
   You have to start the server of the TMS **before** starting nginx. Otherwise, nginx will throw an error and stop.
   :::

<!-- LINKS -->

[installation-doc]: ./installation/
[installation-doc-step-by-step]: ./installation/#step-by-step
[lets-encrypt]: https://letsencrypt.org/
[nginx]: https://www.nginx.com/
