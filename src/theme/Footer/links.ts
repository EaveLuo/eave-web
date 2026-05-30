export type FooterTranslateMessage = (id: string, message: string) => string;

export type FooterLink =
  | {
      id: string;
      label: string;
      to: string;
      href?: never;
      external?: never;
    }
  | {
      id: string;
      label: string;
      href: string;
      external: true;
      to?: never;
    };

export type FooterLinkSection = {
  id: string;
  title: string;
  links: FooterLink[];
};

export function getNavLinks(
  rssHref: string,
  translateMessage: FooterTranslateMessage,
): FooterLinkSection[] {
  return [
    {
      id: 'knowledge',
      title: translateMessage('footer.knowledge', '知识库'),
      links: [
        { id: 'frontend', label: translateMessage('footer.frontend', '前端开发'), to: '/docs/front-end/intro' },
        { id: 'backend', label: translateMessage('footer.backend', '后端开发'), to: '/docs/back-end/intro' },
        { id: 'operation', label: translateMessage('footer.operation', '运维部署'), to: '/docs/operation/intro' },
        { id: 'ai', label: translateMessage('footer.ai', '人工智能'), to: '/docs/ai/intro' },
      ],
    },
    {
      id: 'more',
      title: translateMessage('footer.more', '更多'),
      links: [
        { id: 'blog', label: translateMessage('footer.blog', '博客文章'), to: '/blog' },
        { id: 'about', label: translateMessage('footer.about', '关于我'), to: '/about' },
        { id: 'rss', label: translateMessage('footer.rss', 'RSS 订阅'), href: rssHref, external: true },
      ],
    },
  ];
}
