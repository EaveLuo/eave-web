import { type Variants, motion } from 'framer-motion';
import Translate, { translate } from '@docusaurus/Translate';
import { useColorMode } from '@docusaurus/theme-common';
import HeroSvg from '@site/static/img/Homepage/undraw_hero.svg';
import HeroSvgDark from '@site/static/img/Homepage/undraw_hero_dark.svg';
import ShimmerButton from '@site/src/components/magicui/shimmer-button';
import TypingAnimation from '@site/src/components/magicui/typing-animation';

import styles from './styles.module.css';

const variants: Variants = {
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 100,
      duration: 0.3,
      delay: i * 0.3,
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

export default function Hero() {
  const isDarkTheme = useColorMode().colorMode === 'dark';
  return (
    <motion.div className={styles.hero}>
      <div className={styles.intro}>
        <Name />
        <motion.p
          custom={2}
          initial="hidden"
          animate="visible"
          variants={variants}
          className="max-md:px-4"
        >
          <TypingAnimation
            className={styles.intro_text}
            duration={50}
            text={translate({ id: 'homepage.hero.text' })}
          />
        </motion.p>

        <motion.div
          className="mt-4 flex gap-2"
          custom={4}
          initial="hidden"
          animate="visible"
          variants={variants}
        >
          <ShimmerButton
            background={isDarkTheme ? '#000000' : '#ffffff'}
            className="shadow-md"
          >
            <span className={styles.button_text}>
              <Translate id="homepage.hero.button.text"></Translate>
            </span>
          </ShimmerButton>
        </motion.div>
      </div>
      <motion.div className={styles.background}>
        {isDarkTheme ? <HeroSvgDark /> : <HeroSvg />}
        <Circle />
      </motion.div>
    </motion.div>
  );
}