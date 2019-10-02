# Contributing to the Tutor-Management-System

<!-- TODO: Introduction -->

## "I want to help"
If you want to work on an issue please check first if no one else is working on it. If no one is working on it please leave a comment that you start working.

See [get started](/GET_STARTED.md) for more information on how to setup your local development environment.

## Sending a Pull Request
A project like this one benefits from Pull Request. These Pull Request should not contain more than one bug fix or added feature at once. 

Here is a guideline on how to create your first pull request:

1. Fork the repository.

2. Clone the forked repository to your machine and add upstream remote.
```sh
git clone git@github.com:<yourname>/Tutor-Management-System.git
cd Tutor-Management-System
git remote add upstream git@github.com:dudrie/Tutor-Management-System.git
```

3. Synchronize your local `master` branch with the upstream one
```sh
git checkout master
git pull upstream master
```

4. Create a new branch for your work.
```sh
git checkout -b my-issue-branch
```

5. Add changes. Afterwards commit & push these to your fork.
```sh
git push -u
```

6. Go back to the [original repository](https://github.com/Dudrie/Tutor-Management-System) (not your fork) and open a pull request.

