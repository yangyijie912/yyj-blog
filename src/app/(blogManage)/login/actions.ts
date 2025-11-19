'use server';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { signSession } from '@/lib/auth';
import { compareSync } from 'bcryptjs';
import { generateCsrfToken } from '@/lib/csrf';
import { prisma } from '@/db';
import type { ActionResult } from '@/types/actions';

// 简单登录限流：5分钟内最多5次尝试（按IP）。
const WINDOW_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const attempts: Map<string, number[]> = new Map();

// 记录一次尝试，返回当前窗口内的尝试次数
function recordAttempt(key: string) {
  const now = Date.now();
  const list = attempts.get(key) || [];
  const fresh = list.filter((t: number) => now - t < WINDOW_MS);
  fresh.push(now);
  attempts.set(key, fresh);
  return fresh.length;
}

export async function loginAction(formData: FormData): Promise<ActionResult | void> {
  // 提取表单数据和客户端IP
  const username = (formData.get('username') || '').toString().trim();
  const password = (formData.get('password') || '').toString();
  const fromRaw = (formData.get('from') || '').toString();
  const ip = (await headers()).get('x-forwarded-for') || 'unknown';

  // 限流：超过阈值拒绝
  const count = recordAttempt(ip);
  if (count > MAX_ATTEMPTS) {
    return { ok: false, message: '尝试过多，请稍后再试' };
  }

  // 基本输入验证
  if (!username || !password) {
    return { ok: false, message: '用户名和密码不能为空' };
  }

  // 计算安全回跳地址：仅允许以单斜杠开头的站内路径，避免开放重定向
  const nextPath = (() => {
    const t = (fromRaw || '').trim();
    if (!t) return '/dashboard';
    if (!t.startsWith('/')) return '/dashboard';
    if (t.startsWith('//')) return '/dashboard';
    // 避免回跳回登录页造成循环
    if (t === '/login' || t.startsWith('/login?')) return '/dashboard';
    return t;
  })();

  // 从数据库查询用户
  let success = false;
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        passwordHash: true,
        role: true,
        isActive: true,
      },
    });

    // 用户不存在
    if (!user) {
      return { ok: false, message: '用户不存在' };
    }

    // 账号被禁用
    if (!user.isActive) {
      return { ok: false, message: '账号已被禁用，请联系管理员' };
    }

    // 验证密码：通过bcrypt和数据库中的哈希值比对密码
    const passwordMatch = compareSync(password, user.passwordHash);
    if (!passwordMatch) {
      return { ok: false, message: '密码错误' };
    }

    // 登录成功，签发 session 和 CSRF token
    const token = await signSession(
      {
        sub: user.id,
        username: user.username,
        role: user.role,
      },
      '8h'
    );
    const csrf = generateCsrfToken();

    // 会话 Cookie（httpOnly，防止客户端脚本访问）
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'session',
      value: token,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 8,
    });

    // CSRF: 双提交 Cookie（非 httpOnly，供客户端读取并回传）
    cookieStore.set({
      name: 'csrf',
      value: csrf,
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 8,
    });

    success = true;
  } catch (error) {
    console.error('登录错误:', error);
    return { ok: false, message: '登录失败，请稍后重试' };
  }

  if (success) {
    // 将重定向放在 try/catch 之外，避免被捕获
    redirect(nextPath);
  }
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();

  // 清除 session cookie
  cookieStore.set({
    name: 'session',
    value: '',
    path: '/',
    maxAge: 0,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  // 清除 csrf cookie
  cookieStore.set({
    name: 'csrf',
    value: '',
    path: '/',
    maxAge: 0,
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  redirect('/login');
}
