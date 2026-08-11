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
