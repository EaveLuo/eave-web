---
    sidebar_position: 9
    slug: config-eslint
    title: 配置代码检查工具 ESLint
    tags: [Webpack, 打包工具, 前端工程化, ESLint]
    keywords:
    - Webpack
    - 打包工具
    - 前端工程化
    - ESLint
---

ESLint 是一个开源的 JavaScript 代码静态分析工具，用于发现和修复代码中的问题。它最初由 Nicholas C. Zakas 于 2013 年创建，旨在提供一个高度可配置的 linting 工具，可以根据项目的需求进行调整。

## 主要功能和作用

- **发现错误**：通过静态分析代码，ESLint 可以识别出代码中的潜在错误和问题，如语法错误、逻辑错误等，帮助开发者在编码过程中及时发现和修复这些问题。
- **代码风格一致性**：ESLint 可以配置一套代码风格规则，确保团队成员在编写代码时遵循相同的编码规范，从而提高代码的可读性和维护性。
- **提高代码质量**：通过应用各种最佳实践规则，ESLint 可以帮助开发者编写出更健壮和更可靠的代码，减少运行时错误和潜在的安全漏洞。
- **自动修复代码**：ESLint 提供了一些自动修复功能，可以根据配置的规则自动修复部分代码问题，减少开发者的工作量。
- **集成开发环境支持**：ESLint 可以与各种集成开发环境（IDE）和代码编辑器集成，如 VSCode、Sublime Text 等，使得开发者在编码过程中实时获得反馈和提示。
- **插件扩展**：ESLint 支持通过插件扩展功能，为不同的框架和库（如 React、Vue、Angular 等）提供专门的 linting 规则，从而满足特定项目的需求。

通过引入 ESLint，开发者可以在编码过程中更早地发现并解决代码问题，确保代码质量和一致性，从而提高整个项目的开发效率和可靠性，下列将介绍如何在 Webpack 中配置 ESLint。

## 配置文件

配置文件由很多种写法：

- `.eslintrc.*`：新建文件，位于项目根目录
  - `.eslintrc`
  - `.eslintrc.js`
  - `.eslintrc.json`
  - 区别在于配置格式不一样
- `package.json` 中 `eslintConfig`：不需要创建文件，在原有文件基础上写

ESLint 会查找和自动读取它们，所以以上配置文件**只需要存在一个即可**

## 具体配置

我们以 `.eslintrc.js` 配置文件为例：

```js title=".eslintrc.js"
module.exports = {
  // 解析选项
  parserOptions: {},
  // 具体检查规则
  rules: {},
  // 继承其他规则
  extends: [],
  // ...
  // 其他规则详见：https://eslint.org/docs/latest/use/configure/configuration-files
};
```

#### parserOptions 解析选项

```js
parserOptions: {
  ecmaVersion: 2020, // ES 语法版本
  sourceType: "module", // ES 模块化
  ecmaFeatures: { // ES 其他特性
    jsx: true // 如果项目中使用 JSX，就需要开启 jsx 语法
  }
}
```

#### rules 具体规则

- `"off"` 或 `0` - 关闭规则
- `"warn"` 或 `1` - 开启规则，使用警告级别的错误：`warn` (不会导致程序退出)
- `"error"` 或 `2` - 开启规则，使用错误级别的错误：`error` (当被触发的时候，程序会退出)

```js
rules: {
  semi: "error", // 禁止使用分号
  'array-callback-return': 'warn', // 强制数组方法的回调函数中有 return 语句，否则警告
  'default-case': [
    'warn', // 要求 switch 语句中有 default 分支，否则警告
    { commentPattern: '^no default$' } // 允许在最后注释 no default, 就不会有警告了
  ],
  eqeqeq: [
    'warn', // 强制使用 === 和 !==，否则警告
    'smart', // 除了少数情况下不会有警告
  ],
}
```

更多规则详见：[规则文档](https://eslint.org/docs/latest/use/configure/rules)

#### extends 继承

开发中一点点写 rules 规则太费劲了，所以有更好的办法，继承现有的规则。

现有以下较为有名的规则：

- [ESLint 官方的规则](https://eslint.org/docs/latest/use/configure/rules)：`eslint:recommended`
- [Vue Cli 官方的规则](https://github.com/vuejs/vue-cli/tree/dev/packages/@vue/cli-plugin-eslint)：`plugin:vue/essential`
- [React Cli 官方的规则](https://github.com/facebook/create-react-app/tree/main/packages/eslint-config-react-app)：`react-app`

```js title=".eslintrc.js"
// 例如在React项目中，我们可以这样写配置
module.exports = {
  extends: ['react-app'],
  rules: {
    // 我们的规则会覆盖掉react-app的规则
    // 所以想要修改规则直接改就是了
    eqeqeq: ['warn', 'smart'],
  },
};
```

## 在 Webpack 中使用

### 安装依赖

```bash npm2yarn
npm i eslint-webpack-plugin eslint -D
```

### 修改 ESLint 配置文件

```js title=".eslintrc.js"
module.exports = {
  // 继承 ESLint 规则
  extends: ['eslint:recommended'],
  env: {
    node: true, // 启用node中全局变量
    browser: true, // 启用浏览器中全局变量
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    'no-var': 2, // 不能使用 var 定义变量
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
    filename: 'static/js/main.js', // 将 js 文件输出到 static/js 目录中
    clean: true, // 自动将上次打包目录资源清空
  },
  module: {
    rules: [
      {
        // 用来匹配 .css 结尾的文件
        test: /\.css$/,
        // use 数组里面 Loader 执行顺序是从右到左
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
            maxSize: 10 * 1024, // 小于10kb的图片会被base64处理
          },
        },
        generator: {
          // 将图片文件输出到 static/imgs 目录中
          // 将图片文件命名 [hash:8][ext][query]
          // [hash:8]: hash值取8位
          // [ext]: 使用之前的文件扩展名
          // [query]: 添加之前的query参数
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
      // 指定检查文件的根目录
      context: path.resolve(__dirname, 'src'),
    }),
  ],
  // highlight-end
  mode: 'development',
};
```

此时就可以在 Webpack 中使用 ESLint 检查代码了，下列示例代码来检验 ESLint 是否生效：

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

## 运行指令

```bash
npx webpack
```

在控制台查看 ESLint 检查效果

![效果图](https://tecent-oss-shanghai.eaveluo.com/img/202406281135160.png?imageSlim)

## VSCode ESLint 插件

此时需要每次编译才能看到错误，有点麻烦，我们可以使用 VSCode ESLint 插件，即可不用编译就能看到错误，可以提前解决。

但是此时就会对项目所有文件默认进行 ESLint 检查了，我们 dist 目录下的打包后文件就会报错。但是我们只需要检查 src 下面的文件，不需要检查 dist 下面的文件。

所以可以使用 ESLint 忽略文件解决。在项目根目录新建下面文件:

```bash title=".eslintignore"
# 忽略dist目录下所有文件
dist
```
