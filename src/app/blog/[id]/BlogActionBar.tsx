'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MdDarkMode, MdLightMode, MdEdit, MdArrowBack, MdViewList, MdDelete } from 'react-icons/md';
import classnames from 'classnames';
import { useTranslations } from 'next-intl';

interface BlogActionBarProps {
  postId: string;
  isAuthor: boolean;
  theme: 'light' | 'dark';
  showBar: boolean;
  onThemeToggle: () => void;
  onDelete: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const BlogActionBar: React.FC<BlogActionBarProps> = ({
  postId,
  isAuthor,
  theme,
  showBar,
  onThemeToggle,
  onDelete,
  onMouseEnter,
  onMouseLeave,
}) => {
  const router = useRouter();
  const t = useTranslations();
  const isDark = theme === 'dark';

  // 按钮通用样式
  const btnStyle = {
    'inline-flex items-center gap-1 px-3 py-1.5 rounded border transition': true,
    'bg-slate-800 text-gray-100 border-slate-700 hover:bg-slate-700': isDark,
    'bg-white text-gray-700 border-gray-300 hover:bg-gray-50': !isDark,
  };

  return (
    <>
      {/* 顶部悬停唤醒条（仅右侧内容区） */}
      <div className="fixed top-0 right-0 left-0 sm:left-(--sidebar-width) z-40 h-3" onMouseEnter={onMouseEnter} />

      {/* 顶部操作栏（固定，滚动隐藏，鼠标移入显示） */}
      <div
        className="fixed top-0 right-0 left-0 sm:left-(--sidebar-width) z-40"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className={classnames('transition-transform duration-300', { '-translate-y-full': !showBar })}>
          <div
            className={classnames({
              'bg-white border-b border-gray-300 shadow-sm': !isDark,
              'bg-slate-800 border-b border-slate-700 shadow-sm': isDark,
            })}
          >
            <div className="mx-auto w-[90%] max-w-[1100px] px-4 py-2 flex items-center gap-2 justify-end sm:justify-between">
              {/* 左侧按钮：返回、全部（移动端靠右显示，通过 order 控制） */}
              <div className="flex items-center gap-2 order-1 sm:order-1">
                <button type="button" onClick={() => router.back()} className={classnames(btnStyle)}>
                  <MdArrowBack /> <span className="hidden sm:inline">{t('blogAction.back')}</span>
                </button>

                <Link href="/blog/all" className={classnames(btnStyle)}>
                  <MdViewList /> <span className="hidden sm:inline">{t('blogAction.all')}</span>
                </Link>
              </div>

              {/* 右侧按钮：编辑、删除、主题（移动端靠右显示） */}
              <div className="flex items-center gap-2 order-2 sm:order-2">
                {isAuthor && (
                  <>
                    <Link
                      href={`/writing?edit=${encodeURIComponent(postId)}&from=detail`}
                      className={classnames(btnStyle)}
                    >
                      <MdEdit /> <span className="hidden sm:inline">{t('blogAction.edit')}</span>
                    </Link>

                    <button
                      type="button"
                      onClick={onDelete}
                      className={classnames(btnStyle, {
                        'hover:bg-red-600 hover:text-white hover:border-red-600': !isDark,
                        'hover:bg-red-700 hover:text-white hover:border-red-700': isDark,
                      })}
                    >
                      <MdDelete /> <span className="hidden sm:inline">{t('blogAction.delete')}</span>
                    </button>
                  </>
                )}

                <button type="button" className={classnames(btnStyle)} onClick={onThemeToggle}>
                  {isDark ? <MdDarkMode /> : <MdLightMode />}
                  <span className="hidden sm:inline">
                    {isDark ? t('blogAction.theme.dark') : t('blogAction.theme.light')}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogActionBar;
