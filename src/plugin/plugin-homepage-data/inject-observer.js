/**
 * 内联 IntersectionObserver 脚本
 * 直接注入到 HTML，不依赖 main.js
 */

const observerScript = `
<script>
(function() {
  // 只在首页执行
  if (window.location.pathname !== '/' && !window.location.pathname.startsWith('/en')) return;
  
  // 等待 DOM 就绪
  function init() {
    var cards = document.querySelectorAll('[data-card-observer]');
    var headers = document.querySelectorAll('[data-header-observer]');
    var footers = document.querySelectorAll('[data-footer-observer]');
    
    if (!cards.length && !headers.length) return;
    
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
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
</script>
`;

module.exports = observerScript;
