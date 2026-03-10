import { memo } from 'react';
import styles from './styles.module.css';

/**
 * 轻量级 CSS 背景效果
 * 使用纯 CSS 实现，无 JS 计算，零阻塞
 */
function BackgroundEffects() {
  return (
    <div className={styles.background} aria-hidden="true">
      {/* 渐变光晕 */}
      <div className={styles.gradientOrb} />
      <div className={styles.gradientOrbSecondary} />
      
      {/* 网格背景 */}
      <div className={styles.gridPattern} />
      
      {/* 浮动装饰 */}
      <div className={styles.floatingShape} />
      <div className={styles.floatingShapeSecondary} />
    </div>
  );
}

export default memo(BackgroundEffects);
