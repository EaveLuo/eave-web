import type { ReactNode } from 'react';
import { useEffect, useState, useCallback } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import { translate } from '@docusaurus/Translate';

import Particles from '@site/src/components/magicui/particles-optimized';
import Hero from '@site/src/components/Homepage/Hero/index-optimized';
import LatestArticles from '@site/src/components/Homepage/LatestArticles/index-optimized';

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  const [showParticles, setShowParticles] = useState(false);

  // 延迟加载粒子效果，优先保证 FCP
  useEffect(() => {
    // 使用 IntersectionObserver 检测首屏内容是否渲染完成
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 首屏内容可见后再加载粒子效果
            requestIdleCallback(() => {
              setShowParticles(true);
            }, { timeout: 2000 });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    const heroElement = document.querySelector('main');
    if (heroElement) {
      observer.observe(heroElement);
    }

    // 备用方案：3秒后无论如何都加载
    const fallbackTimer = setTimeout(() => {
      setShowParticles(true);
    }, 3000);

    return () => {
      observer.disconnect();
      clearTimeout(fallbackTimer);
    };
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
            quantity={30}
            ease={100}
            size={0.3}
            color={'#ffffff'}
            refresh
          />
        )}
        <LatestArticles />
      </main>
    </Layout>
  );
}
