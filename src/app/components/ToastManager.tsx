'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import Toast from './Toast';
import { subscribe, ToastPayload } from '@/lib/toastBus';

export default function ToastManager() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    const handleToast = (payload: ToastPayload | null) => {
      if (payload?.message) {
        setToast({ message: payload.message, type: (payload.type as 'success' | 'error' | 'info') || 'info' });
      }
    };

    // 检查 URL 参数
    const message = searchParams.get('toast');
    const type = searchParams.get('toast_type') as 'success' | 'error' | 'info' | null;
    if (message) {
      handleToast({ message, type: type || 'info' });
      // 清除 URL 参数（不刷新页面）
      const url = new URL(window.location.href);
      url.searchParams.delete('toast');
      url.searchParams.delete('toast_type');
      window.history.replaceState({}, '', url.toString());
    }

    // 监听全局总线与 window 事件
    const onPayload = (payload: ToastPayload) => handleToast(payload);
    const unsubscribe = subscribe(onPayload);
    const onWindowToast = (e: Event) => handleToast((e as CustomEvent<ToastPayload>).detail);
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('app:toast', onWindowToast as EventListener);
    }

    return () => {
      unsubscribe();
      if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
        window.removeEventListener('app:toast', onWindowToast as EventListener);
      }
    };
  }, [searchParams, pathname]);

  if (!toast) return null;

  return <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />;
}
