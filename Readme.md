# Tutor Management System

![Unit Tests](https://github.com/Dudrie/Tutor-Management-System/workflows/Unit%20Tests/badge.svg)
![Code Quality](https://github.com/Dudrie/Tutor-Management-System/workflows/Code%20Quality/badge.svg)
![Build and push Docker image](https://github.com/Dudrie/Tutor-Management-System/workflows/Build%20and%20push%20Docker%20image/badge.svg)

The Tutor Management System (short _TMS_) aims to be a tool used at universities (in Germany). It can be used to track the requirements which a student has to fulfill to be allowed to attend the exam. It can (among other things) track the points gained by the students in their homeworks, how often a student attended the tutorial and how often a student presented a solution.

## Getting Started

You can find more information about how to set up your development environment in the [development environment guide](https://dudrie.github.io/Tutor-Management-System/docs/dev/setup-env).

## Deployment

For more information on how to deploy this tool please read the [installation guide](https://dudrie.github.io/Tutor-Management-System/docs/setup/installation) in the project documentation.

If you want to update your existing deployment to a new version please refer to the [update guide](https://dudrie.github.io/Tutor-Management-System/docs/setup/update).

## Built With

Here are the most important libraries listed which are used in any part of the project.

-   [TypeScript](https://typescriptlang.org) - Programming language.
-   [React](https://reactjs.org/) - Frontend framework.
-   [Material-UI](https://material-ui.com) - Frontend component library.
-   [NestJS](https://nestjs.com/) - Backend framework used.
-   [Formik](https://jaredpalmer.com/formik/) - Used to clean up the React mess in forms.
-   [axios](https://github.com/axios/axios) - Used to make the REST calls against the backend.
-   [mongoose](https://mongoosejs.com/) - Used to connect to the MongoDB.
-   [typegoose](https://github.com/typegoose/typegoose) - Makes working with mongoose documents & typescript easier.

The following tools are used in the maintaining & deploying processes.

-   [pnpm](https://pnpm.js.org/en/) - Used package manager.
-   [ESLint](https://eslint.org/) - Used to ensure code quality.
-   [Prettier](https://prettier.io/) - Used to ensure a unified code style.
-   [GitHub Actions](https://github.com/features/actions) - Used for CI.
-   [Node](https://nodejs.org/) - Runs the production server aswell as the development servers.
-   [ts-node](https://github.com/TypeStrong/ts-node) - Used to run `.ts` scripts directly on NodeJS without compiling them.
-   [Docker](https://www.docker.com/) - Used to build the docker images.

## Contributing

Please read [CONTRIBUTING.md](/CONTRIBUTING.md) for details on how to contribute to this project.

## Versioning

This project uses [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/Dudrie/Tutor-Management-System/tags).

<!-- ## License -->
