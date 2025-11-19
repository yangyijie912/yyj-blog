'use client';

import { useState } from 'react';
import { logoutAction } from '../actions';
import { useTranslations } from 'next-intl';

export default function LogoutForm() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logoutAction();
    } catch (error) {
      console.error('登出失败:', error);
      setIsLoading(false);
    }
  };

  const t = useTranslations();
  return (
    <div className="space-y-2">
      {/* 登出按钮 */}
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {t('logout.confirming')}
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            {t('logout.confirm')}
          </>
        )}
      </button>

      {/* 取消按钮 */}
      <a
        href="/writing"
        className="block w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 text-center"
      >
        {t('logout.cancel')}
      </a>
    </div>
  );
}
