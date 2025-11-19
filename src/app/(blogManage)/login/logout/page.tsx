import { requireAuth } from '@/lib/auth';
import LogoutForm from './LogoutForm';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function LogoutPage() {
  // 如果未认证将直接在 requireAuth 中重定向，不会继续渲染
  const { username } = await requireAuth();
  const t = await getTranslations();
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4 overflow-hidden">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5 space-y-3">
          {/* 标题 */}
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-0.5">{t('logout.title')}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('logout.subtitle')}</p>
          </div>

          {/* 用户信息卡片 */}
          <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-3 border border-blue-100 dark:border-blue-800">
            <div className="flex items-center space-x-3">
              {/* 用户头像 */}
              <div className="shrink-0">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-lg">
                  {username.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* 用户详情 */}
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('logout.user.current')}</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">{username}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('logout.user.admin')}</p>
              </div>
            </div>
          </div>

          {/* 登出表单 */}
          <LogoutForm />

          {/* 返回链接 */}
          <div className="text-center">
            <Link
              href="/dashboard"
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              {t('logout.backDashboard')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
