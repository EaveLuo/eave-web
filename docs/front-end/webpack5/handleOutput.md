---
    sidebar_position: 6
    slug: handle-output
    title: 修改输出资源的名称和路径
    description: 介绍如何修改 Webpack 输出资源的名称和路径
    tags: [Webpack, 打包工具, 前端工程化]
    keywords:
    - Webpack
    - 打包工具
    - 前端工程化
---

如果需要修改 Webpack 输出资源的名称和路径，可以通过配置 `output` 选项来实现。

## 配置

```js title="webpack.config.js"
const path = require('path');

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    // highlight-next-line
    filename: 'static/js/main.js', // 将 js 文件输出到 static/js 目录中
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
        // highlight-start
        generator: {
          // 将图片文件输出到 static/imgs 目录中
          // 将图片文件命名 [hash:8][ext][query]
          // [hash:8]: hash值取8位
          // [ext]: 使用之前的文件扩展名
          // [query]: 添加之前的query参数
          filename: 'static/imgs/[hash:8][ext][query]',
        },
        // highlight-end
      },
    ],
  },
  plugins: [],
  mode: 'development',
};
```

## 修改 index.html

```html title="index.html"
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>webpack5</title>
    <!-- 引入打包后的js文件，才能看到效果 -->
    <!-- highlight-next-line -->
    <script src="../dist/static/js/main.js"></script>
  </head>
  <body>
    <h1>Hello Webpack5</h1>
    <!-- 准备一个使用样式的 DOM 容器 -->
    <div class="box1"></div>
    <!-- 准备第二个使用样式的 DOM 容器 -->
    <div class="box2"></div>
    <!-- 准备第三四个使用样式的 DOM 容器 -->
    <div class="box3"></div>
    <div class="box4"></div>
    <!-- 准备第五个使用样式的 DOM 容器 -->
    <div class="box5"></div>
  </body>
</html>
```

## 运行指令

```bash
npx webpack
```

此时输出文件目录：（**注意：需要将上次打包生成的文件清空，再重新打包才有效果**）

![效果图](https://tecent-oss-shanghai.eaveluo.com/img/202406271743701.png?imageSlim)
