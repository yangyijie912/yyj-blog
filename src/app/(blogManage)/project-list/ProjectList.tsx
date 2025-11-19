'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import type { Locale } from '@/i18n/locales';
import { formatDate } from '@/i18n/format';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import { deleteProject } from '../projects/actions';
import { appendCsrfToken } from '@/lib/csrf';
import { emit as showToast } from '@/lib/toastBus';
import DataTable, { Column } from '@/app/components/DataTable';

interface Project {
  id: string;
  name: string;
  description: string | null;
  category: {
    name: string;
  };
  tags: string[];
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectListProps {
  projects: Project[];
  total: number;
  page: number;
  pageSize: number;
  q?: string;
  sortBy?: string;
  categoryId?: string;
  categories: { id: string; name: string }[];
}

export default function ProjectList({
  projects,
  total,
  page,
  pageSize,
  q = '',
  sortBy = 'createdAt-desc',
  categoryId = '',
  categories,
}: ProjectListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [keyword, setKeyword] = useState(q);
  const t = useTranslations();
  const locale = useLocale();

  const updateQuery = (params: Record<string, string | number | undefined>) => {
    const sp = new URLSearchParams();
    if (keyword) sp.set('q', keyword);
    if (sortBy) sp.set('sortBy', sortBy);
    if (categoryId) sp.set('categoryId', categoryId);

    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === '') sp.delete(k);
      else sp.set(k, String(v));
    });
    router.push(`/project-list?${sp.toString()}`);
  };

  const handleSearch = () => {
    updateQuery({ q: keyword, page: 1 });
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('project.delete.confirm'))) return;

    setDeletingId(id);
    try {
      const formData = new FormData();
      formData.append('id', id);
      appendCsrfToken(formData);
      const result = await deleteProject(formData);

      if (result.ok) {
        showToast({ message: t('project.delete.success'), type: 'success' });
        router.refresh();
      } else {
        showToast({ message: result.message || t('project.delete.failure'), type: 'error' });
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : t('project.delete.failure');
      showToast({ message: msg, type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  const columns: Column<Project>[] = [
    {
      key: 'name',
      title: t('project.detail'),
      align: 'left',
      render: (project) => (
        <div>
          <div className="font-medium">{project.name}</div>
          {project.description && <div className="text-sm text-gray-500 mt-1 line-clamp-1">{project.description}</div>}
        </div>
      ),
    },
    {
      key: 'category',
      title: t('project.meta.category'),
      align: 'left',
      width: '10%',
      render: (project) => (
        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
          {project.category.name}
        </span>
      ),
    },
    {
      key: 'tags',
      title: t('project.tags.col'),
      align: 'left',
      width: '18%',
      render: (project) => (
        <div className="flex flex-wrap gap-1">
          {project.tags.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="inline-block px-2 py-0.5 text-xs bg-gray-100 rounded">
              {tag}
            </span>
          ))}
          {project.tags.length > 3 && (
            <span className="inline-block px-2 py-0.5 text-xs text-gray-500">+{project.tags.length - 3}</span>
          )}
        </div>
      ),
    },
    {
      key: 'featured',
      title: t('project.featured'),
      align: 'center',
      width: '5%',
      render: (project) =>
        project.featured ? <span className="text-amber-500">★</span> : <span className="text-gray-300">☆</span>,
    },
    {
      key: 'createdAt',
      title: t('project.meta.created'),
      align: 'center',
      width: '10%',
      render: (project) => (
        <span className="text-sm text-gray-600">{formatDate(project.createdAt, locale as Locale)}</span>
      ),
    },
    {
      key: 'updatedAt',
      title: t('project.meta.updated'),
      align: 'center',
      width: '10%',
      render: (project) => (
        <span className="text-sm text-gray-600">{formatDate(project.updatedAt, locale as Locale)}</span>
      ),
    },
    {
      key: 'actions',
      title: t('project.actions.col'),
      align: 'center',
      width: '15%',
      render: (project) => (
        <div className="flex items-center justify-center gap-2">
          <Link
            href={`/projects?edit=${project.id}`}
            className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            <FaEdit /> {t('datatable.action.detail')}
          </Link>
          <button
            onClick={() => handleDelete(project.id)}
            disabled={deletingId === project.id}
            className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <FaTrash /> {deletingId === project.id ? t('project.delete.deletingBtn') : t('project.delete.deleteBtn')}
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={projects}
        keyExtractor={(project) => project.id}
        total={total}
        page={page}
        pageSize={pageSize}
        basePath="/project-list"
        title={t('project.page.title')}
        backLink={{ href: '/dashboard', label: t('project.back.label') }}
        actions={
          <Link
            href="/projects"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus /> {t('project.create.btn')}
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
                placeholder={t('project.search.placeholder')}
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
                {t('project.search.btn')}
              </button>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                {t('project.meta.category')}
              </label>
              <select
                value={categoryId}
                onChange={(e) => updateQuery({ categoryId: e.target.value, page: 1 })}
                className="px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white text-sm w-full sm:min-w-[140px]"
              >
                <option value="">All</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                {t('project.sort.label')}
              </label>
              <select
                value={sortBy}
                onChange={(e) => updateQuery({ sortBy: e.target.value, page: 1 })}
                className="px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white text-sm w-full sm:min-w-[180px]"
              >
                <option value="createdAt-desc">{t('project.sort.createdAt.desc')}</option>
                <option value="createdAt-asc">{t('project.sort.createdAt.asc')}</option>
                <option value="updatedAt-desc">{t('project.sort.updatedAt.desc')}</option>
                <option value="updatedAt-asc">{t('project.sort.updatedAt.asc')}</option>
              </select>
            </div>
          </div>
        }
        emptyText={t('project.empty')}
      />
    </>
  );
}
