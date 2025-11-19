'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

interface ModalProps {
  open: boolean;
  title?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
}

const sizeMap: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export default function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
  showCloseButton = true,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKey);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-60 flex items-start justify-center overflow-auto p-6 bg-black/50"
      onMouseDown={(e) => {
        if (!closeOnBackdrop) return;
        // 点击遮罩关闭，避免内容区域点击触发
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={`w-full ${sizeMap[size]} bg-white dark:bg-slate-800 rounded-lg shadow-xl mt-20`}
        role="dialog"
        aria-modal="true"
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{title}</div>
            {showCloseButton && (
              <button
                aria-label="关闭"
                onClick={onClose}
                className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 hover:text-gray-700 dark:text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path
                    fillRule="evenodd"
                    d="M6.225 4.811a.9.9 0 011.272 0L12 9.314l4.503-4.503a.9.9 0 111.273 1.272L13.314 10.5l4.462 4.462a.9.9 0 11-1.273 1.273L12 11.773l-4.503 4.462a.9.9 0 11-1.272-1.273L10.686 10.5 6.225 6.083a.9.9 0 010-1.272z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        <div className="px-6 py-5">{children}</div>

        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 rounded-b-lg">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
