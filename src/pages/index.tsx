import type { ReactNode } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import { translate } from '@docusaurus/Translate';

import Hero from '@site/src/components/Homepage/Hero';
import LatestArticles from '@site/src/components/Homepage/LatestArticles';
import BackgroundEffects from '@site/src/components/Homepage/BackgroundEffects';

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title={translate({
        id: 'homepage.meta.title',
      })}
      description={siteConfig.tagline}
    >
      <BackgroundEffects />
      <main className="homepage-container">
        <Hero />
        <LatestArticles />
      </main>
    </Layout>
  );
}
