---
id: build-release
title: Build & Release
sidebar_label: Build & Release
---

## Build Docker Image

**TODO: Update content**

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
Otherwise pnpm will throw an error.
:::

#### `docker:build:pre`

Executes the `build-docker-image.ts` script with the `--pre` parameter.
Additional parameters can be provided aswell (see above).

#### `docker:build:tar`

Executes the `build-docker-image.ts` script with the `--bundle` parameter.
Additional parameters can be provided aswell (see above).

## Release

**TODO: Write page**
