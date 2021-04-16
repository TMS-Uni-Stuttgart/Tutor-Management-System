---
id: server-doc
title: Server API Documentation
sidebar_label: Server API
---

## Access Documentation

<!-- Please note that the "pathname://" syntax/protocol is an escape hatch solution provided by docusaurus because the do not have an other solution at the moment (https://github.com/facebook/docusaurus/issues/3894#issuecomment-740622170) -->

You can find the documentation of the server API [here](pathname:///server-doc) (opens in an external tab / window).

## Information about the Documentation

This documentation comes with a seperat and auto-generated documentation for the server API.
It uses [compodoc](https://compodoc.app/) to generate the documentation based on the modules, controllers, services, classes, ... present in the server.
The generator creates corresponding diagrams and uses the JSDoc (if present).

:::info Supported JSDoc tags
Please note that compodoc only support a few JSDoc tags. You can find a complete list of supported tags in the [compodoc documentation](https://compodoc.app/guides/jsdoc-tags.html).
:::

## Generate Documentation

The documentation for the server API is automatically generated upon running the build command for this documentation.

```cmd
pnpm build
```

However, you can just generate the documentation for the server by running the following command.
It will generate the documentation inside the `./static/server-doc/` folder inside the project for this documentation.

```cmd
pnpm docs:server
```

To just inspect the generated server docs you can run the following command inside the `docs/` project.

```cmd
pnpx compodoc -s -d ./static/server-doc/
```

This will start a webserver which serves the documentation of the server.
You can access it via `http://localhost:8080`.

:::warning Clashing ports
By default the compodoc webserver and the TMS server both use the port `8080`.
You can change the port used by compodoc by adding the `--port [port]` parameter to the command above.
:::
