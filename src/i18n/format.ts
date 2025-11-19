import { Locale, defaultLocale } from './locales';

// 日期格式化（统一入口，便于后续扩展时间区间、本地化相对时间等）
export function formatDate(date: Date | string | number, locale?: Locale, options?: Intl.DateTimeFormatOptions) {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const loc = locale || defaultLocale;
  return new Intl.DateTimeFormat(loc, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...options,
  }).format(d);
}

export function formatDateTime(date: Date | string | number, locale?: Locale, options?: Intl.DateTimeFormatOptions) {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const loc = locale || defaultLocale;
  return new Intl.DateTimeFormat(loc, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    ...options,
  }).format(d);
}

// 数字格式化（可扩展货币/百分比）
export function formatNumber(value: number, locale?: Locale, options?: Intl.NumberFormatOptions) {
  const loc = locale || defaultLocale;
  return new Intl.NumberFormat(loc, options).format(value);
}
