import type { Metadata } from 'next';
import Sidebar from './components/Sidebar';
import ToastManager from './components/ToastManager';
import LanguageSwitcher from './components/LanguageSwitcher';
import Footer from './components/Footer';
import './globals.css';
import { cookies } from 'next/headers';
import { NextIntlClientProvider } from 'next-intl';
import type { Locale } from '@/i18n/locales';
import { locales, defaultLocale } from '@/i18n/locales';
import { loadMessages } from '@/i18n/request';
// Markdown 编辑器样式（Bytemd 在各自组件内引入）

export const metadata: Metadata = {
  title: "yyj's blog",
  description: '我的个人博客',
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get('theme')?.value as 'light' | 'dark' | 'system' | undefined;
  const initialThemeAttr = themeCookie === 'light' || themeCookie === 'dark' ? themeCookie : undefined;

  // 仅依赖 cookie（无则 fallback 默认），避免对 middleware header 修改的依赖
  const cookieLocale = cookieStore.get('locale')?.value as Locale | undefined;
  const locale: Locale = cookieLocale && locales.includes(cookieLocale) ? cookieLocale : defaultLocale;
  const messages = await loadMessages(locale);
  // try to parse saved language switcher position from cookie so server can render it
  let initialLanguageSwitcherPos: { x: number; y: number } | undefined = undefined;
  try {
    const rawPos = cookieStore.get('languageSwitcherPos')?.value;
    if (rawPos) {
      const parsed = JSON.parse(decodeURIComponent(rawPos)) as { x?: unknown; y?: unknown };
      if (parsed && typeof parsed.x === 'number' && typeof parsed.y === 'number') {
        initialLanguageSwitcherPos = { x: parsed.x, y: parsed.y };
      }
    }
  } catch {
    // ignore parse errors
  }
  return (
    <html lang={locale} data-theme={initialThemeAttr}>
      <head>
        {/* 使用 SVG favicon（现代浏览器支持），并保留常见备用 */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.svg" />
        {/* 首屏主题无闪烁：若为 system 或未设置，则根据系统偏好设置 data-theme */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var m=document.cookie.match(/(?:^|; )theme=([^;]+)/);var v=m?decodeURIComponent(m[1]):'';if(v!=='light'&&v!=='dark'){v=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'};document.documentElement.setAttribute('data-theme',v);}catch(e){}})();",
          }}
        />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="app-root">
            <Sidebar />
            <div className="content">
              <main className="main">{children}</main>
              <Footer />
            </div>
          </div>
          <LanguageSwitcher initialPos={initialLanguageSwitcherPos ?? null} />
          <ToastManager />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
