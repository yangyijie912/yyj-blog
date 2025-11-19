'use client';

export type ToastType = 'success' | 'error' | 'info';
export type ToastPayload = { message: string; type?: ToastType };

type Listener = (payload: ToastPayload) => void;

const listeners = new Set<Listener>();

export function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emit(payload: ToastPayload) {
  listeners.forEach((l) => l(payload));
  // 通过 window 事件广播，确保跨组件边界可靠传递
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new CustomEvent<ToastPayload>('app:toast', { detail: payload }));
    } catch {
      // 忽略异常
    }
  }
}
