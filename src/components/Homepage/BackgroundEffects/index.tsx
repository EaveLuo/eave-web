import { memo } from 'react';
import styles from './styles.module.css';

function BackgroundEffects() {
  return (
    <div className={styles.background} aria-hidden="true">
      <div className={styles.surface} />
      <div className={styles.matrix} />
      <div className={styles.routes} />
      <div className={styles.moduleMarks} />
      <div className={styles.readabilityMask} />
    </div>
  );
}

export default memo(BackgroundEffects);
