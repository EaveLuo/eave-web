---
    sidebar_position: 7
    slug: auto-clean
    title: 自动清空上次打包资源
    tags: [Webpack, 打包工具, 前端工程化]
    keywords:
    - Webpack
    - 打包工具
    - 前端工程化
    - 自动清空前一次输出目录
---

在之前的处理中，我们想要看到一些效果需要手动删除了上一次打包的资源，但这显然是不够方便，所以 Webpack 提供了自动清空上次打包资源的功能。

## 配置

```js title="webpack.config.js"
const path = require('path');

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'static/js/main.js',
    // highlight-next-line
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
            maxSize: 40 * 1024, // 小于40kb的图片会被base64处理
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
    ],
  },
  plugins: [],
  mode: 'development',
};
```

## 运行指令

```bash
npx webpack
```

观察 dist 目录资源情况
