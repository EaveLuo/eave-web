'use client';

import { cn } from '@site/src/lib/utils';
import { useEffect, useState, useRef, useCallback } from 'react';

interface TypingAnimationProps {
  text: string;
  duration?: number;
  className?: string;
  delay?: number;
}

export default function TypingAnimation({
  text,
  duration = 50,
  className,
  delay = 0,
}: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isStarted, setIsStarted] = useState(false);
  const indexRef = useRef(0);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const animate = useCallback((currentTime: number) => {
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = currentTime;
    }

    const deltaTime = currentTime - lastTimeRef.current;

    if (deltaTime >= duration) {
      if (indexRef.current < text.length) {
        setDisplayedText(text.slice(0, indexRef.current + 1));
        indexRef.current += 1;
        lastTimeRef.current = currentTime;
        rafRef.current = requestAnimationFrame(animate);
      }
    } else {
      rafRef.current = requestAnimationFrame(animate);
    }
  }, [text, duration]);

  useEffect(() => {
    // 延迟启动
    const startTimeout = setTimeout(() => {
      setIsStarted(true);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [delay]);

  useEffect(() => {
    if (!isStarted) return;

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isStarted, animate]);

  return (
    <p
      className={cn(
        'font-display text-center text-4xl font-bold leading-[5rem] tracking-[-0.02em] drop-shadow-xs',
        className
      )}
    >
      {displayedText || '\u00A0'}
    </p>
  );
}
