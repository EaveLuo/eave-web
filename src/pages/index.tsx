import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import { translate } from '@docusaurus/Translate';

import Particles from '@site/src/components/magicui/particles';
import Hero from '@site/src/components/Homepage/Hero';
import LatestArticles from '@site/src/components/Homepage/LatestArticles';

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  const [showParticles, setShowParticles] = useState(false);

  // 延迟加载粒子效果，优先保证 FCP
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setShowParticles(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  return (
    <Layout
      title={translate({
        id: 'homepage.meta.title',
      })}
      description={siteConfig.tagline}
    >
      <main>
        <Hero />
        {showParticles && (
          <Particles
            className="absolute inset-0"
            quantity={100}
            ease={80}
            color={'#ffffff'}
            refresh
          />
        )}
        <LatestArticles />
      </main>
    </Layout>
  );
}
