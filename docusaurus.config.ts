import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

/** 备案信息 */
const icpBeian = '湘ICP备2024069005号-1';
const policeBeian = '湘公网安备申请ing';

const config: Config = {
  title: 'Eave Luo',
  titleDelimiter: '-',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://www.eaveluo.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'Eave Luo', // Usually your GitHub org/user name.
  projectName: 'eave-web', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['en', 'zh-Hans'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    navbar: {
      title: 'Eave Luo',
      logo: {
        alt: 'Eave Luo Logo',
        src: 'img/logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'frontEndSidebar',
          position: 'right',
          label: 'Front end',
        },
        {
          to: '/blog',
          label: 'Blog',
          position: 'right',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Knowledge base',
          items: [
            {
              label: 'Front end',
              to: '/docs/intro',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'X',
              href: 'https://x.com/EaveLuo',
            },
            {
              label: 'Bilibili',
              href: 'https://space.bilibili.com/179586356',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/eaveluo',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
          ],
        },
      ],
      copyright: `
          <p style="margin-bottom: 0;">
            <a href="http://beian.miit.gov.cn/">${icpBeian}</a>
          </p>
          <p style="display: inline-flex; align-items: center;">
            <img
              style="height:20px;margin-right: 0.5rem;"
              src="/img/police.png"
              alt="police"
              height="20"
            />
            <a
              href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=${
                policeBeian.match(/\d+/)?.[0]
              }"
            >
              ${policeBeian}
            </a>
          </p>
          <p>Copyright © 2020-${new Date().getFullYear()} Eave Luo. Built with Docusaurus.</p>`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
  plugins: [
    async function myPlugin(context, options) {
      return {
        name: 'docusaurus-tailwindcss',
        configurePostCss(postcssOptions) {
          postcssOptions.plugins.push(require('tailwindcss'));
          postcssOptions.plugins.push(require('autoprefixer'));
          return postcssOptions;
        },
      };
    },
  ],
};

export default config;
