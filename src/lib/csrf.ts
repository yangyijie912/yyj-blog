/**
 * 客户端 CSRF 工具函数
 */

/**
 * 从 cookie 中获取 CSRF token
 */
export function getCsrfToken(): string {
  const csrfCookie = document.cookie.split('; ').find((c) => c.startsWith('csrf='));
  return csrfCookie ? decodeURIComponent(csrfCookie.split('=')[1]) : '';
}

/**
 * 向 FormData 添加 CSRF token
 */
export function appendCsrfToken(formData: FormData): void {
  const token = getCsrfToken();
  if (token) {
    formData.append('csrf', token);
  }
}

/**
 * 服务端生成 CSRF token（统一逻辑，供登录 action 和 middleware 共用）
 * 优先使用 Web Crypto API（Edge 运行时兼容），回退到时间戳+随机字符串
 */
export function generateCsrfToken(): string {
  if (typeof globalThis !== 'undefined' && globalThis.crypto && 'randomUUID' in globalThis.crypto) {
    return globalThis.crypto.randomUUID();
  }
  // 回退方案（Node.js 环境或不支持 randomUUID 的环境）
  return `${Date.now()}_${Math.random().toString(36).slice(2)}`;
}
