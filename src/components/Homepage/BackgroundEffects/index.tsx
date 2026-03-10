import { memo } from 'react';
import styles from './styles.module.css';

/**
 * 优化版 CSS 背景效果
 * - 柔和渐变，不干扰阅读
 * - 缓慢呼吸动画，增加动态感
 * - 底部遮罩确保文字可读性
 */
function BackgroundEffects() {
  return (
    <div className={styles.background} aria-hidden="true">
      {/* 基础渐变背景 */}
      <div className={styles.gradientBase} />
      
      {/* 呼吸光晕 */}
      <div className={styles.glowOrb} />
      <div className={styles.glowOrbSecondary} />
      
      {/* 极淡网格 */}
      <div className={styles.gridLines} />
      
      {/* 微妙浮动点 */}
      <div className={styles.floatingDots} />
      
      {/* 装饰圆环 */}
      <div className={styles.decorativeRing} />
      
      {/* 可读性遮罩 */}
      <div className={styles.readabilityMask} />
    </div>
  );
}

export default memo(BackgroundEffects);
