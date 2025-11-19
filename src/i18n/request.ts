import { getRequestConfig } from 'next-intl/server';
import path from 'path';
import fs from 'fs/promises';
import { locales, defaultLocale, type Locale } from './locales';

export async function loadMessages(locale: Locale) {
  const file = path.join(process.cwd(), 'src', 'i18n', 'messages', `${locale}.json`);
  const data = await fs.readFile(file, 'utf-8');
  const flat = JSON.parse(data) as Record<string, string>;

  // 将 "a.b.c": "..." 形式转换为嵌套对象结构，兼容 next-intl 默认验证
  interface NestedMessages {
    [key: string]: string | NestedMessages;
  }

  const nest = (input: Record<string, string>): NestedMessages => {
    const out: NestedMessages = {};
    for (const [key, value] of Object.entries(input)) {
      const parts = key.split('.');
      let cur: NestedMessages = out;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLast = i === parts.length - 1;
        if (!isLast) {
          if (cur[part] && typeof cur[part] !== 'object') {
            // 冲突: 之前是字符串, 现在需要对象容纳子键 -> 提升为 {label: 原字符串}
            cur[part] = { label: cur[part] as string };
          }
          cur[part] = (cur[part] as NestedMessages) || {};
          cur = cur[part] as NestedMessages;
        } else {
          // 末尾: 如果已有对象(来自冲突提升), 将值放入 label, 否则直接赋值
          if (cur[part] && typeof cur[part] === 'object') {
            (cur[part] as NestedMessages).label = value;
          } else {
            cur[part] = value;
          }
        }
      }
    }
    return out;
  };
  return nest(flat);
}

export default getRequestConfig(async ({ requestLocale }) => {
  // 优先使用 requestLocale (从 middleware header 传递)
  let localeValue = (await requestLocale) as string | undefined;

  // 如果没有 requestLocale，尝试从 headers/cookies 读取
  if (!localeValue || !locales.includes(localeValue as Locale)) {
    // 动态导入 headers 和 cookies (仅在需要时)
    const { cookies, headers } = await import('next/headers');
    const cookieStore = await cookies();
    const headersList = await headers();

    // 1. 尝试从 cookie 读取
    const cookieLocale = cookieStore.get('locale')?.value as Locale | undefined;
    if (cookieLocale && locales.includes(cookieLocale)) {
      localeValue = cookieLocale;
    } else {
      // 2. 尝试从 middleware 注入的 header 读取
      const headerLocale = headersList.get('x-next-intl-locale') as Locale | undefined;
      if (headerLocale && locales.includes(headerLocale)) {
        localeValue = headerLocale;
      }
    }
  }

  const resolved = localeValue && locales.includes(localeValue as Locale) ? (localeValue as Locale) : defaultLocale;

  return {
    locale: resolved,
    messages: await loadMessages(resolved),
  };
});
