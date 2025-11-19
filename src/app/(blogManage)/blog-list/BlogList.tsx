'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import type { Locale } from '@/i18n/locales';
import { formatDate } from '@/i18n/format';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import { deletePost } from '../writing/actions';
import { appendCsrfToken } from '@/lib/csrf';
import { emit as showToast } from '@/lib/toastBus';
import DataTable, { Column } from '@/app/components/DataTable';

interface Post {
  id: string;
  title: string;
  intro: string | null;
  tags: string[];
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface BlogListProps {
  posts: Post[];
  total: number;
  page: number;
  pageSize: number;
  q?: string;
  sortBy?: string;
}

export default function BlogList({ posts, total, page, pageSize, q = '', sortBy = 'createdAt-desc' }: BlogListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [keyword, setKeyword] = useState(q);
  const t = useTranslations();
  const locale = useLocale();

  const updateQuery = (params: Record<string, string | number | undefined>) => {
    const sp = new URLSearchParams();
    if (keyword) sp.set('q', keyword);
    if (sortBy) sp.set('sortBy', sortBy);

    Object.entries(params).forEach(([k, v]: [string, string | number | undefined]) => {
      if (v === undefined || v === '') sp.delete(k);
      else sp.set(k, String(v));
    });
    router.push(`/blog-list?${sp.toString()}`);
  };

  const handleSearch = () => {
    updateQuery({ q: keyword, page: 1 });
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('blog.delete.confirm'))) return;

    setDeletingId(id);
    try {
      const formData = new FormData();
      formData.append('id', id);
      // 注入 CSRF 双提交 token，避免校验失败
      appendCsrfToken(formData);
      const result = await deletePost(formData);

      if (result.ok) {
        showToast({ message: t('blog.delete.success'), type: 'success' });
        router.refresh();
      } else {
        showToast({ message: result.message || t('blog.delete.failure'), type: 'error' });
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : t('blog.delete.failure');
      showToast({ message: msg, type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  const columns: Column<Post>[] = [
    {
      key: 'title',
      title: t('blog.title.col'),
      align: 'left',
      render: (post) => (
        <div>
          <div className="font-medium">{post.title}</div>
          {post.intro && <div className="text-sm text-gray-500 mt-1 line-clamp-2">{post.intro}</div>}
        </div>
      ),
    },
    {
      key: 'tags',
      title: t('blog.tags.col'),
      align: 'left',
      width: '18%',
      render: (post) => (
        <div className="flex flex-wrap gap-1">
          {post.tags.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="inline-block px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">
              {tag}
            </span>
          ))}
          {post.tags.length > 3 && (
            <span className="inline-block px-2 py-0.5 text-xs text-gray-500">+{post.tags.length - 3}</span>
          )}
        </div>
      ),
    },
    {
      key: 'featured',
      title: t('blog.featured.col'),
      align: 'center',
      width: '5%',
      render: (post) =>
        post.featured ? <span className="text-amber-500">★</span> : <span className="text-gray-300">☆</span>,
    },
    {
      key: 'createdAt',
      title: t('blog.created.col'),
      align: 'center',
      width: '10%',
      render: (post) => <span className="text-sm text-gray-600">{formatDate(post.createdAt, locale as Locale)}</span>,
    },
    {
      key: 'updatedAt',
      title: t('blog.updated.col'),
      align: 'center',
      width: '10%',
      render: (post) => <span className="text-sm text-gray-600">{formatDate(post.updatedAt, locale as Locale)}</span>,
    },
    {
      key: 'actions',
      title: t('blog.actions.col'),
      align: 'center',
      width: '15%',
      render: (post) => (
        <div className="flex items-center justify-center gap-2">
          <Link
            href={`/writing?edit=${post.id}`}
            className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            <FaEdit /> {t('user.edit.btn')}
          </Link>
          <button
            onClick={() => handleDelete(post.id)}
            disabled={deletingId === post.id}
            className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <FaTrash /> {deletingId === post.id ? t('blog.delete.deletingBtn') : t('blog.delete.deleteBtn')}
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={posts}
        keyExtractor={(post) => post.id}
        total={total}
        page={page}
        pageSize={pageSize}
        basePath="/blog-list"
        title={t('blog.manage.title')}
        backLink={{ href: '/dashboard', label: t('blog.manage.back') }}
        actions={
          <Link
            href="/writing"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus /> {t('blog.write.btn')}
          </Link>
        }
        headerContent={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 w-full max-w-2xl relative">
              <input
                type="search"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                placeholder={t('blog.search.placeholder')}
                className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white transition-all"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div className="w-full sm:w-auto">
              <button
                onClick={handleSearch}
                className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm font-medium"
              >
                {t('blog.search.btn')}
              </button>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                {t('blog.sort.label')}
              </label>
              <select
                value={sortBy}
                onChange={(e) => updateQuery({ sortBy: e.target.value, page: 1 })}
                className="px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white text-sm w-full sm:min-w-[180px]"
              >
                <option value="createdAt-desc">{t('blog.sort.createdAt.desc')}</option>
                <option value="createdAt-asc">{t('blog.sort.createdAt.asc')}</option>
                <option value="updatedAt-desc">{t('blog.sort.updatedAt.desc')}</option>
                <option value="updatedAt-asc">{t('blog.sort.updatedAt.asc')}</option>
              </select>
            </div>
          </div>
        }
        emptyText={t('blog.empty')}
      />
    </>
  );
}
