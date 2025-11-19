'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import classnames from 'classnames';
import { useTranslations } from 'next-intl';

export type Skill = {
  name: string;
  value: number; // 0-100
  image: string;
};

interface SkillsProps {
  title?: string;
  subtitle?: string;
  skills: Skill[];
}

/**
 * -带进度条的技能展示
 * -幻灯片轮播动画（暂停悬停）
 * -悬停技能切换图像和暂停轮播
 * -悬停时进度条从0开始动画
 * -完全响应式布局
 */
export default function Skills({ title, subtitle, skills }: SkillsProps) {
  const t = useTranslations();
  const displayTitle = title ?? t('skills.title');
  const displaySubtitle = subtitle ?? t('skills.subtitle');

  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [carouselProgress, setCarouselProgress] = useState(0); // 0->1 轮播期间激活技能的进度

  // 3s自动轮播切换技能图片
  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => {
      setSlideDirection('right');
      setActiveIndex((prev) => (prev + 1) % skills.length);
    }, 3000);
    return () => clearInterval(id);
  }, [skills.length, isPaused]);

  // 进度条动画：每次（重新）开始时1秒填充
  useEffect(() => {
    if (isPaused) return;
    setCarouselProgress(0);
    let frame: number;
    let start: number | null = null;
    const duration = 1000; // 1s 进度填充
    const step = (ts: number) => {
      if (start === null) start = ts;
      const elapsed = ts - start;
      const pct = Math.min(elapsed / duration, 1);
      setCarouselProgress(pct);
      if (pct < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [activeIndex, isPaused]);

  // 鼠标悬停暂停轮播并显示对应图像
  const handleMouseEnter = (idx: number) => {
    setHoveredIndex(idx);
    setIsPaused(true);
    setCarouselProgress(0);

    // 切换到悬停的图像并设置合适的滑动方向
    if (idx !== activeIndex) {
      setSlideDirection(idx > activeIndex ? 'right' : 'left');
      setActiveIndex(idx);
    }
  };

  // 鼠标离开恢复自动轮播
  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setIsPaused(false);
  };

  // 点击技能切换图像
  const handleClick = (idx: number) => {
    setSlideDirection(idx > activeIndex ? 'right' : 'left');
    setActiveIndex(idx);
  };

  return (
    <section className="w-full overflow-hidden bg-[#0b1220] text-white pb-20 md:pb-24 lg:pb-28">
      {/* Header */}
      <div className="px-6 sm:px-10 pt-10 text-center mx-auto">
        <h2 className="text-4xl sm:text-5xl font-bold tracking-wide">{displayTitle}</h2>
        <div className="mt-4 text-white/80 leading-relaxed max-w-3xl mx-auto">{displaySubtitle}</div>
        <div className="mx-auto mt-5 h-1.5 w-28 rounded-full bg-yellow-500 relative">
          <span className="absolute -top-2 -left-2 h-3 w-3 rounded-full bg-yellow-500 animate-pulse" />
          <span className="absolute -top-2 -right-2 h-3 w-3 rounded-full bg-yellow-500 animate-pulse" />
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-6 sm:px-10 py-10 items-center">
        {/* 左边图片区 */}
        <div className="rounded-xl overflow-hidden bg-[#1c1f26] aspect-4/3 flex items-center justify-center relative">
          <div
            className={classnames('w-full h-full absolute inset-0 transition-transform duration-500 ease-in-out', {
              'animate-slide-in-right': slideDirection === 'right',
              'animate-slide-in-left': slideDirection === 'left',
            })}
            key={activeIndex}
          >
            <Image
              src={skills[activeIndex].image}
              alt={skills[activeIndex].name}
              width={800}
              height={600}
              className="w-full h-full object-contain p-8"
              priority={false}
            />
          </div>
        </div>

        {/* 右侧技能列表 - 悬停暂停轮播并显示进度 */}
        <ul className="list-none m-0 p-0 flex flex-col gap-6">
          {skills.map((s, idx) => {
            const isActive = idx === activeIndex;
            const isHovered = idx === hoveredIndex;
            // 悬停时显示完整进度；自动轮播期间如果activeIndex匹配则从0开始动画
            const isActiveAuto = idx === activeIndex && !isPaused;
            const progressWidth = isHovered ? s.value : isActiveAuto ? s.value * carouselProgress : 0;
            const progressBarClass = isHovered
              ? 'h-full rounded-full bg-yellow-500 transition-[width] duration-1000 ease-out'
              : 'h-full rounded-full bg-yellow-500';

            return (
              <li
                key={s.name}
                aria-label={`${s.name} ${s.value}%`}
                className="cursor-pointer transition-transform hover:scale-105"
                onClick={() => handleClick(idx)}
                onMouseEnter={() => handleMouseEnter(idx)}
                onMouseLeave={handleMouseLeave}
              >
                <div
                  className={classnames('mb-1 flex items-center justify-between font-medium', {
                    'text-yellow-400': isActive,
                    'text-white/90': !isActive,
                  })}
                >
                  <span>{s.name}</span>
                  <span className="text-white/90">{s.value}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-white/20 overflow-hidden">
                  <div
                    className={progressBarClass}
                    style={{ width: `${Math.min(Math.max(progressWidth, 0), 100)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 添加自定义动画样式 */}
      <style jsx>{`
        @keyframes slide-in-right {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slide-in-left {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.5s ease-out forwards;
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.5s ease-out forwards;
        }
      `}</style>
    </section>
  );
}
