'use client';

import React, { useLayoutEffect, useRef, useState, useTransition } from 'react';
import { useLocale } from 'next-intl';
import { locales, type Locale } from '@/i18n/locales';
import classnames from 'classnames';

// 可拖拽的单按钮语言切换器
export default function LanguageSwitcher({ initialPos }: { initialPos: { x: number; y: number } | null }) {
  const current = useLocale();
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLButtonElement | null>(null);

  // 位置为空，默认锚定在右上角，初始为 null 以确保服务器和客户端的初始渲染匹配
  const [pos, setPos] = useState<{ x: number; y: number } | null>(initialPos ?? null);
  const [isDragging, setIsDragging] = useState(false); // 是否正在拖拽
  const draggingRef = useRef(false); // 拖拽状态的 ref，避免事件处理器闭包问题
  const startRef = useRef({ x: 0, y: 0 }); // 拖拽起始点
  const originRef = useRef({ x: 0, y: 0 }); // 拖拽目标点
  const preventClickRef = useRef(false); // 用于阻止点击事件（如果是拖拽的话）
  const moveScheduledRef = useRef<number | null>(null); // 用于节流位置更新的动画帧 ID
  const pendingPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 }); // 用于存储待应用的位置
  const rectRef = useRef<DOMRect | null>(null); // 按钮的边界矩形，用于位置限制

  // 组件挂载后尝试从 localStorage 恢复位置
  useLayoutEffect(() => {
    try {
      const raw = localStorage.getItem('languageSwitcherPos');
      if (raw) {
        const parsed = JSON.parse(raw) as { x?: unknown; y?: unknown };
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          // 挂载后应用位置（useLayoutEffect），以确保服务器和客户端的初始 HTML 匹配
          setPos({ x: parsed.x, y: parsed.y });
        }
      }
    } catch {
      // 忽略错误
    }
  }, []);

  // 当从 localStorage 恢复位置后，或者窗口尺寸变化时，确保位置在视口内（防止在移动端被放到屏幕外）
  useLayoutEffect(() => {
    if (pos == null) return;

    // 捕获当前 pos 值以避免闭包中 pos 被视为可空
    const currentPos = pos;
    let raf = 0;
    const pad = 8;

    function clampPos() {
      const el = ref.current;
      const rect = el?.getBoundingClientRect() ?? { width: 48, height: 32 };
      const maxX = Math.max(pad, window.innerWidth - rect.width - pad);
      const maxY = Math.max(pad, window.innerHeight - rect.height - pad);
      const clampedX = Math.min(Math.max(pad, currentPos.x), maxX);
      const clampedY = Math.min(Math.max(pad, currentPos.y), maxY);
      if (clampedX !== currentPos.x || clampedY !== currentPos.y) {
        // 使用 requestAnimationFrame 以避免布局抖动
        raf = requestAnimationFrame(() => setPos({ x: clampedX, y: clampedY }));
      }
    }

    // 立刻尝试夹紧一次（组件已挂载，ref 很可能可用）
    clampPos();

    // 在窗口调整时重新夹紧
    window.addEventListener('resize', clampPos);
    return () => {
      window.removeEventListener('resize', clampPos);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pos]);

  // 保存位置到 localStorage 和 cookie
  function savePos(p: { x: number; y: number }) {
    try {
      localStorage.setItem('languageSwitcherPos', JSON.stringify(p));
      // 同步到 cookie 以便服务器渲染使用
      try {
        document.cookie = `languageSwitcherPos=${encodeURIComponent(JSON.stringify(p))};path=/;max-age=${
          60 * 60 * 24 * 365
        }`;
      } catch {}
    } catch {}
  }

  // 切换语言并刷新页面
  function changeLocale(loc: Locale) {
    if (loc === current) return;
    document.cookie = `locale=${loc};path=/;max-age=${60 * 60 * 24 * 365}`;
    startTransition(() => window.location.reload());
  }

  // 循环切换到列表中的下一个语言，仅当未拖拽（移动距离低于阈值）时触发点击
  function handleClick() {
    if (preventClickRef.current) {
      preventClickRef.current = false;
      return;
    }
    const idx = locales.indexOf(current as Locale);
    const next = locales[(idx + 1) % locales.length] as Locale;
    changeLocale(next);
  }

  // 拖拽事件处理器
  function onPointerDown(e: React.PointerEvent) {
    const el = ref.current;
    if (!el) return;
    // 缓存按钮的边界矩形以便限制位置
    rectRef.current = el.getBoundingClientRect();

    // 如果当前锚定在右上角，切换到绝对坐标
    if (pos === null && rectRef.current) {
      setPos({ x: rectRef.current.left, y: rectRef.current.top });
      originRef.current = { x: rectRef.current.left, y: rectRef.current.top };
    } else if (pos) {
      originRef.current = { x: pos.x, y: pos.y };
    }

    draggingRef.current = true;
    setIsDragging(true);
    preventClickRef.current = false;
    startRef.current = { x: e.clientX, y: e.clientY };
    // 捕获指针，以便即使光标离开按钮也能继续接收移动和抬起事件
    (e.target as Element).setPointerCapture(e.pointerId);
  }

  // 拖拽移动处理器
  function onPointerMove(e: React.PointerEvent) {
    if (!draggingRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    const newX = originRef.current.x + dx;
    const newY = originRef.current.y + dy;

    // 如果移动超过小阈值，则视为拖拽并阻止点击
    const moved = Math.hypot(dx, dy);
    if (moved > 6) preventClickRef.current = true;

    // 使用缓存的矩形限制在视口内
    const rect = rectRef.current;
    const pad = 8;
    let clampedX = newX;
    let clampedY = newY;
    if (rect) {
      const maxX = Math.max(pad, window.innerWidth - rect.width - pad);
      const maxY = Math.max(pad, window.innerHeight - rect.height - pad);
      clampedX = Math.min(Math.max(pad, newX), maxX);
      clampedY = Math.min(Math.max(pad, newY), maxY);
    }

    pendingPosRef.current = { x: clampedX, y: clampedY };
    if (moveScheduledRef.current == null) {
      moveScheduledRef.current = requestAnimationFrame(() => {
        moveScheduledRef.current = null;
        setPos({ x: pendingPosRef.current.x, y: pendingPosRef.current.y });
      });
    }
  }

  // 拖拽结束处理器
  function onPointerUp(e: React.PointerEvent) {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setIsDragging(false);
    try {
      (e.target as Element).releasePointerCapture(e.pointerId);
    } catch {}
    // 保存移动后的位置
    if (moveScheduledRef.current != null) {
      // 取消未完成的动画帧并立即应用位置
      cancelAnimationFrame(moveScheduledRef.current);
      moveScheduledRef.current = null;
      const finalPos = { x: pendingPosRef.current.x, y: pendingPosRef.current.y };
      setPos(finalPos);
      savePos(finalPos);
    } else if (pos) {
      savePos(pos);
    }
  }

  // 按钮标签是当前语言的大写形式
  const label = pending ? '…' : (current || locales[0]).toUpperCase();

  // 固定定位，默认锚定右上角；如果设置了 pos，则使用 left/top 定位
  const style: React.CSSProperties = pos
    ? {
        position: 'fixed',
        left: Math.max(8, pos.x),
        top: Math.max(8, pos.y),
        zIndex: 2147483647,
        touchAction: 'none',
        transform: isDragging ? 'translateZ(0) scale(0.98)' : 'translateZ(0)',
      }
    : {
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 2147483647,
        touchAction: 'none',
      };

  return (
    <button
      ref={ref}
      aria-label="Switch language"
      title={current === 'en' ? 'Switch language (this button is draggable)' : '切换语言（该按钮可拖动）'}
      onClick={handleClick}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      disabled={pending}
      style={style}
      className={classnames(
        'select-none px-3 py-1.5 rounded-md text-xs border transition bg-slate-800/80 border-slate-600 text-slate-200 hover:border-cyan-400',
        {
          'opacity-70 cursor-wait': pending,
          'cursor-grabbing': isDragging && !pending,
          'cursor-grab hover:scale-105 active:scale-95': !isDragging && !pending,
        }
      )}
    >
      {label}
    </button>
  );
}
