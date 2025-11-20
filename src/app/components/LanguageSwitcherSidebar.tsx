/**
 * 简化版语言切换器，用于侧边栏左上角（不可拖拽）
 */

'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import { locales, type Locale } from '@/i18n/locales';
import classnames from 'classnames';

// 简化版语言切换器，用于侧边栏左上角（不可拖拽）
export default function LanguageSwitcherSidebar() {
  const current = useLocale();

  function handleClick() {
    const idx = locales.indexOf(current as Locale);
    const next = locales[(idx + 1) % locales.length] as Locale;
    try {
      document.cookie = `locale=${next};path=/;max-age=31536000`;
    } catch {}
    // 切换后刷新页面以应用语言
    if (typeof window !== 'undefined') window.location.reload();
  }

  const label = (current || locales[0]).toUpperCase();

  return (
    <button
      aria-label="Switch language"
      title="切换语言"
      onClick={handleClick}
      className={classnames(
        'select-none px-2 py-1 rounded-md text-xs border bg-slate-800/80 border-slate-600 text-slate-200',
        'absolute left-3 top-3 z-50'
      )}
    >
      {label}
    </button>
  );
}
