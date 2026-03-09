#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// 中文文档 descriptions (key: 文件名, value: description)
const zhDescriptions = {
  'ai/72h-ai-updates/2026-03-03-23-45.md': 'OpenAI 与美国国防部签订 AI 监控合同引发用户信任危机，Reddit 上"Goodbye ChatGPT"帖子获超 2000 赞，ChatGPT 卸载量激增 295%。Sam Altman 回应称为"粗心的错误"，但用户质疑其双重标准。同时 Anthropic 也被发现签了同样合同，用户陷入"逃离 A 到 B，发现 B 也一样"的困境。',
  'ai/72h-ai-updates/2026-03-07-00-00.md': 'OpenAI 与 Anthropic 在五角大楼合同上做出截然相反的选择：Anthropic 因坚持"禁止自主武器和监控"条款而退出，OpenAI 接受合同引发用户抵制，ChatGPT 卸载量飙升 563%。同时 GPT-5.4 发布，整合推理、编码和 Agentic 能力，在 OSWorld 基准测试达 75% 准确率。',
  'ai/72h-ai-updates/2026-03-10-00-00.md': 'Anthropic 与美国国防部公开冲突：Claude 被用于美军对伊朗军事行动后，CEO Dario Amodei 公开反对军事用途，五角大楼将其列为"供应链风险"企业。伦敦市长邀请 Anthropic 迁往伦敦，白宫批评其"觉醒"。同时 NVIDIA 发布《2026年AI现状报告》，揭示企业 AI 采用成熟、开源工具驱动战略、Agentic AI 崛起等趋势。',
  'ai/intro.md': '该模块主要介绍 AI 相关的技术与资讯，包括大模型、AI 工具、AI 前沿动态等，帮助读者了解人工智能领域的最新发展和应用。',
  'back-end/go/channel.md': 'Go 语言中 Goroutine 之间的通信管道，通过 Channel 实现"不要通过共享内存来通信，而要通过通信来共享内存"的哲学。支持无缓冲、有缓冲、只读、只写等多种 Channel 类型，以及发送、接收、关闭、遍历等基本操作。',
  'back-end/go/Go-Modules.md': 'Go 官方依赖管理解决方案，从 Go 1.11 引入。通过 go.mod 和 go.sum 管理依赖版本，支持语义化版本控制。包含常用命令如 init、get、tidy、download 等。',
  'back-end/go/goroutine.md': 'Go 的轻量级线程实现，非抢占式多任务调度，毫秒级启动，支持创建成千上万个 Goroutine。包含创建方式、与线程对比、并发执行特性等。',
  'back-end/go/select.md': 'Go 语言中实现多路复用的核心机制，让 Goroutine 同时等待多个 Channel 操作。支持 default case、超时控制、随机选择等高级用法。',
  'back-end/go/函数.md': 'Go 程序的基本组成单元，支持多返回值、可变参数、匿名函数、闭包等特性。包含函数定义、参数传递、返回值命名、defer 延迟执行等。',
  'back-end/go/初探-go.md': 'Go 语言入门介绍，涵盖语言设计哲学、主要特性（简洁语法、高效并发、快速编译、内存安全）及适用场景。适合初学者了解 Go 语言全貌。',
  'back-end/go/反射.md': '运行时类型检查和操作机制，支持动态获取类型信息、结构体字段、调用方法、修改值等。包含 reflect.Type、reflect.Value 等核心 API 的使用。',
  'back-end/go/变量与常量.md': 'Go 中变量和常量的多种声明方式，包括标准声明、短变量声明、多变量声明、常量定义、iota 枚举等。讲解类型推断、零值、作用域等概念。',
  'back-end/go/基础数据类型.md': 'Go 内置数据类型详解，包括整数、浮点数、复数、字符串、布尔型等。讲解类型选择建议、字符串操作、类型转换、格式化输出等实用技巧。',
  'back-end/go/并发最佳实践.md': 'Go 并发编程的实战经验总结，涵盖常见陷阱（死锁、Goroutine 泄漏、竞态条件）、Worker Pool 模式、Pipeline 模式及并发代码检查清单。',
  'back-end/go/并发模式.md': '常见并发设计模式实现，包括生成器模式、管道模式、Worker Pool、Fan-out/Fan-in、Context 取消等。提供可复用的并发代码模板。',
  'back-end/go/性能优化.md': 'Go 程序性能优化指南，包括 Profiling 工具使用（CPU、内存、阻塞分析）、Benchmark 基准测试、常见优化技巧及性能调优最佳实践。',
  'back-end/go/手搓 RPC 框架.md': '从零实现简易 RPC 框架，深入理解 RPC 原理。涵盖服务注册发现、序列化、网络传输、负载均衡等核心组件，帮助理解 gRPC 等框架底层机制。',
  'back-end/go/指针.md': 'Go 指针机制详解，包括指针基础、取址与解引用、指针运算限制、unsafe 包使用、与 C/C++ 指针对比等。强调 Go 指针的安全性设计。',
  'back-end/go/接口.md': 'Go 接口的隐式实现机制，讲解接口定义、类型自动实现、空接口、类型断言、类型开关等。对比 Java/C# 显式实现，体现 Go 的简洁哲学。',
  'back-end/go/数组与切片.md': 'Go 数组和切片的区别与使用场景，包括数组定义、切片创建、append、copy、切片共享底层数组、容量扩展机制等核心概念。',
  'back-end/go/方法.md': 'Go 中方法的定义与使用，包括值接收者 vs 指针接收者、方法继承、方法重写、嵌入类型方法提升等。对比函数与方法的异同。',
  'back-end/go/标准库精选.md': 'Go 标准库常用包速查，包括 net/http 构建 Web 服务、database/sql 数据库操作、encoding/json JSON 处理、time 时间操作等。',
  'back-end/go/流程控制.md': 'Go 流程控制结构，包括 if/else、for 循环（三种形式）、switch、goto、break/continue 等。对比其他语言，体现 Go 的简洁设计。',
  'back-end/go/测试.md': 'Go 测试框架使用指南，包括单元测试（testing 包）、表驱动测试、基准测试 Benchmark、测试覆盖率、Mock 测试及测试最佳实践。',
  'back-end/go/环境搭建.md': 'Go 开发环境搭建指南，包括 Go 安装、GOPATH/GOROOT 配置、IDE 选择（VS Code、GoLand）、常用插件推荐及第一个 Go 程序。',
  'back-end/go/程序结构.md': 'Go 程序的组织结构和代码规范，包括包（package）机制、导入路径、可见性规则（大写导出）、init 函数、main 函数等。讲解如何组织大型 Go 项目的代码结构。',
  'back-end/go/结构体.md': 'Go 的结构体（struct）类型详解，包括定义方式、字段标签（tag）、方法绑定、嵌套结构体、匿名字段等。对比面向对象语言的类，体现 Go 的组合优于继承的设计理念。',
  'back-end/go/部署与运维.md': 'Go 应用部署和运维实践，包括交叉编译、静态链接、Docker 容器化、systemd 服务配置、日志管理、监控告警等生产环境必备技能。',
  'back-end/go/错误处理.md': 'Go 的错误处理机制，包括 error 接口、自定义错误、错误包装（errors.Wrap）、panic/recover、错误链等。讲解 Go 中"错误即值"的哲学和最佳实践。',
  'back-end/go/项目实战.md': '完整的 Go 项目实战案例，从需求分析、架构设计、代码实现到测试部署的全流程。通过实际项目巩固 Go 语言知识，学习工程化开发规范。',
  'back-end/intro.md': '后端开发技术栈介绍，涵盖 Go、Node.js 等后端语言，以及数据库、缓存、消息队列、微服务等后端核心技术，帮助读者构建完整的后端知识体系。',
  'back-end/node/buffer.md': 'Node.js Buffer 模块详解，用于处理二进制数据。讲解 Buffer 创建、读写、转换、切片操作等，以及与字符串的互转，是处理文件、网络数据的基础。',
  'back-end/node/express.md': 'Express.js 框架入门到进阶，包括路由定义、中间件机制、请求处理、错误处理、模板引擎等。通过实例讲解如何使用 Express 快速构建 RESTful API。',
  'back-end/node/fs.md': 'Node.js 文件系统模块（fs）全面指南，包括同步/异步读写、流式操作、目录操作、文件监控等。涵盖 Promise 封装和实际开发中的文件处理场景。',
  'back-end/node/http.md': 'Node.js HTTP 模块详解，从基础服务器创建到请求/响应处理、路由实现、静态文件服务等。帮助理解 Express 等框架的底层原理。',
  'back-end/node/installation.md': 'Node.js 安装指南，包括 nvm 版本管理器使用、多版本切换、npm/yarn/pnpm 包管理器选择、常见安装问题排查等环境配置内容。',
  'back-end/node/introduction.md': 'Node.js 入门介绍，讲解事件驱动、非阻塞 I/O 模型、单线程事件循环等核心概念，以及适用场景和生态系统概览。',
  'back-end/node/modularity.md': 'Node.js 模块化机制，包括 CommonJS 和 ES Modules 两种模块系统、require/import 区别、循环依赖处理、模块缓存等核心知识。',
  'back-end/node/packageManager.md': 'Node.js 包管理器对比与使用，详细比较 npm、yarn、pnpm 的优缺点，讲解 package.json 配置、依赖版本管理、lockfile 机制等。',
  'back-end/node/path.md': 'Node.js path 模块指南，用于处理和转换文件路径。讲解路径拼接、解析、规范化、相对/绝对路径转换等跨平台路径操作。',
  'back-end/node/syncAsync.md': 'Node.js 同步与异步编程模式，包括回调函数、Promise、async/await 演进，事件循环机制，以及如何处理异步流程控制。',
  'back-end/node/接口开发示例.md': 'Node.js 接口开发完整示例，从项目搭建、路由设计、数据库连接、JWT 认证到错误处理，展示企业级 API 开发的最佳实践。',
  'back-end/webAPI.md': 'Web API 设计原则与最佳实践，包括 RESTful 规范、版本控制、认证授权、限流熔断、文档生成等，帮助设计高质量的 API 接口。',
  'front-end/intro.md': '前端开发技术栈介绍，涵盖 HTML、CSS、JavaScript 基础，以及 React、Vue 等主流框架，构建工具、性能优化等前端核心知识。',
  'front-end/webpack5/autoClean.md': 'Webpack 5 自动清理配置，讲解如何在每次构建前自动清理输出目录，避免旧文件累积，包括 clean-webpack-plugin 和内置 output.clean 配置。',
  'front-end/webpack5/automation.md': 'Webpack 5 自动化配置，包括 webpack-dev-server 热更新、HMR 模块热替换、proxy 代理配置、自动浏览器刷新等开发效率优化技巧。',
  'front-end/webpack5/base.md': 'Webpack 5 基础入门，讲解核心概念（entry、output、loader、plugin）、配置文件结构、模式（mode）设置等，为深入学习 Webpack 打下基础。',
  'front-end/webpack5/baseConfig.md': 'Webpack 5 基础配置详解，包括入口出口配置、loader 匹配规则、plugin 使用、resolve 解析配置等常用配置项的详细说明。',
  'front-end/webpack5/codeSplitting.md': 'Webpack 5 代码分割策略，包括动态导入（import()）、SplitChunksPlugin 配置、按需加载、预加载/预获取等优化首屏加载的技术。',
  'front-end/webpack5/configBabel.md': 'Webpack 5 集成 Babel，讲解如何使用 babel-loader 转译 ES6+ 代码，配置 preset-env、polyfill 按需引入，实现浏览器兼容性处理。',
  'front-end/webpack5/configESLint.md': 'Webpack 5 集成 ESLint，包括 eslint-loader 配置、规则定制、自动修复、与 Prettier 配合等代码质量保障方案。',
  'front-end/webpack5/createLoader.md': 'Webpack 5 自定义 Loader 开发，讲解 Loader 工作原理、API 使用、异步处理、缓存策略等，通过实例展示如何编写自定义 Loader。',
  'front-end/webpack5/createPlugin.md': 'Webpack 5 自定义 Plugin 开发，讲解 Plugin 架构、生命周期钩子、Compiler 和 Compilation 对象、文件操作等高级扩展技术。',
  'front-end/webpack5/differentEnvironments.md': 'Webpack 5 多环境配置，讲解开发环境、测试环境、生产环境的差异化配置，使用 webpack-merge 合并配置，环境变量注入等。',
  'front-end/webpack5/handleHtml.md': 'Webpack 5 处理 HTML，使用 html-webpack-plugin 自动生成 HTML、注入打包资源、多页面配置、模板引擎集成等。',
  'front-end/webpack5/handleImage.md': 'Webpack 5 处理图片资源，包括 url-loader、file-loader、asset module 配置，图片压缩、转 base64、雪碧图生成等优化方案。',
  'front-end/webpack5/handleOther.md': 'Webpack 5 处理其他资源，包括字体文件、音视频、JSON、XML 等非 JS/CSS 资源的加载和配置方法。',
  'front-end/webpack5/handleOutput.md': 'Webpack 5 输出配置详解，包括 output 选项、文件名哈希、publicPath 设置、多入口输出、库打包等高级输出控制。',
  'front-end/webpack5/handleStyle.md': 'Webpack 5 处理样式资源，包括 css-loader、style-loader、mini-css-extract-plugin、Sass/Less/Stylus 预处理器配置等。',
  'front-end/webpack5/intro.md': 'Webpack 5 入门介绍，讲解前端工程化概念、模块打包原理、Webpack 核心功能、适用场景及与 Vite、Parcel 等工具对比。',
  'front-end/webpack5/liftingSpeed.md': 'Webpack 5 构建速度优化，包括持久化缓存、多线程打包（thread-loader）、缩小搜索范围、DLL 预编译等提速策略。',
  'front-end/webpack5/optimizeCSS.md': 'Webpack 5 CSS 优化，包括 CSS 提取、压缩（css-minimizer-webpack-plugin）、Tree Shaking、Critical CSS 等样式优化技术。',
  'front-end/webpack5/pwa.md': 'Webpack 5 构建 PWA，集成 workbox-webpack-plugin 实现 Service Worker、离线缓存、 manifest.json 生成等渐进式 Web 应用配置。',
  'front-end/webpack5/reduceVolume.md': 'Webpack 5 体积优化，包括 Tree Shaking、Scope Hoisting、代码分割、Gzip/Brotli 压缩、CDN 引入第三方库等减包策略。',
  'front-end/webpack5/sourceMap.md': 'Webpack 5 SourceMap 配置，讲解不同 devtool 选项、SourceMap 原理、生产环境 SourceMap 策略、调试技巧等。',
  'operation/intro.md': '运维技术栈介绍，涵盖 Linux 系统管理、Nginx 配置、Docker 容器化、CI/CD 流水线、监控告警等运维核心技能。',
  'operation/linux/通过SSH密钥登录主机.md': 'SSH 密钥登录配置指南，讲解密钥生成、公钥分发、免密登录配置、SSH 配置优化，解决密码登录繁琐和安全性问题。',
  'operation/nginx/history路由问题.md': 'Nginx  history 路由配置，解决单页应用（SPA）使用 history 模式时的 404 问题，配置 try_files 指令支持前端路由。',
  'operation/nginx/后端接口代理问题.md': 'Nginx 反向代理配置，解决前后端分离部署时的跨域和接口转发问题，包括 proxy_pass、headers 设置、负载均衡等配置。',
};

// 处理单个文件
function processFile(filePath, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const doc = matter(content);
    
    // 更新 description
    doc.data.description = description;
    
    // 写回文件
    const newContent = matter.stringify(doc.content, doc.data);
    fs.writeFileSync(filePath, newContent, 'utf-8');
    
    console.log(`✓ Updated: ${path.basename(filePath)}`);
    return true;
  } catch (error) {
    console.error(`✗ Error: ${filePath} - ${error.message}`);
    return false;
  }
}

// 主函数
function main() {
  console.log('📝 Applying descriptions to Chinese docs...\n');
  
  let updated = 0;
  let failed = 0;
  
  for (const [relativePath, description] of Object.entries(zhDescriptions)) {
    const filePath = path.join('/home/EaveLuo/eave-web/docs', relativePath);
    if (fs.existsSync(filePath)) {
      if (processFile(filePath, description)) {
        updated++;
      } else {
        failed++;
      }
    } else {
      console.log(`⚠ File not found: ${filePath}`);
      failed++;
    }
  }
  
  console.log(`\n✅ Done! Updated ${updated} files, failed ${failed} files`);
}

main();
