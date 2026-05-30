import { memo } from 'react';
import styles from './styles.module.css';

function BackgroundEffects() {
  return (
    <div className={styles.background} aria-hidden="true">
      <div className={styles.canvas} />
      <div className={styles.editorialBlocks} />
      <div className={styles.ruleLines} />
      <div className={styles.cornerMarks} />
      <div className={styles.readabilityMask} />
    </div>
  );
}

export default memo(BackgroundEffects);
