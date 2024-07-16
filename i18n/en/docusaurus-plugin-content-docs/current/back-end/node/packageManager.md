---
sidebar_position: 10
slug: package-manager
title: Package Manager
description: Introduces the functions, advantages and disadvantages of the commonly used package managers npm, Yarn and pnpm in Node.js.
tags: [Node.js, Package Manager, npm, Yarn, pnpm]
keywords:
  - Node.js
  - Package Manager
  - npm
  - Yarn
  - pnpm
---

In Node.js, commonly used package managers include npm, Yarn and pnpm. Each package manager has its own unique functions and advantages. The following details their characteristics, usage methods, common commands, and the difference between production dependencies and development dependencies.

## npm (Node Package Manager)

### Overview

npm is the default package manager for Node.js and the most popular package management tool. It allows developers to download, install, update and manage dependency packages in Node.js projects.

### Installation and initialization

The Node.js installation package comes with npm, so no additional installation is required.

Initialize a new Node.js project:

```bash
npm init
```

Or quick initialization (with default settings):

```bash
npm init -y
```

### Common commands

- **Install package**

Install and save to `dependencies`:

```bash
npm install package-name
```

Install and save to `devDependencies`:

```bash
npm install package-name --save-dev
```

- **Uninstall package**

```bash
npm uninstall package-name
```

- **Update package**

```bash
npm update package-name
```

- **Globally installed package**

```bash
npm install -g package-name
```

- **View globally installed packages**

```bash
npm list -g --depth=0
```

- **View the packages in the project**

```bash
npm list --depth=0
```

- **Check outdated packages**

```bash
npm outdated
```

### Configuration file

The `package.json` file contains basic information about the project, a list of dependent packages, and other configurations.

## Yarn

### Overview

Yarn is a new package management tool jointly developed by Facebook, Google, Exponent, and Tilde. It is compatible with npm and provides some improvements, such as faster installation speed, more reliable installation process, and better dependency management.

### Installation and initialization

You can install Yarn through npm:

```bash
npm install -g yarn
```

Initialize a new Node.js project:

```bash
yarn init
```

### Common commands

- **Install package**

Install and save to `dependencies`:

```bash
yarn add package-name
```

Install and save to `devDependencies`:

```bash
yarn add package-name --dev
```

- **Uninstall package**

```bash
yarn remove package-name
```

- **Update package**

```bash
yarn upgrade package-name
```

- **Global installation package**

```bash
yarn global add package-name
```

- **View globally installed packages**

```bash
yarn global list
```

- **View packages in the project**

```bash
yarn list --depth=0
```

- **Check for outdated packages**

```bash
yarn outdated
```

### Configuration files

The `package.json` file also applies to Yarn. In addition, Yarn will also generate a `yarn.lock` file to lock the version of the dependency package to ensure that everyone in the team installs the same dependency version.

## pnpm

### Overview

pnpm is a fast and efficient package manager. It is compatible with npm and Yarn, and uses hard links and symbolic links to reduce disk space usage and installation time.

### Installation and initialization

You can install pnpm through npm:

```bash
npm install -g pnpm
```

Initialize a new Node.js project:

```bash
pnpm init
```

### Common commands

- **Install package**

Install and save to `dependencies`:

```bash
pnpm add package-name
```

Install and save to `devDependencies`:

```bash
pnpm add package-name --save-dev
```

- **Uninstall package**

```bash
pnpm remove package-name
```

- **Update package**

```bash
pnpm update package-name
```

- **Global installation package**

```bash
pnpm add -g package-name
```

- **View globally installed packages**

```bash
pnpm list -g --depth=0
```

- **View the packages in the project**

```bash
pnpm list --depth=0
```

- **Check outdated packages**

```bash
pnpm outdated
```

### Configuration files

`package.json` files also apply to pnpm. pnpm also generates a `pnpm-lock.yaml` file to lock the version of the dependent package.

## Production dependencies and development dependencies

In Node.js projects, dependent packages are usually divided into production dependencies (dependencies) and development dependencies (devDependencies).

### Production dependencies (dependencies)

Production dependencies are dependent packages required by the project at runtime. These packages are essential to the core functionality of the project and are usually included in the `dependencies` field.

Install and save to production dependencies:

```bash
npm install package-name
yarn add package-name
pnpm add package-name
```

### Development Dependencies

Development dependencies are dependency packages that are only used in the development environment, such as test frameworks, build tools, and development servers. These packages will not be used in the production environment and are usually included in the `devDependencies` field.

Install and save to development dependencies:

```bash
npm install package-name --save-dev
yarn add package-name --dev
pnpm add package-name --save-dev
```

### Configuration file example

Dependency configuration in `package.json`:

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.17.1"
  },
  "devDependencies": {
    "jest": "^26.6.3"
  }
}
```

## Comparison

### Speed

- **npm**: comes with Node.js, but is slightly slower to install than Yarn and pnpm.

- **Yarn**: uses parallel installation and caching mechanisms, usually faster than npm.

- **pnpm**: reduces disk space and installation time through hard links and symbolic links, and is the fastest.

### Security

- **npm**: No mandatory verification in the default configuration.
- **Yarn**: By default, the checksum of each package is checked to ensure that the downloaded package has not been tampered with.
- **pnpm**: Also has high security, and ensures consistency through version lock files.

### Dependency Management

- **npm** and **Yarn**: Use `package-lock.json` and `yarn.lock` files to lock the versions of dependent packages.
- **pnpm**: Use `pnpm-lock.yaml` files and manage dependencies through a unique hard link mechanism.

### Command comparison

| Function                      | npm command                   | Yarn command                   | pnpm command               |
| ----------------------------- | ----------------------------- | ------------------------------ | -------------------------- |
| Initialize project            | `npm init`                    | `yarn init`                    | `pnpm init`                |
| Install dependencies          | `npm install`                 | `yarn`                         | `pnpm install`             |
| Add dependencies              | `npm install package-name`    | `yarn add package-name`        | `pnpm add package-name`    |
| Delete dependencies           | `npm uninstall package-name`  | `yarn remove package-name`     | `pnpm remove package-name` |
| Update dependencies           | `npm update package-name`     | `yarn upgrade package-name`    | `pnpm update package-name` |
| Install dependencies globally | `npm install -g package-name` | `yarn global add package-name` | `pnpm add -g package-name` |
| View global dependencies      | `npm list -g --depth=0`       | `yarn global list`             | `pnpm list -g --depth=0`   |
| View local dependencies       | `npm list --depth=0`          | `yarn list --depth=0`          | `pnpm list --depth=0`      |
| Check outdated dependencies   | `npm outdated`                | `yarn outdated`                | `pnpm outdated`            |

## Conclusion

npm, Yarn, and pnpm are the three most commonly used package managers in Node.js, each with its own advantages and disadvantages. npm is the default package manager for Node.js, which is widely used and supported by the community. Yarn provides some improvements, such as faster installation speed and better dependency management. pnpm has become a strong competitor with efficient disk usage and faster installation speed. Developers can choose a suitable package manager based on project requirements and team habits. Understanding the difference between production dependencies and development dependencies will help better manage project dependencies and environments.
