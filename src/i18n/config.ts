import { getRequestConfig } from 'next-intl/server';
// 仅服务器端使用：加载消息 & request config
import path from 'path';
import fs from 'fs/promises';
import { locales, defaultLocale, type Locale } from './locales';

export async function loadMessages(locale: Locale) {
  const file = path.join(process.cwd(), 'src', 'i18n', 'messages', `${locale}.json`);
  const data = await fs.readFile(file, 'utf-8');
  return JSON.parse(data);
}

// next-intl middleware 配置
export default getRequestConfig(async ({ requestLocale }) => {
  const localeValue = await requestLocale;
  const resolved = locales.includes(localeValue as Locale) ? (localeValue as Locale) : defaultLocale;

  return {
    locale: resolved,
    messages: await loadMessages(resolved),
  };
});
