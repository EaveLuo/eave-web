/**
 * Docusaurus 插件 - 注入内联 IntersectionObserver 脚本
 * 不依赖 main.js，首屏即可执行
 */

module.exports = function pluginInlineObserver(context, options) {
  return {
    name: 'docusaurus-plugin-inline-observer',
    
    injectHtmlTags() {
      return {
        headTags: [],
        preBodyTags: [],
        postBodyTags: [
          {
            tagName: 'script',
            innerHTML: `
(function() {
  // 只在首页执行
  var path = window.location.pathname;
  if (path !== '/' && !path.startsWith('/en/') && path !== '/en/') return;
  
  function initObserver() {
    var cards = document.querySelectorAll('[data-card-observer]');
    var headers = document.querySelectorAll('[data-header-observer]');
    var footers = document.querySelectorAll('[data-footer-observer]');
    
    if (!cards.length && !headers.length) {
      // 如果元素还没渲染，稍后重试
      setTimeout(initObserver, 100);
      return;
    }
    
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    cards.forEach(function(card) { observer.observe(card); });
    headers.forEach(function(header) { observer.observe(header); });
    footers.forEach(function(footer) { observer.observe(footer); });
  }
  
  // DOM 就绪后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initObserver);
  } else {
    initObserver();
  }
})();
            `,
          },
        ],
      };
    },
  };
};
