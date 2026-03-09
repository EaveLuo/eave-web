#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const EN_DOCS_DIR = '/home/EaveLuo/eave-web/i18n/en/docusaurus-plugin-content-docs/current';

// 英文文档 descriptions
const enDescriptions = {
  'ai/72h-ai-updates/2026-03-03-23-45.md': "OpenAI's Pentagon contract sparks user exodus, ChatGPT uninstalls surge 295%. Sam Altman admits 'sloppy mistake' but users question double standards. Anthropic also found to have similar contract, leaving users with nowhere to turn.",
  'ai/72h-ai-updates/2026-03-07-00-00.md': "OpenAI and Anthropic make opposite choices on Pentagon contracts: Anthropic exits over 'no autonomous weapons' stance, OpenAI accepts and faces 563% uninstall surge. GPT-5.4 launches with unified reasoning, coding and agentic capabilities, achieving 75% on OSWorld benchmark.",
  'ai/72h-ai-updates/2026-03-10-00-00.md': "Anthropic clashes with US Defense Department after Claude used in Iran military strikes. CEO Dario Amodei opposes military use, Pentagon labels Anthropic 'supply chain risk'. London mayor invites relocation, White House criticizes 'woke' stance. NVIDIA releases 2026 AI State of the Year report.",
  'ai/intro.md': 'This module covers AI technologies and news, including large language models, AI tools, and frontier AI developments, helping readers stay updated on artificial intelligence advancements.',
  'back-end/go/channel.md': "Go's communication mechanism between Goroutines via Channels, implementing 'don't communicate by sharing memory, share memory by communicating'. Supports unbuffered, buffered, read-only, write-only channels and basic operations.",
  'back-end/go/Go-Modules.md': "Go's official dependency management solution introduced in Go 1.11. Manages dependencies via go.mod and go.sum with semantic versioning. Includes common commands: init, get, tidy, download.",
  'back-end/go/goroutine.md': "Go's lightweight thread implementation with non-preemptive multitasking, millisecond startup time, supports creating thousands of Goroutines. Covers creation methods, comparison with threads, concurrent execution characteristics.",
  'back-end/go/select.md': "Go's multiplexing mechanism allowing Goroutines to wait on multiple Channel operations simultaneously. Supports default case, timeout control, random selection and other advanced usage patterns.",
  'back-end/go/函数.md': 'Basic building blocks of Go programs supporting multiple return values, variadic parameters, anonymous functions, closures. Includes function definition, parameter passing, named returns, defer execution.',
  'back-end/go/初探-go.md': "Go language introduction covering design philosophy, main features (simple syntax, efficient concurrency, fast compilation, memory safety) and use cases. Suitable for beginners to understand Go's landscape.",
  'back-end/go/反射.md': 'Runtime type introspection mechanism supporting dynamic type information retrieval, struct fields inspection, method invocation, value modification. Covers reflect.Type, reflect.Value and other core APIs.',
  'back-end/go/变量与常量.md': 'Various declaration methods for variables and constants in Go, including standard declaration, short variable declaration, multiple variables, constant definitions, iota enumeration. Explains type inference, zero values, scope.',
  'back-end/go/基础数据类型.md': "Detailed explanation of Go's built-in data types including integers, floats, complex numbers, strings, booleans. Covers type selection advice, string operations, type conversion, formatted output techniques.",
  'back-end/go/并发最佳实践.md': 'Practical experience summary for Go concurrent programming, covering common pitfalls (deadlocks, Goroutine leaks, race conditions), Worker Pool pattern, Pipeline pattern and concurrency code checklist.',
  'back-end/go/并发模式.md': 'Common concurrent design pattern implementations including Generator pattern, Pipeline pattern, Worker Pool, Fan-out/Fan-in, Context cancellation. Provides reusable concurrent code templates.',
  'back-end/go/性能优化.md': 'Go program performance optimization guide including Profiling tools (CPU, memory, blocking analysis), Benchmark testing, common optimization techniques and performance tuning best practices.',
  'back-end/go/手搓 RPC 框架.md': 'Build a simple RPC framework from scratch to deeply understand RPC principles. Covers service registration/discovery, serialization, network transport, load balancing and other core components.',
  'back-end/go/指针.md': "Go pointer mechanism including pointer basics, address-of and dereference, pointer arithmetic limitations, unsafe package usage, comparison with C/C++ pointers. Emphasizes Go's pointer safety design.",
  'back-end/go/接口.md': "Go's implicit interface implementation mechanism, covering interface definition, automatic type implementation, empty interface, type assertion, type switch. Contrasts with Java/C# explicit implementation.",
  'back-end/go/数组与切片.md': 'Differences and use cases between Go arrays and slices, including array definition, slice creation, append, copy, shared underlying array, capacity expansion mechanism and other core concepts.',
  'back-end/go/方法.md': 'Methods in Go including value vs pointer receivers, method inheritance, method overriding, embedded type method promotion. Compares functions and methods.',
  'back-end/go/标准库精选.md': 'Quick reference for Go standard library commonly used packages including net/http for web services, database/sql for database operations, encoding/json for JSON handling, time for time operations.',
  'back-end/go/流程控制.md': "Go flow control structures including if/else, for loops (three forms), switch, goto, break/continue. Contrasts with other languages, demonstrating Go's simple design.",
  'back-end/go/测试.md': 'Go testing framework guide including unit tests (testing package), table-driven tests, Benchmark testing, test coverage, Mock testing and testing best practices.',
  'back-end/go/环境搭建.md': 'Go development environment setup guide including Go installation, GOPATH/GOROOT configuration, IDE selection (VS Code, GoLand), recommended plugins and first Go program.',
  'back-end/go/程序结构.md': 'Go program organization and code standards including package mechanism, import paths, visibility rules (capitalized export), init function, main function. Explains how to organize large Go projects.',
  'back-end/go/结构体.md': "Go struct type details including definition, field tags, method binding, nested structs, anonymous fields. Compares with OOP classes, demonstrating Go's composition over inheritance philosophy.",
  'back-end/go/部署与运维.md': 'Go application deployment and operations practices including cross-compilation, static linking, Docker containerization, systemd service configuration, log management, monitoring and alerting.',
  'back-end/go/错误处理.md': 'Go error handling mechanism including error interface, custom errors, error wrapping (errors.Wrap), panic/recover, error chains. Explains Go\'s "errors are values" philosophy and best practices.',
  'back-end/go/项目实战.md': 'Complete Go project case study from requirements analysis, architecture design, code implementation to testing and deployment. Consolidates Go language knowledge through practical projects.',
  'back-end/intro.md': 'Backend development technology stack introduction covering Go, Node.js and other backend languages, plus databases, caching, message queues, microservices and other core backend technologies.',
  'back-end/node/buffer.md': 'Node.js Buffer module for handling binary data. Covers Buffer creation, read/write, conversion, slicing and string interconversion, essential for file and network data processing.',
  'back-end/node/express.md': 'Express.js framework from basics to advanced including routing, middleware mechanism, request handling, error handling, template engines. Shows how to quickly build RESTful APIs with Express.',
  'back-end/node/fs.md': 'Node.js file system module (fs) comprehensive guide including sync/async read/write, streaming operations, directory operations, file watching. Covers Promise wrapper and practical file handling scenarios.',
  'back-end/node/http.md': 'Node.js HTTP module from basic server creation to request/response handling, routing implementation, static file serving. Helps understand underlying principles of frameworks like Express.',
  'back-end/node/installation.md': 'Node.js installation guide including nvm version manager, multi-version switching, npm/yarn/pnpm package manager selection, common installation troubleshooting.',
  'back-end/node/introduction.md': 'Node.js introduction covering event-driven, non-blocking I/O model, single-threaded event loop and applicable scenarios plus ecosystem overview.',
  'back-end/node/modularity.md': 'Node.js module system including CommonJS and ES Modules, require/import differences, circular dependency handling, module caching and other core knowledge.',
  'back-end/node/packageManager.md': 'Node.js package manager comparison and usage, detailed comparison of npm, yarn, pnpm pros and cons, package.json configuration, dependency version management, lockfile mechanism.',
  'back-end/node/path.md': 'Node.js path module for handling and transforming file paths. Covers path joining, parsing, normalization, relative/absolute path conversion and other cross-platform path operations.',
  'back-end/node/syncAsync.md': 'Node.js synchronous and asynchronous programming patterns including callbacks, Promises, async/await evolution, event loop mechanism and asynchronous flow control handling.',
  'back-end/node/接口开发示例.md': 'Complete Node.js API development example from project setup, routing design, database connection, JWT authentication to error handling, demonstrating enterprise-grade API development best practices.',
  'back-end/webAPI.md': 'Web API design principles and best practices including RESTful conventions, versioning, authentication/authorization, rate limiting, circuit breaking, documentation generation for high-quality API design.',
  'front-end/intro.md': 'Frontend development technology stack introduction covering HTML, CSS, JavaScript basics plus React, Vue and other mainstream frameworks, build tools, performance optimization and other core frontend knowledge.',
  'front-end/webpack5/autoClean.md': 'Webpack 5 automatic cleanup configuration, explaining how to clean output directory before each build to avoid old file accumulation, including clean-webpack-plugin and built-in output.clean configuration.',
  'front-end/webpack5/automation.md': 'Webpack 5 automation configuration including webpack-dev-server hot reload, HMR module hot replacement, proxy configuration, automatic browser refresh and other development efficiency optimization techniques.',
  'front-end/webpack5/base.md': 'Webpack 5 basics introduction covering core concepts (entry, output, loader, plugin), configuration file structure, mode settings to build foundation for deeper Webpack learning.',
  'front-end/webpack5/baseConfig.md': 'Webpack 5 basic configuration details including entry/output configuration, loader matching rules, plugin usage, resolve configuration and other commonly used configuration items.',
  'front-end/webpack5/codeSplitting.md': 'Webpack 5 code splitting strategies including dynamic imports (import()), SplitChunksPlugin configuration, lazy loading, preload/prefetch and other techniques for optimizing first-screen loading.',
  'front-end/webpack5/configBabel.md': 'Webpack 5 integrating Babel, explaining how to use babel-loader to transpile ES6+ code, configure preset-env, polyfill on-demand import for browser compatibility handling.',
  'front-end/webpack5/configESLint.md': 'Webpack 5 integrating ESLint including eslint-loader configuration, rule customization, auto-fix, integration with Prettier and other code quality assurance solutions.',
  'front-end/webpack5/createLoader.md': 'Webpack 5 custom Loader development explaining Loader working principles, API usage, async processing, caching strategy through examples showing how to write custom Loaders.',
  'front-end/webpack5/createPlugin.md': 'Webpack 5 custom Plugin development explaining Plugin architecture, lifecycle hooks, Compiler and Compilation objects, file operations and other advanced extension techniques.',
  'front-end/webpack5/differentEnvironments.md': 'Webpack 5 multi-environment configuration explaining development, testing, production environment差异化配置, using webpack-merge to merge configurations, environment variable injection.',
  'front-end/webpack5/handleHtml.md': 'Webpack 5 handling HTML using html-webpack-plugin to automatically generate HTML, inject bundled resources, multi-page configuration, template engine integration.',
  'front-end/webpack5/handleImage.md': 'Webpack 5 handling image resources including url-loader, file-loader, asset module configuration, image compression, base64 conversion, sprite generation and other optimization solutions.',
  'front-end/webpack5/handleOther.md': 'Webpack 5 handling other resources including font files, audio/video, JSON, XML and other non-JS/CSS resource loading and configuration methods.',
  'front-end/webpack5/handleOutput.md': 'Webpack 5 output configuration details including output options, filename hashing, publicPath setting, multi-entry output, library packaging and other advanced output control.',
  'front-end/webpack5/handleStyle.md': 'Webpack 5 handling style resources including css-loader, style-loader, mini-css-extract-plugin, Sass/Less/Stylus preprocessor configuration.',
  'front-end/webpack5/intro.md': 'Webpack 5 introduction explaining frontend engineering concepts, module bundling principles, Webpack core functions, applicable scenarios and comparison with Vite, Parcel and other tools.',
  'front-end/webpack5/liftingSpeed.md': 'Webpack 5 build speed optimization including persistent caching, multi-threaded packaging (thread-loader), narrowing search scope, DLL pre-compilation and other acceleration strategies.',
  'front-end/webpack5/optimizeCSS.md': 'Webpack 5 CSS optimization including CSS extraction, compression (css-minimizer-webpack-plugin), Tree Shaking, Critical CSS and other style optimization techniques.',
  'front-end/webpack5/pwa.md': 'Webpack 5 building PWA integrating workbox-webpack-plugin to implement Service Worker, offline caching, manifest.json generation and other progressive web app configurations.',
  'front-end/webpack5/reduceVolume.md': 'Webpack 5 bundle size optimization including Tree Shaking, Scope Hoisting, code splitting, Gzip/Brotli compression, CDN third-party library introduction and other size reduction strategies.',
  'front-end/webpack5/sourceMap.md': 'Webpack 5 SourceMap configuration explaining different devtool options, SourceMap principles, production environment SourceMap strategies, debugging techniques.',
  'operation/intro.md': 'Operations technology stack introduction covering Linux system administration, Nginx configuration, Docker containerization, CI/CD pipelines, monitoring and alerting and other core operations skills.',
  'operation/linux/通过SSH密钥登录主机.md': 'SSH key login configuration guide explaining key generation, public key distribution, passwordless login configuration, SSH configuration optimization to solve password login inconvenience and security issues.',
  'operation/nginx/history路由问题.md': 'Nginx history routing configuration solving 404 issues when single-page applications (SPA) use history mode, configuring try_files directive to support frontend routing.',
  'operation/nginx/后端接口代理问题.md': 'Nginx reverse proxy configuration solving cross-domain and API forwarding issues in frontend-backend separated deployment, including proxy_pass, headers setting, load balancing and other configurations.',
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
  console.log('📝 Applying descriptions to English docs...\n');
  
  let updated = 0;
  let failed = 0;
  
  for (const [relativePath, description] of Object.entries(enDescriptions)) {
    const filePath = path.join(EN_DOCS_DIR, relativePath);
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
