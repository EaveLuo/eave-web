'use client';

import React, { useEffect, useRef, useCallback, useMemo } from 'react';

interface ParticlesProps {
  className?: string;
  quantity?: number;
  staticity?: number;
  ease?: number;
  size?: number;
  refresh?: boolean;
  color?: string;
  vx?: number;
  vy?: number;
}

function hexToRgb(hex: string): number[] {
  hex = hex.replace('#', '');
  const hexInt = parseInt(hex, 16);
  const red = (hexInt >> 16) & 255;
  const green = (hexInt >> 8) & 255;
  const blue = hexInt & 255;
  return [red, green, blue];
}

type Circle = {
  x: number;
  y: number;
  translateX: number;
  translateY: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  dx: number;
  dy: number;
  magnetism: number;
};

const Particles: React.FC<ParticlesProps> = ({
  className = '',
  quantity = 30, // 减少粒子数量
  staticity = 50,
  ease = 80,
  size = 0.4,
  refresh = false,
  color = '#ffffff',
  vx = 0,
  vy = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const circles = useRef<Circle[]>([]);
  const mouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const animationFrameId = useRef<number>(0);
  const isActive = useRef(true);
  const dpr = useMemo(() => (typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1), []);
  const rgb = useMemo(() => hexToRgb(color), [color]);

  // 使用 requestAnimationFrame 节流鼠标移动
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left - canvasSize.current.w / 2;
    const y = event.clientY - rect.top - canvasSize.current.h / 2;
    mouse.current.x = x;
    mouse.current.y = y;
  }, []);

  const remapValue = useCallback((
    value: number,
    start1: number,
    end1: number,
    start2: number,
    end2: number
  ): number => {
    const remapped = ((value - start1) * (end2 - start2)) / (end1 - start1) + start2;
    return remapped > 0 ? remapped : 0;
  }, []);

  const circleParams = useCallback((): Circle => {
    const x = Math.floor(Math.random() * canvasSize.current.w);
    const y = Math.floor(Math.random() * canvasSize.current.h);
    const pSize = Math.floor(Math.random() * 2) + size;
    const targetAlpha = parseFloat((Math.random() * 0.4 + 0.1).toFixed(1));
    const dx = (Math.random() - 0.5) * 0.05; // 降低速度
    const dy = (Math.random() - 0.5) * 0.05;
    const magnetism = 0.05 + Math.random() * 2;
    return {
      x,
      y,
      translateX: 0,
      translateY: 0,
      size: pSize,
      alpha: 0,
      targetAlpha,
      dx,
      dy,
      magnetism,
    };
  }, [size]);

  const drawCircle = useCallback((circle: Circle, update = false) => {
    if (!context.current) return;
    const { x, y, translateX, translateY, size, alpha } = circle;
    context.current.translate(translateX, translateY);
    context.current.beginPath();
    context.current.arc(x, y, size, 0, 2 * Math.PI);
    context.current.fillStyle = `rgba(${rgb.join(', ')}, ${alpha})`;
    context.current.fill();
    context.current.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (!update) {
      circles.current.push(circle);
    }
  }, [dpr, rgb]);

  const clearContext = useCallback(() => {
    if (!context.current) return;
    context.current.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h);
  }, []);

  const drawParticles = useCallback(() => {
    clearContext();
    circles.current = [];
    for (let i = 0; i < quantity; i++) {
      const circle = circleParams();
      drawCircle(circle);
    }
  }, [quantity, circleParams, drawCircle, clearContext]);

  const resizeCanvas = useCallback(() => {
    if (!canvasContainerRef.current || !canvasRef.current || !context.current) return;
    circles.current = [];
    canvasSize.current.w = canvasContainerRef.current.offsetWidth;
    canvasSize.current.h = canvasContainerRef.current.offsetHeight;
    canvasRef.current.width = canvasSize.current.w * dpr;
    canvasRef.current.height = canvasSize.current.h * dpr;
    canvasRef.current.style.width = `${canvasSize.current.w}px`;
    canvasRef.current.style.height = `${canvasSize.current.h}px`;
    context.current.scale(dpr, dpr);
    drawParticles();
  }, [dpr, drawParticles]);

  const animate = useCallback(() => {
    if (!isActive.current) return;
    
    clearContext();
    const circlesArray = circles.current;
    
    for (let i = circlesArray.length - 1; i >= 0; i--) {
      const circle = circlesArray[i];
      
      // 计算边缘距离
      const edge = [
        circle.x + circle.translateX - circle.size,
        canvasSize.current.w - circle.x - circle.translateX - circle.size,
        circle.y + circle.translateY - circle.size,
        canvasSize.current.h - circle.y - circle.translateY - circle.size,
      ];
      const closestEdge = Math.min(...edge);
      const remapClosestEdge = parseFloat(remapValue(closestEdge, 0, 20, 0, 1).toFixed(2));
      
      if (remapClosestEdge > 1) {
        circle.alpha = Math.min(circle.alpha + 0.02, circle.targetAlpha);
      } else {
        circle.alpha = circle.targetAlpha * remapClosestEdge;
      }
      
      circle.x += circle.dx + vx;
      circle.y += circle.dy + vy;
      
      const magnetismFactor = staticity / circle.magnetism;
      circle.translateX += (mouse.current.x / magnetismFactor - circle.translateX) / ease;
      circle.translateY += (mouse.current.y / magnetismFactor - circle.translateY) / ease;

      drawCircle(circle, true);

      // 边界检测 - 移出屏幕的粒子重置
      if (
        circle.x < -circle.size ||
        circle.x > canvasSize.current.w + circle.size ||
        circle.y < -circle.size ||
        circle.y > canvasSize.current.h + circle.size
      ) {
        circlesArray.splice(i, 1);
        const newCircle = circleParams();
        drawCircle(newCircle);
      }
    }
    
    animationFrameId.current = requestAnimationFrame(animate);
  }, [clearContext, drawCircle, circleParams, remapValue, staticity, ease, vx, vy]);

  useEffect(() => {
    if (!canvasRef.current) return;
    context.current = canvasRef.current.getContext('2d');
    resizeCanvas();
    animate();
    
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      isActive.current = false;
      cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [animate, resizeCanvas, handleMouseMove]);

  useEffect(() => {
    resizeCanvas();
  }, [refresh, resizeCanvas]);

  return (
    <div
      className={`${className} pointer-events-none`}
      ref={canvasContainerRef}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
};

export default Particles;
