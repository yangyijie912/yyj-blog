import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

type Theme = 'light' | 'dark' | 'system';

const COOKIE_NAME = 'theme';
const MAX_AGE = 60 * 60 * 24 * 180; // 180 天

// 获取当前主题偏好
export async function GET() {
  const theme = (await cookies()).get(COOKIE_NAME)?.value as Theme | undefined;
  return NextResponse.json({ theme: theme || 'system' });
}

// 设置主题偏好
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { theme?: unknown };
    const theme = String(body?.theme || '') as Theme;
    if (!['light', 'dark', 'system'].includes(theme)) {
      return NextResponse.json({ ok: false, message: 'invalid theme' }, { status: 400 });
    }

    const res = NextResponse.json({ ok: true });
    const jar = await cookies();

    // 记住用户选择：light/dark/system
    jar.set({
      name: COOKIE_NAME,
      value: theme,
      path: '/',
      sameSite: 'lax',
      maxAge: MAX_AGE,
    });

    return res;
  } catch {
    return NextResponse.json({ ok: false, message: 'unknown error' }, { status: 500 });
  }
}
