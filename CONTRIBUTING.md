# Contributing to the Tutor-Management-System

🥳 Thank you that you want to help this project to become a better one. The following sections will provide a short overview over all important aspects if you want to contribute.

## "I want to help"

If you want to work on an issue please check first if no one else is working on it. If no one is working on it please leave a comment that you start working.

See [Development Environment](https://github.com/Dudrie/Tutor-Management-System/wiki/Development-Environment) in the wiki for more information on how to setup your local development environment.

While all of the below refers to the git command line interface you can achieve a lot of this by using the [GitHub Desktop client](https://desktop.github.com/) _(This tool is currently only available for Windows & MacOS)_.

## Sending a Pull Request

Contributing to a project like this one is done through Pull Requests. These help to maintain the code and to make sure new additions or fixes are accepted first before merged into the `master` branch.

Here is a guideline on how to create your first pull request:

1. Fork the repository.

2. Clone the forked repository to your machine and add the upstream remote. This way you can merge changes from the original repository into your fork if needed.

```sh
git clone git@github.com:<yourname>/Tutor-Management-System.git
cd Tutor-Management-System
git remote add upstream git@github.com:dudrie/Tutor-Management-System.git
```

3. Synchronize your local `master` branch with the upstream one to be up-to-date.

```sh
git checkout master
git pull upstream master
```

4. Create a new branch for your work (replace `<my-issue-branch>` with a more fitting name).

```sh
git checkout -b <my-issue-branch>
```

5. Add changes. Afterwards commit & push these to your fork. For more information on how to describe your commits see [Commits section](#commits).

```sh
git push -u
```

6. Go back to the [original repository](https://github.com/Dudrie/Tutor-Management-System) (not your fork) and open a pull request.

## Commits

To make commits useful and easy to read they follow a simple naming principle: The name **starts with a verb** as such that it could be prefixed with _"This commit will..."_. Here are a few examples which are okay (✔) and which are not (❌):

> ✔ Fix the bug in tutorial creation

> ✔ Fix issue #10

> ✔ Add a timeout before retry to connect to MongoDB.

> ❌ Students have a status now.

Those fit in the sentence like this:

-   _This commit will_ fix the bug in tutorial creation.
-   _This commit will_ fix issue #10
-   _This commit will_ add a timeout before retry to connect to MongoDB.

If you want (or need) to provide more information you can simple add a description to your commit by adding a new paragraph to the commit message:

```
Add a timeout before retry to connect to MongoDB.

Now, the server waits 1 second before trying again to connect to the MongoDB if the first connection try failed.
```
