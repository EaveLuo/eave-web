import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  placeholder?: string;
  loading?: 'lazy' | 'eager';
}

/**
 * 懒加载图片组件
 * 支持占位图、渐入动画、错误处理
 */
export default function LazyImage({
  src,
  alt,
  className,
  width,
  height,
  placeholder = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  loading = 'lazy',
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            img.src = src;
            observer.unobserve(img);
          }
        });
      },
      { rootMargin: '50px' }
    );

    if (loading === 'lazy') {
      observer.observe(img);
    } else {
      img.src = src;
    }

    return () => observer.disconnect();
  }, [src, loading]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div
      className={clsx(styles.imageContainer, className)}
      style={{ width, height }}
    >
      <img
        ref={imgRef}
        src={placeholder}
        alt={alt}
        className={clsx(styles.image, isLoaded && styles.loaded, hasError && styles.error)}
        onLoad={handleLoad}
        onError={handleError}
        loading={loading === 'eager' ? 'eager' : undefined}
      />
      {!isLoaded && !hasError && (
        <div className={styles.placeholder}>{alt}</div>
      )}
      {hasError && <div className={styles.error}>图片加载失败</div>}
    </div>
  );
}
