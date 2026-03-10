import { memo, useCallback, useRef, useEffect, useState } from 'react';
import { type Variants, motion, useReducedMotion } from 'framer-motion';
import Translate, { translate } from '@docusaurus/Translate';
import ShimmerButton from '@site/src/components/magicui/shimmer-button';
import TypingAnimation from '@site/src/components/magicui/typing-animation';
import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useHistory } from '@docusaurus/router';

import styles from './styles.module.css';

// 简化的动画变体 - 使用更轻量的配置
const containerVariants: Variants = {
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
      staggerChildren: 0.1,
    },
  },
  hidden: { 
    opacity: 0, 
    y: 15,
  },
};

const itemVariants: Variants = {
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  hidden: { 
    opacity: 0, 
    y: 15,
  },
};

// 使用 CSS 动画替代 Framer Motion 的鼠标追踪
function Name() {
  const nameRef = useRef<HTMLSpanElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const rafRef = useRef<number>(0);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!nameRef.current) return;
    const bounding = nameRef.current.getBoundingClientRect();
    // 使用 RAF 节流
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      setMousePos({
        x: e.clientX - bounding.x - bounding.width / 2,
        y: e.clientY - bounding.y - bounding.height / 2,
      });
      rafRef.current = 0;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <motion.div
      className={styles.hero_text}
      variants={itemVariants}
    >
      <Translate id="homepage.hero.greet"></Translate>
      <span
        ref={nameRef}
        className={styles.name}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          '--mouse-x': `${mousePos.x}px`,
          '--mouse-y': `${mousePos.y}px`,
          '--lighting-opacity': isHovered ? 1 : 0.8,
        } as React.CSSProperties}
      >
        <Translate id="homepage.hero.name"></Translate>
      </span>
      <span className="ml-1">👋</span>
    </motion.div>
  );
}

function Hero() {
  const history = useHistory();
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.div 
      className={styles.hero}
      initial="hidden"
      animate="visible"
      variants={prefersReducedMotion ? undefined : containerVariants}
    >
      <div className={styles.intro}>
        <Name />
        <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
          <TypingAnimation
            className={styles.intro_text}
            duration={40}
            text={translate({ id: 'homepage.hero.text' })}
          />
        </motion.div>

        <motion.div
          className="mt-4 flex gap-2"
          variants={prefersReducedMotion ? undefined : itemVariants}
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
        variants={prefersReducedMotion ? undefined : itemVariants}
      >
        <ThemedImage
          className={styles.background_svg}
          alt="Homepage Hero"
          sources={{
            light: useBaseUrl('/img/Homepage/undraw_hero.svg'),
            dark: useBaseUrl('/img/Homepage/undraw_hero_dark.svg'),
          }}
        />
        <div className={styles.circle} />
      </motion.div>
    </motion.div>
  );
}

export default memo(Hero);
