import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import { translate } from '@docusaurus/Translate';

import Particles from '@site/src/components/magicui/particles';
import Hero from '@site/src/components/Homepage/Hero';

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={translate({
        id: 'homepage.meta.title',
      })}
      description={siteConfig.tagline}
    >
      <main>
        <Hero />
        <Particles
          className="absolute inset-0"
          quantity={100}
          ease={80}
          color={'#ffffff'}
          refresh
        />
      </main>
    </Layout>
  );
}
