import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth';
import { generateCsrfToken } from '@/lib/csrf';
import { locales, defaultLocale, type Locale } from '@/i18n/locales';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const searchParams = req.nextUrl.searchParams;
  const session = req.cookies.get('session')?.value;

  /**
   * 以下逻辑用于处理登录认证和重定向
   */
  let isAuthed = false;
  // 验证 session 有效性
  if (session) {
    const payload = await verifySession(session);
    // 检查用户是否已认证
    isAuthed = !!payload && !!payload.sub;
  }
  // 是否为登录页面
  const isLogin = pathname === '/login';
  // 查询是否为受保护页面 - blogManage 下的所有路由（除了 login）
  const isProtected =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/writing') ||
    pathname.startsWith('/projects') ||
    pathname.startsWith('/project-list') ||
    pathname.startsWith('/blog-list') ||
    pathname.startsWith('/categories') ||
    pathname.startsWith('/users') ||
    pathname.startsWith('/logout');

  if (isLogin && isAuthed) {
    // req.nextUrl不应该直接被改动,克隆一份用于修改
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    const res = NextResponse.redirect(url);
    // 若已登录但缺少 CSRF，则一并补发
    if (!req.cookies.get('csrf')?.value) {
      res.cookies.set({
        name: 'csrf',
        value: generateCsrfToken(),
        httpOnly: false,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 8,
      });
    }
    return res;
  }

  if (isProtected && !isAuthed) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    // 记录用户原本想访问的受保护页面地址保存到查询参数from,登录成功后可以把用户重定向回原来的页面
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  /**
   * 以下逻辑用于处理国际化 locale 头注入和 cookie 管理
   * // 参考 next-intl 文档：https://next-intl.dev/docs/getting-started
   */

  // 计算 locale：cookie > Accept-Language > default
  let locale = req.cookies.get('locale')?.value as Locale | undefined;
  if (!locale || !locales.includes(locale)) {
    const acceptRaw = req.headers.get('accept-language');
    if (acceptRaw) {
      const segments: string[] = acceptRaw.split(',').map((s: string) => s.trim().toLowerCase());
      const found = segments
        .map((seg) => seg.split(';')[0])
        .map((seg) => seg.split('-')[0] as Locale)
        .find((seg) => locales.includes(seg));
      locale = found || defaultLocale;
    } else {
      locale = defaultLocale;
    }
  }

  // 若存在临时参数 _lang/_ts，清理后重定向到干净 URL
  if (searchParams.has('_lang') || searchParams.has('_ts')) {
    const clean = req.nextUrl.clone();
    clean.searchParams.delete('_lang');
    clean.searchParams.delete('_ts');
    const redirectRes = NextResponse.redirect(clean);
    return redirectRes;
  }

  // 克隆原始请求头并附加 locale，避免丢失其它必要头
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-next-intl-locale', locale);

  const res = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // 若缺少 locale cookie 则写入，保持后续刷新一致性
  if (!req.cookies.get('locale')?.value) {
    res.cookies.set({
      name: 'locale',
      value: locale,
      path: '/',
      sameSite: 'lax',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  /**
   * 以下逻辑用于处理 CSRF 令牌的写入
   */

  // 若用户已认证但缺少 CSRF，则写入 CSRF cookie
  if (isAuthed && !req.cookies.get('csrf')?.value) {
    res.cookies.set({
      name: 'csrf',
      value: generateCsrfToken(),
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 8,
    });
  }
  return res;
}

export const config = {
  // 匹配所有应用路由(排除 _next/static 等)以保证 locale 头注入
  matcher: ['/((?!_next|_static|favicon.ico|robots.txt|sitemap.xml).*)'],
};
