import { memo } from 'react';
import { type Variants, motion } from 'framer-motion';
import Translate, { translate } from '@docusaurus/Translate';
import ShimmerButton from '@site/src/components/magicui/shimmer-button';
import TypingAnimation from '@site/src/components/magicui/typing-animation';
import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useHistory } from '@docusaurus/router';

import styles from './styles.module.css';

const variants: Variants = {
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 100,
      duration: 0.2,
      delay: i * 0.2,
    },
  }),
  hidden: { opacity: 0, y: 30 },
};

function Circle() {
  return <div className={styles.circle} />;
}

function Name() {
  return (
    <motion.div
      className={styles.hero_text}
      custom={1}
      initial="hidden"
      animate="visible"
      variants={variants}
      onMouseMove={(e) => {
        e.currentTarget.style.setProperty('--x', `${e.clientX}px`);
        e.currentTarget.style.setProperty('--y', `${e.clientY}px`);
      }}
    >
      <Translate id="homepage.hero.greet"></Translate>
      <span
        className={styles.name}
        onMouseMove={(e) => {
          const bounding = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty('--mouse-x', `${bounding.x}px`);
          e.currentTarget.style.setProperty('--mouse-y', `${bounding.y}px`);
        }}
      >
        <Translate id="homepage.hero.name"></Translate>
      </span>
      <span className="ml-1">👋</span>
    </motion.div>
  );
}

function Hero() {
  const history = useHistory();
  return (
    <motion.div className={styles.hero}>
      <div className={styles.intro}>
        <Name />
        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={variants}
        >
          <TypingAnimation
            className={styles.intro_text}
            duration={50}
            text={translate({ id: 'homepage.hero.text' })}
          />
        </motion.div>

        <motion.div
          className="mt-4 flex gap-2"
          custom={3}
          initial="hidden"
          animate="visible"
          variants={variants}
        >
          <ShimmerButton
            className="shadow-md"
            onClick={() => history.push('about')}
          >
            <span className={styles.button_text}>
              <Translate id="homepage.hero.button.text"></Translate>
            </span>
          </ShimmerButton>
        </motion.div>
      </div>
      <motion.div
        className={styles.background}
        custom={4}
        initial="hidden"
        animate="visible"
        variants={variants}
      >
        <ThemedImage
          className={styles.background_svg}
          alt="Homepage Hero"
          sources={{
            light: useBaseUrl('/img/Homepage/undraw_hero.svg'),
            dark: useBaseUrl('/img/Homepage/undraw_hero_dark.svg'),
          }}
        />
        <Circle />
      </motion.div>
    </motion.div>
  );
}

export default memo(Hero);
