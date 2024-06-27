---
    sidebar_position: 8
    slug: handle-Other
    title: 处理字体图标音频视频等其他资源
    description: 介绍 Webpack 如何处理字体图标资源
    tags: [Webpack, 打包工具, 前端工程化]
    keywords:
    - Webpack
    - 打包工具
    - 前端工程化
    - 处理字体图标音频视频等其他资源
---

在实际开发中，我们经常会用到字体图标、音频、视频等其他资源，Webpack 如何处理字体图标资源呢？下列以字体为例，介绍 Webpack 如何处理其他资源。

## 下载字体图标文件

- 字体图标库可太多了，我这里以[阿里巴巴矢量图标库](https://www.iconfont.cn/)为例

- 选择想要的图标添加到购物车，统一下载到本地

## 添加字体图标资源

- src/fonts/AlimamaDaoLiTi.ttf
- src/fonts/AlimamaDaoLiTi.woff
- src/fonts/AlimamaDaoLiTi.woff2

## 引入字体图标资源

```css title="src/css/index.css"
/* highlight-start */
@font-face {
  font-family: 'AlimamaDaoLiTi';
  src: url('../fonts/AlimamaDaoLiTi.ttf');
}
@font-face {
  font-family: 'AlimamaDaoLiTi';
  src: url('../fonts/AlimamaDaoLiTi.woff');
}
@font-face {
  font-family: 'AlimamaDaoLiTi';
  src: url('../fonts/AlimamaDaoLiTi.woff2');
}

* {
  font-family: 'AlimamaDaoLiTi';
}
/* highlight-end */
.box1 {
  width: 100px;
  height: 100px;
  background-color: green;
}
```

## 配置

```js title="webpack.config.js"
const path = require('path');

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
      // highlight-start
      {
        test: /\.(ttf|woff2?)$/,
        type: 'asset/resource',
        generator: {
          filename: 'static/media/[hash:8][ext][query]',
        },
      },
      // highlight-end
    ],
  },
  plugins: [],
  mode: 'development',
};
```

`type: "asset/resource"`和`type: "asset"`的区别：

- `type: "asset/resource"` 相当于 `file-loader` , 将文件转化成 Webpack 能识别的资源，其他不做处理
- `type: "asset"` 相当于 `url-loader` , 将文件转化成 Webpack 能识别的资源，同时小于某个大小的资源会处理成 data URI 形式

若需要处理音视频等其他资源，可以按照同样的方式配置。
例如音视频处理，可以配置如下：

```js title="webpack.config.js"
const path = require('path');

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
        // highlight-next-line
        test: /\.(ttf|woff2?|map4|map3|avi)$/,
        type: 'asset/resource',
        generator: {
          filename: 'static/media/[hash:8][ext][query]',
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

打开 index.html 页面查看效果

![效果图](https://tecent-oss-shanghai.eaveluo.com/img/202406271830231.png?imageSlim)
