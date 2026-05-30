import { memo } from 'react';
import styles from './styles.module.css';

function BackgroundEffects() {
  return (
    <div className={styles.background} aria-hidden="true">
      <div className={styles.paper} />
      <div className={styles.grid} />
      <div className={styles.sectionBands} />
      <div className={styles.traceLines} />
      <div className={styles.readabilityMask} />
    </div>
  );
}

export default memo(BackgroundEffects);
