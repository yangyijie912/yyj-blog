'use client';
import React, { useEffect, useRef } from 'react';

// 使用canvas实现的一个轻量级的代码雨背景
// 填充父容器；颜色适应类似主题的深色背景
export default function MatrixRain({
  density = 0.9, // higher -> more columns
  speed = 1.0, // overall speed multiplier
  className = '',
}: {
  density?: number;
  speed?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let stopped = false;
    const DPR = Math.min(2, window.devicePixelRatio || 1);

    const symbols = '01{}[]<>/\\:=+-_*#@$&%ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    // Column state
    let w = 0,
      h = 0,
      fontSize = 16,
      columns = 0 as number,
      yPositions: number[] = [];

    const resize = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      w = clientWidth;
      h = clientHeight;
      canvas.width = Math.max(1, Math.floor(w * DPR));
      canvas.height = Math.max(1, Math.floor(h * DPR));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      fontSize = Math.max(12, Math.floor(16 * DPR));
      columns = Math.max(1, Math.floor((w * density) / (fontSize / DPR)));
      yPositions = new Array(columns).fill(0).map(() => Math.random() * -100);
      ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`;
    };

    const step = () => {
      if (stopped) return;
      // Trail background with alpha for streak effect
      ctx.fillStyle = 'rgba(2, 6, 23, 0.12)'; // slate-950 with alpha
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < columns; i++) {
        const char = symbols[(Math.random() * symbols.length) | 0];
        const x = (i * fontSize) % canvas.width;
        const y = (yPositions[i] * fontSize) % (canvas.height + 100);

        // green glow + occasional white head
        const isHead = Math.random() > 0.97;
        ctx.fillStyle = isHead ? 'rgba(255,255,255,0.85)' : '#22c55e'; // emerald-500
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = isHead ? 12 : 8;
        ctx.fillText(char, x, y);

        // advance
        yPositions[i] += (0.9 + Math.random() * 0.6) * speed;
        if (y > canvas.height && Math.random() > 0.975) {
          yPositions[i] = Math.random() * -20; // reset near top
        }
      }

      raf = requestAnimationFrame(step);
    };

    const ro = new ResizeObserver(resize);
    if (containerRef.current) ro.observe(containerRef.current);
    resize();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    raf = requestAnimationFrame(step);

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [density, speed]);

  return (
    <div ref={containerRef} className={`absolute inset-0 overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="block" />
      {/* soft radial vignette */}
      <div className="absolute inset-0 pointer-events-none bg-radial at-[70%_20%] from-emerald-300/10 via-transparent to-transparent" />
    </div>
  );
}
