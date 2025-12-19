'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import { getIconComponent } from '@/lib/icon';
import { createCategory, updateCategory, deleteCategory } from '../projects/actions';
import IconSelector from '@/app/components/IconSelector';
import Modal from '@/app/components/Modal';
import { appendCsrfToken } from '@/lib/csrf';
import { emit as showToast } from '@/lib/toastBus';
import DataTable, { Column } from '@/app/components/DataTable';

interface Category {
  id: string;
  name: string;
  icon?: string | null;
  order: number;
  _count?: {
    projects: number;
  };
}

interface CategoryManagerProps {
  categories: Category[];
  total: number;
  page: number;
  pageSize: number;
  q?: string;
}

export default function CategoryManager({
  categories: initialCategories,
  total,
  page,
  pageSize,
  q = '',
}: CategoryManagerProps) {
  const router = useRouter();
  const t = useTranslations();
  const categories = initialCategories;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', icon: 'FaLaptopCode', order: 0 });
  const [keyword, setKeyword] = useState(q);

  // 使用共享的图标解析器（见 src/lib/icon.ts）

  const handleSearch = () => {
    const sp = new URLSearchParams();
    if (keyword) sp.set('q', keyword);
    sp.set('page', '1');
    window.location.href = `/categories?${sp.toString()}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = new FormData();

      if (editingId) {
        data.append('id', editingId);
      }
      data.append('name', formData.name);
      data.append('icon', formData.icon);
      data.append('order', String(formData.order));
      // CSRF token 注入
      appendCsrfToken(data);

      if (editingId) {
        const result = await updateCategory(data);
        if (!result?.ok) {
          showToast({ message: result?.message || t('category.update.failure'), type: 'error' });
          return;
        }
        showToast({ message: t('category.update.success'), type: 'success' });
      } else {
        const result = await createCategory(data);
        if (!result?.ok) {
          showToast({ message: result?.message || t('category.create.failure'), type: 'error' });
          return;
        }
        showToast({ message: t('category.create.success'), type: 'success' });
      }

      setIsAdding(false);
      setEditingId(null);
      setFormData({ name: '', icon: 'FaLaptopCode', order: 0 });
      router.refresh();
    } catch (error) {
      showToast({ message: error instanceof Error ? error.message : t('category.operation.failure'), type: 'error' });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      icon: category.icon || 'FaLaptopCode',
      order: category.order,
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('category.delete.confirm'))) return;

    try {
      const formData = new FormData();
      formData.append('id', id);
      appendCsrfToken(formData);
      const result = await deleteCategory(formData);
      if (!result?.ok) {
        showToast({ message: result?.message || t('category.delete.failure'), type: 'error' });
        return;
      }
      showToast({ message: t('category.delete.success'), type: 'success' });
      router.refresh();
    } catch (error) {
      showToast({ message: error instanceof Error ? error.message : t('category.delete.failure'), type: 'error' });
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', icon: 'FaLaptopCode', order: 0 });
  };

  const columns: Column<Category>[] = [
    {
      key: 'name',
      title: t('category.col.name'),
      align: 'left',
      width: '25%',
      render: (cat) => <span className="font-medium">{cat.name}</span>,
    },
    {
      key: 'icon',
      title: t('category.col.icon'),
      align: 'left',
      width: '20%',
      render: (cat) => {
        const IconComp = getIconComponent(cat.icon);
        if (!IconComp) return <span className="text-gray-500">-</span>;
        return <IconComp className="text-xl text-blue-600" />;
      },
    },
    {
      key: 'order',
      title: t('category.col.order'),
      align: 'center',
      width: '15%',
    },
    {
      key: 'projects',
      title: t('category.col.projects'),
      align: 'center',
      width: '15%',
      render: (cat) => <span>{cat._count?.projects ?? 0}</span>,
    },
    {
      key: 'actions',
      title: t('category.col.actions'),
      align: 'center',
      width: '25%',
      render: (cat) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleEdit(cat)}
            className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            <FaEdit /> {t('category.actions.edit')}
          </button>
          <button
            onClick={() => handleDelete(cat.id)}
            className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!!cat._count && cat._count.projects > 0}
            title={cat._count && cat._count.projects > 0 ? t('category.delete.blocked') : ''}
          >
            <FaTrash /> {t('category.actions.delete')}
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Modal
        open={isAdding}
        onClose={handleCancel}
        title={editingId ? t('category.modal.edit') : t('category.modal.create')}
        size="lg"
        footer={
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
            >
              {t('category.modal.cancel')}
            </button>
            <button
              type="submit"
              form="category-form"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              {editingId ? t('category.modal.update') : t('category.modal.create')}
            </button>
          </div>
        }
      >
        <form id="category-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('category.form.name')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"
              placeholder={t('category.placeholder.example')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('category.form.icon')}</label>
            <IconSelector value={formData.icon} onChange={(icon) => setFormData({ ...formData, icon })} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('category.form.order.label')}</label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"
              placeholder={t('category.form.order.placeholder')}
            />
          </div>
        </form>
      </Modal>

      <DataTable
        columns={columns}
        data={categories}
        keyExtractor={(cat) => cat.id}
        total={total}
        page={page}
        pageSize={pageSize}
        basePath="/categories"
        title={t('category.title')}
        backLink={{ href: '/dashboard', label: t('category.back.label') }}
        actions={
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus /> <span>{t('category.action.add')}</span>
          </button>
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
                placeholder={t('category.search.placeholder')}
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
                {t('category.search.btn')}
              </button>
            </div>
          </div>
        }
        emptyText={t('category.empty')}
      />
    </>
  );
}
