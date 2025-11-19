'use client';
import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { loginAction } from './actions';
import { useTranslations } from 'next-intl';

export default function LoginForm() {
  const [err, setErr] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const from = searchParams?.get('from') || '';

  const t = useTranslations();
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4 overflow-hidden">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5 space-y-3">
          {/* 标题 */}
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-0.5">{t('login.title')}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('login.subtitle')}</p>
          </div>

          {/* 登录表单 */}
          <form
            action={async (fd: FormData) => {
              startTransition(async () => {
                const res = await loginAction(fd);
                if (!res?.ok) {
                  setErr(res?.message || '登录失败');
                  setTimeout(() => setErr(null), 2500);
                }
              });
            }}
            className="space-y-2.5"
          >
            {/* 原始目标页，用于登录后回跳 */}
            <input type="hidden" name="from" value={from} />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('login.username')}
              </label>
              <input
                name="username"
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                required
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('login.password')}
              </label>
              <input
                name="password"
                type="password"
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                required
                autoComplete="current-password"
              />
            </div>

            {/* 错误提示 */}
            {err && (
              <div
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-2.5 rounded-lg text-sm"
                role="alert"
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {err}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center"
            >
              {isPending ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {t('login.submitting')}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  {t('login.submit')}
                </>
              )}
            </button>
          </form>

          {/* 返回链接 */}
          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              {t('login.backHome')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
