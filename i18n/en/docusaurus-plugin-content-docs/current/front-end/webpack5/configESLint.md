---
sidebar_position: 9
slug: config-eslint
title: Configure code checking tool ESLint
tags: [Webpack, packaging tool, front-end engineering, ESLint]
keywords:
  - Webpack
  - packaging tool
  - front-end engineering
  - ESLint
---

ESLint is an open source JavaScript code static analysis tool for discovering and fixing problems in the code. It was originally created by Nicholas C. Zakas in 2013 to provide a highly configurable linting tool that can be adjusted according to the needs of the project.

## Main functions and effects

- **Finding errors**: By statically analyzing the code, ESLint can identify potential errors and problems in the code, such as syntax errors, logical errors, etc., to help developers find and fix these problems in time during the coding process.

- **Code style consistency**: ESLint can configure a set of code style rules to ensure that team members follow the same coding standards when writing code, thereby improving the readability and maintainability of the code.
- **Improve code quality**: By applying various best practice rules, ESLint can help developers write more robust and reliable code, reduce runtime errors and potential security vulnerabilities.
- **Automatic code repair**: ESLint provides some automatic repair functions, which can automatically repair some code problems according to the configured rules, reducing the workload of developers.
- **Integrated development environment support**: ESLint can be integrated with various integrated development environments (IDEs) and code editors, such as VSCode, Sublime Text, etc., so that developers can get real-time feedback and prompts during the coding process.
- **Plugin extension**: ESLint supports plug-in extension functions to provide specialized linting rules for different frameworks and libraries (such as React, Vue, Angular, etc.) to meet the needs of specific projects.

By introducing ESLint, developers can find and solve code problems earlier in the coding process, ensure code quality and consistency, and thus improve the development efficiency and reliability of the entire project. The following will introduce how to configure ESLint in Webpack.

## Configuration file

Configuration files can be written in many ways:

- `.eslintrc.*`: create a new file, located in the project root directory

- `.eslintrc`

- `.eslintrc.js`

- `.eslintrc.json`

- The difference is that the configuration format is different

- `eslintConfig` in `package.json`: no need to create a file, write it based on the original file

ESLint will find and read them automatically, so only one of the above configuration files needs to exist\*\*

## Specific configuration

Let's take the `.eslintrc.js` configuration file as an example:

```js title=".eslintrc.js"
module.exports = {
  // Parsing options
  parserOptions: {},
  // Specific inspection rules
  rules: {},
  // Inherit other rules
  extends: [],
  // ...
  // For other rules, see: https://eslint.org/docs/latest/use/configure/configuration-files
};
```

#### parserOptions parsing options

```js
parserOptions: {
ecmaVersion: 2020, // ES syntax version
sourceType: "module", // ES modularization
ecmaFeatures: { // ES other features
jsx: true // If JSX is used in the project, you need to enable jsx syntax
}
}
```

#### rules specific rules

- `"off"` or `0` - turn off the rule
- `"warn"` or `1` - turn on the rule, use the warning level error: `warn` (will not cause the program to exit)

- `"error"` or `2` - turn on the rule, use the error level error: `error` (when triggered, the program will exit)

```js
rules: {
semi: "error", // prohibit the use of semicolons
'array-callback-return': 'warn', // force the array method callback function to have a return statement, otherwise a warning
'default-case': [
'warn', // require the switch statement to have a default branch, otherwise a warning
{ commentPattern: '^no default$' } // allow the comment no default at the end, there will be no warning
],
eqeqeq: [
'warn', // force the use of === and !==, otherwise a warning
'smart', // except for a few cases, there will be no warning
],
}
```

For more rules, see: [Rule Documentation](https://eslint.org/docs/latest/use/configure/rules)

#### extends inheritance

It is too laborious to write rules little by little during development, so there is a better way to inherit existing rules.

The following are some of the more famous rules:

- [ESLint official rules](https://eslint.org/docs/latest/use/configure/rules): `eslint:recommended`
- [Vue Cli official rules](https://github.com/vuejs/vue-cli/tree/dev/packages/@vue/cli-plugin-eslint): `plugin:vue/essential`
- [React Cli official rules](https://github.com/facebook/create-react-app/tree/main/packages/eslint-config-react-app): `react-app`

```js title=".eslintrc.js"
// For example, in a React project, we can write the configuration like this
module.exports = {
  extends: ['react-app'],
  rules: {
    // Our rules will override the react-app rules
    // So if you want to modify the rules, just change them directly
    eqeqeq: ['warn', 'smart'],
  },
};
```

## Use in Webpack

### Install dependencies

```bash npm2yarn
npm i eslint-webpack-plugin eslint -D
```

### Modify ESLint configuration file

```js title=".eslintrc.js"
module.exports = {
  // Inherit ESLint rules
  extends: ['eslint:recommended'],
  env: {
    node: true, // Enable global variables in node
    browser: true, // Enable global variables in browser
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    'no-var': 2, // Cannot use var to define variables
  },
};
```

```js title="webpack.config.js"
const path = require('path');
// highlight-next-line
const ESLintWebpackPlugin = require('eslint-webpack-plugin');

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'static/js/main.js', // Output js files to the static/js directory
    clean: true, // Automatically clear the last package directory resources
  },
  module: {
    rules: [
      {
        // Used to match files ending with .css
        test: /\.css$/,
        // The order of Loader execution in the use array is from right to left
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader'],
      },
      {
        test: /\.s[ac]ss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.styl$/,
        use: ['style-loader', 'css-loader', 'stylus-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|webp)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024, // Images less than 10kb will be processed by base64
          },
        },
        generator: {
          // Output image files to the static/imgs directory
          // Name the image files [hash:8][ext][query]
          // [hash:8]: The hash value is 8 digits
          // [ext]: Use the previous file extension
          // [query]: Add the previous query parameter
          filename: 'static/imgs/[hash:8][ext][query]',
        },
      },
      {
        test: /\.(ttf|woff2?)$/,
        type: 'asset/resource',
        generator: {
          filename: 'static/media/[hash:8][ext][query]',
        },
      },
    ],
  },
  // highlight-start
  plugins: [
    new ESLintWebpackPlugin({
      // Specify the root directory of the check file
      context: path.resolve(__dirname, 'src'),
    }),
  ],
  // highlight-end
  mode: 'development',
};
```

You can use it in Webpack at this time ESLint checks the code. The following sample code verifies whether ESLint is effective:

```js title="src/main.js"
import count from './js/count';
import sum from './js/sum';
import './css/index.css';
import './less/index.less';
import './sass/index.sass';
import './sass/index.scss';
import './styl/index.styl';

// highlight-start
var result1 = count(2, 1);
console.log(result1);
var result2 = sum(1, 2, 3, 4);
console.log(result2);
// highlight-end
```

## Run command

```bash
npx webpack
```

View the ESLint check effect in the console

![Effect image](https://tecent-oss-shanghai.eaveluo.com/img/202406281135160.png?imageSlim)

## VSCode ESLint plugin

At this time, you need to compile every time to see the error, which is a bit troublesome. We can use VSCode ESLint Plugin, you can see errors without compiling, and you can solve them in advance.

But at this time, ESLint will be checked by default for all files in the project, and the packaged files in our dist directory will report errors. But we only need to check the files under src, not the files under dist.

So you can use ESLint to ignore files. Create the following file in the project root directory:

```bash title=".eslintignore"
# Ignore all files in the dist directory
dist
```
