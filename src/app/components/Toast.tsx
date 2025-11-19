'use client';

import { useEffect } from 'react';
import { IoCheckmarkCircle, IoCloseCircle, IoInformationCircle } from 'react-icons/io5';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type = 'info', duration = 2000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <IoCheckmarkCircle className="w-5 h-5" />,
    error: <IoCloseCircle className="w-5 h-5" />,
    info: <IoInformationCircle className="w-5 h-5" />,
  };

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className="fixed top-4 right-4 animate-slide-in" style={{ zIndex: 99999 }}>
      <div
        className={`${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[280px] max-w-md`}
      >
        {icons[type]}
        <span className="flex-1">{message}</span>
        <button onClick={onClose} className="hover:opacity-70 transition-opacity" aria-label="关闭">
          ✕
        </button>
      </div>
    </div>
  );
}
