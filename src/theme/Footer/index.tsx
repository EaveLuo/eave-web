import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { ArrowUpRight, Heart, Mail, MapPin, Rss } from 'lucide-react';
import styles from './styles.module.css';

// 备案信息
const icpBeian = '湘ICP备2024069005号-1';
const policeBeian = '湘公网安备43011102002452号';

// 当前年份
const currentYear = new Date().getFullYear();

// 导航链接数据
const navLinks = [
  {
    title: '知识库',
    links: [
      { label: '前端开发', to: '/docs/front-end/intro' },
      { label: '后端开发', to: '/docs/back-end/intro' },
      { label: '运维部署', to: '/docs/operation/intro' },
      { label: '人工智能', to: '/docs/ai/intro' },
    ],
  },
  {
    title: '社交',
    links: [
      { label: 'X (Twitter)', href: 'https://x.com/EaveLuo', external: true },
      { label: '哔哩哔哩', href: 'https://space.bilibili.com/179586356', external: true },
      { label: 'GitHub', href: 'https://github.com/eaveluo', external: true },
    ],
  },
  {
    title: '更多',
    links: [
      { label: '博客文章', to: '/blog' },
      { label: '关于我', to: '/about' },
      { label: 'RSS 订阅', to: '/blog/rss.xml', external: true },
    ],
  },
];

// 技术栈标签
const techStack = [
  'React', 'TypeScript', 'Node.js', 'Docusaurus', 'Tailwind CSS', 'Vercel'
];

function Footer(): React.ReactElement | null {
  const { siteConfig } = useDocusaurusContext();

  return (
    <footer className={styles.footer}>
      {/* 顶部波浪装饰 */}
      <div className={styles.wave}>
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            fillOpacity=".1"
            className={styles.wavePath}
          />
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            fillOpacity=".05"
            className={styles.wavePath}
          />
        </svg>
      </div>

      <div className={styles.container}>
        {/* 主要内容区 */}
        <div className={styles.main}>
          {/* 左侧：品牌信息 */}
          <div className={styles.brand}>
            <Link to="/" className={styles.brandLink}>
              <img
                src="/img/logo.webp"
                alt={siteConfig.title}
                className={styles.brandLogo}
              />
              <span className={styles.brandName}>{siteConfig.title}</span>
            </Link>
            <p className={styles.brandTagline}>
              全栈软件工程师，热衷于计算机软硬件相关技术。
            </p>
            
            {/* 联系信息 */}
            <div className={styles.contact}>
              <div className={styles.contactItem}>
                <Mail size={16} />
                <span>eave.luo@example.com</span>
              </div>
              <div className={styles.contactItem}>
                <MapPin size={16} />
                <span>中国 · 湖南 · 长沙</span>
              </div>
            </div>

            {/* 社交图标 */}
            <div className={styles.social}>
              <a
                href="https://x.com/EaveLuo"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="X (Twitter)"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://github.com/eaveluo"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="GitHub"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
              </a>
              <a
                href="https://space.bilibili.com/179586356"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Bilibili"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893V9.907c-.017-.764-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373z" />
                </svg>
              </a>
              <a
                href="/blog/rss.xml"
                className={styles.socialLink}
                aria-label="RSS"
              >
                <Rss size={20} />
              </a>
            </div>
          </div>

          {/* 右侧：导航链接 */}
          <div className={styles.links}>
            {navLinks.map((section) => (
              <div key={section.title} className={styles.linkSection}>
                <h3 className={styles.linkTitle}>{section.title}</h3>
                <ul className={styles.linkList}>
                  {section.links.map((link) => (
                    <li key={link.label} className={styles.linkItem}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.link}
                        >
                          {link.label}
                          <ArrowUpRight size={12} />
                        </a>
                      ) : (
                        <Link to={link.to} className={styles.link}>
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* 技术栈标签 */}
        <div className={styles.techStack}>
          <span className={styles.techLabel}>技术栈：</span>
          <div className={styles.techTags}>
            {techStack.map((tech) => (
              <span key={tech} className={styles.techTag}>
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* 分隔线 */}
        <div className={styles.divider} />

        {/* 底部版权信息 */}
        <div className={styles.bottom}>
          <div className={styles.legal}>
            <a
              href="http://beian.miit.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.legalLink}
            >
              {icpBeian}
            </a>
            <span className={styles.dividerDot}>·</span>
            <a
              href={`http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=${policeBeian.match(/\d+/)?.[0]}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.legalLink}
            >
              <img
                src="/img/police.png"
                alt="police"
                className={styles.policeIcon}
              />
              {policeBeian}
            </a>
          </div>
          
          <p className={styles.copyright}>
            Made with <Heart size={14} className={styles.heart} /> by Eave Luo · {currentYear}
          </p>
          
          <p className={styles.powered}>
            Built with <a href="https://docusaurus.io/" target="_blank" rel="noopener">Docusaurus</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default React.memo(Footer);
