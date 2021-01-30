---
id: update
title: Update
sidebar_label: Update
---

To update an existing version of the TMS on your docker just follow the steps bellow. _Please note: Some commands rely on `docker-compose`._

1. **Navigate** to the folder which contains the `docker-compose.yml` file you used to create the server.

1. **Stop** the container running the TMS server by executing

    ```sh
    docker-compose stop tms-server
    ```

    :::note
    You can use `docker` instead of `docker-compose` as well.
    :::

1. **Update** the version of your image. This step depends on wether a version tag is used or not:

    1.1 If a version tag is used: Update the version tag of the `dudrie/tutor-management-system` image in the `docker-compose.yml` file.

    1.2 If **no** version tag is used: Run the following command to update your local image to the `latest` version:

    ```sh
    docker pull ghcr.io/dudrie/tutor-management-system:latest
    ```

    :::caution In both cases
    Please refer to the "Configuration" section of the corresponding [release](https://github.com/Dudrie/Tutor-Management-System/releases) to check if the configuration files have been updated and if any changes are required. If so apply all necessary changes before moving forward.
    :::

1. **Export** the environment variables as descriped in the [Step-by-Step Guide](./installation/#step-by-step). Those are needed again because the TMS container will get recreated.

1. **Start** the container with the new image by running the following command. This will automatically recreate the container.

    ```sh
    docker-compose up -d tms-server
    ```

1. _(optional)_ If you want to clean your docker images you can run

    ```sh
    docker image prune
    ```

    :::caution
    This will clean **all unused** images not only the old TMS image!
    :::
