const {
  getLatestArticles,
  readBlogArticles,
} = require('./articles');

function homepageDataPlugin(context) {
  const { siteDir, i18n } = context;
  const currentLocale = i18n.currentLocale;
  const defaultLocale = i18n.defaultLocale;

  return {
    name: 'docusaurus-plugin-homepage-data',

    async loadContent() {
      const articles = readBlogArticles(
        siteDir,
        currentLocale,
        defaultLocale,
      );
      const latestArticles = getLatestArticles(articles);

      console.log(
        `[HomepageData] Loaded ${articles.length} Blog articles and selected ${latestArticles.length} homepage items for ${currentLocale}`,
      );

      return { latestArticles };
    },

    async contentLoaded({ content, actions }) {
      actions.setGlobalData({
        latestArticles: {
          items: content.latestArticles,
          lastUpdated: new Date().toISOString(),
        },
      });
    },
  };
}

module.exports = homepageDataPlugin;
