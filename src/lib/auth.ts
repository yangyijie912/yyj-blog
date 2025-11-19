import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

// 这是一个简单的基于 JWT 的认证实现，适用于 Next.js 13+ 的 App Router。
// 在生产环境中，请确保使用更安全的密钥管理和存储机制。

/**
 * verifySession - 低层 JWT 验证 (路由保护/middleware、只读页面的权限判断、其他验证函数的内部调用)
 * verifyAuth - 服务端身份验证（封装了verifySession，用于需要身份验证的服务端逻辑）
 * verifyAuthAndCsrf - 服务端身份 + CSRF 验证（封装了verifyAuth，用于表单提交等需要防止CSRF攻击的场景）
 * requireAuth - 和verifyAuth类似，但会在未认证时重定向到登录页
 */

const encoder = new TextEncoder();

// 获取用于签名和验证 JWT 的密钥
function getSecret() {
  const secret = process.env.AUTH_SECRET;

  // 生产环境严格检查
  if (process.env.NODE_ENV === 'production') {
    if (!secret || secret.length < 32) {
      throw new Error('生产环境必须配置足够长度的 AUTH_SECRET (至少32字符)');
    }
    if (secret.includes('dev-secret') || secret.includes('change-me') || secret.includes('test')) {
      throw new Error('生产环境不允许使用示例密钥');
    }
  }

  // 开发环境也需要密钥
  if (!secret) {
    throw new Error('AUTH_SECRET 环境变量未配置，请运行: npm run generate:secrets');
  }

  return encoder.encode(secret);
}
// 定义会话负载类型
export type SessionPayload = JWTPayload & {
  sub: string; // 用户ID
  username: string; // 用户名
  role: string; // 角色: admin, user
};

// 签发一个新的会话 JWT
export async function signSession(payload: SessionPayload, expiresIn: string = '8h') {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret());
}

// 验证会话 JWT 并返回负载，如果无效则返回 null
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

// 在服务器端强制要求认证，未认证则重定向到登录页
export async function requireAuth() {
  const token = (await cookies()).get('session')?.value;
  const payload = token ? await verifySession(token) : null;
  if (!payload || !payload.sub) {
    redirect('/login');
  }
  return {
    userId: payload.sub,
    username: payload.username,
    role: payload.role,
  };
}

// 强制要求管理员权限，非管理员重定向到登录页
export async function requireAdmin() {
  const token = (await cookies()).get('session')?.value;
  const payload = token ? await verifySession(token) : null;
  if (!payload || !payload.sub || payload.role !== 'admin') {
    redirect('/login');
  }
  return {
    userId: payload.sub,
    username: payload.username,
    role: payload.role,
  };
}

// 验证 CSRF token（双重提交模式）
export async function verifyCsrf(formData: FormData): Promise<boolean> {
  const csrfCookie = (await cookies()).get('csrf')?.value;
  // 优先使用表单中的 csrf，其次尝试从自定义请求头中获取
  let csrfClient = (formData.get('csrf') || '').toString();
  if (!csrfClient) {
    const h = await headers();
    const headerToken = h.get('x-csrf-token') || '';
    csrfClient = headerToken.toString();
  }
  return !!(csrfCookie && csrfClient && csrfCookie === csrfClient);
}

// 验证 CSRF token（通过直接传入的token）
export async function verifyCsrfToken(token: string): Promise<boolean> {
  const csrfCookie = (await cookies()).get('csrf')?.value;
  return !!(csrfCookie && token && csrfCookie === token);
}

// 验证身份并检查 CSRF token，返回验证结果
export async function verifyAuthAndCsrf(formData: FormData): Promise<{
  ok: boolean;
  message?: string;
  userId?: string;
  username?: string;
  role?: string;
}> {
  // 认证校验
  const token = (await cookies()).get('session')?.value;
  const payload = token ? await verifySession(token) : null;
  if (!payload || !payload.sub) {
    return { ok: false, message: '未登录或会话失效' };
  }

  // CSRF 双提交校验
  if (!(await verifyCsrf(formData))) {
    return { ok: false, message: 'CSRF 校验失败' };
  }

  return {
    ok: true,
    userId: payload.sub,
    username: payload.username,
    role: payload.role,
  };
}

// 验证身份（用于不需要CSRF的场景）
export async function verifyAuth(): Promise<{
  ok: boolean;
  message?: string;
  userId?: string;
  username?: string;
  role?: string;
}> {
  const token = (await cookies()).get('session')?.value;
  const payload = token ? await verifySession(token) : null;
  if (!payload || !payload.sub) {
    return { ok: false, message: '未登录或会话失效' };
  }
  return {
    ok: true,
    userId: payload.sub,
    username: payload.username,
    role: payload.role,
  };
}

// 验证管理员权限
export async function verifyAdmin(): Promise<{
  ok: boolean;
  message?: string;
  userId?: string;
  username?: string;
  role?: string;
}> {
  const token = (await cookies()).get('session')?.value;
  const payload = token ? await verifySession(token) : null;
  if (!payload || !payload.sub || payload.role !== 'admin') {
    return { ok: false, message: '需要管理员权限' };
  }
  return {
    ok: true,
    userId: payload.sub,
    username: payload.username,
    role: payload.role,
  };
}
