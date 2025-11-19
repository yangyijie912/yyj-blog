'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import type { Locale } from '@/i18n/locales';
import { formatDate } from '@/i18n/format';
import { useRouter } from 'next/navigation';
import { FaEdit, FaPlus, FaTrash, FaKey } from 'react-icons/fa';
import DataTable, { Column } from '@/app/components/DataTable';
import { emit as showToast } from '@/lib/toastBus';
import Modal from '@/app/components/Modal';
import { appendCsrfToken } from '@/lib/csrf';
import { createUserAction, updateUserAction, changeUserPasswordAction, deleteUserAction } from './actions';

export interface UserRow {
  id: string;
  username: string;
  email: string | null;
  role: string;
  isActive: number;
  createdAt: Date;
  updatedAt: Date;
}

interface UserListProps {
  users: UserRow[];
  total: number;
  page: number;
  pageSize: number;
  q?: string;
  sortBy?: string;
}

export default function UserList({ users, total, page, pageSize, q = '', sortBy = 'createdAt-desc' }: UserListProps) {
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();

  const [keyword, setKeyword] = useState(q);
  // 使用全局 ToastManager，通过事件总线触发，无需本地 state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [changingPassword, setChangingPassword] = useState<UserRow | null>(null);

  // 更新查询参数并导航
  const updateQuery = (params: Record<string, string | number | undefined>) => {
    const sp = new URLSearchParams();
    if (keyword) sp.set('q', keyword);
    if (sortBy) sp.set('sortBy', sortBy);
    Object.entries(params).forEach(([k, v]: [string, string | number | undefined]) => {
      if (v === undefined || v === '') sp.delete(k);
      else sp.set(k, String(v));
    });
    router.push(`/users?${sp.toString()}`);
  };

  // 搜索处理
  const handleSearch = () => updateQuery({ q: keyword, page: 1 });

  // 创建用户
  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    appendCsrfToken(fd);
    const res = await createUserAction(fd);
    if (res.ok) {
      setShowCreateModal(false);
      showToast({ message: res.message || t('user.toast.createSuccess'), type: 'success' });
      router.refresh();
    } else {
      showToast({ message: res.message || t('user.toast.createFailure'), type: 'error' });
    }
  };

  // 更新用户
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    appendCsrfToken(fd);
    const res = await updateUserAction(fd);
    if (res.ok) {
      setEditingUser(null);
      showToast({ message: res.message || t('user.toast.updateSuccess'), type: 'success' });
      router.refresh();
    } else {
      showToast({ message: res.message || t('user.toast.updateFailure'), type: 'error' });
    }
  };

  // 修改密码
  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    appendCsrfToken(fd);
    const res = await changeUserPasswordAction(fd);
    if (res.ok) {
      setChangingPassword(null);
      showToast({ message: res.message || t('user.toast.updatePwdSuccess'), type: 'success' });
      router.refresh();
    } else {
      showToast({ message: res.message || t('user.toast.operationFailure'), type: 'error' });
    }
  };

  // 删除用户
  const handleDelete = async (user: UserRow) => {
    if (!confirm(t('user.delete.confirm'))) return;
    setDeletingId(user.id);
    try {
      const formData = new FormData();
      formData.append('userId', user.id);
      appendCsrfToken(formData);
      const res = await deleteUserAction(formData);
      if (res.ok) {
        showToast({ message: res.message || t('user.delete.success'), type: 'success' });
        router.refresh();
      } else {
        showToast({ message: res.message || t('user.delete.failure'), type: 'error' });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : t('user.delete.failure');
      showToast({ message: msg, type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  // 表格列定义
  const columns: Column<UserRow>[] = [
    {
      key: 'username',
      title: t('user.username.col'),
      align: 'left',
      render: (u) => (
        <div>
          <div className="font-medium">{u.username}</div>
          {u.email && <div className="text-sm text-gray-500 mt-1">{u.email}</div>}
        </div>
      ),
    },
    {
      key: 'role',
      title: t('user.role.col'),
      align: 'center',
      width: '8%',
      render: (u) => (
        <span
          className={`inline-block px-2 py-1 text-xs rounded ${
            u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
          }`}
        >
          {u.role === 'admin' ? t('user.form.role.admin') : t('user.form.role.user')}
        </span>
      ),
    },
    {
      key: 'isActive',
      title: t('user.status.col'),
      align: 'center',
      width: '8%',
      render: (u) => (
        <span
          className={`inline-block px-2 py-1 text-xs rounded ${
            u.isActive === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {u.isActive === 1 ? t('user.form.active') : t('user.delete.failure')}
        </span>
      ),
    },
    {
      key: 'createdAt',
      title: t('user.created.col'),
      align: 'center',
      width: '12%',
      render: (u) => <span className="text-sm text-gray-600">{formatDate(u.createdAt, locale as Locale)}</span>,
    },
    {
      key: 'updatedAt',
      title: t('user.updated.col'),
      align: 'center',
      width: '12%',
      render: (u) => <span className="text-sm text-gray-600">{formatDate(u.updatedAt, locale as Locale)}</span>,
    },
    {
      key: 'actions',
      title: t('user.actions.col'),
      align: 'center',
      width: '20%',
      render: (u) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setEditingUser(u)}
            className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            <FaEdit /> {t('user.edit.btn')}
          </button>
          <button
            onClick={() => setChangingPassword(u)}
            className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors"
          >
            <FaKey /> {t('user.password.btn')}
          </button>
          <button
            onClick={() => handleDelete(u)}
            disabled={deletingId === u.id}
            className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <FaTrash /> {deletingId === u.id ? '...' : t('user.delete.btn')}
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={users}
        keyExtractor={(u) => u.id}
        total={total}
        page={page}
        pageSize={pageSize}
        basePath="/users"
        title={t('user.manage.title')}
        backLink={{ href: '/dashboard', label: t('user.manage.back') }}
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus /> {t('user.create.btn')}
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
                placeholder={t('user.search.placeholder')}
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
                {t('user.search.btn')}
              </button>
            </div>
          </div>
        }
        emptyText={t('user.empty')}
      />

      {/* 创建用户 */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={t('user.modal.create.title')}
        size="sm"
        footer={
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
            >
              {t('user.modal.cancel')}
            </button>
            <button
              type="submit"
              form="create-user-form"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              {t('user.modal.create.submit')}
            </button>
          </div>
        }
      >
        <form id="create-user-form" onSubmit={handleCreate}>
          <div className="mb-4">
            <label className="block mb-2">
              {t('user.form.username')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="username"
              required
              pattern="[a-zA-Z0-9_]{3,20}"
              title="3-20个字母数字下划线"
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">{t('user.form.email')}</label>
            <input
              type="email"
              name="email"
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">
              {t('user.form.password')} <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div className="mb-0">
            <label className="block mb-2">{t('user.form.role.label')}</label>
            <select
              name="role"
              defaultValue="user"
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="user">{t('user.form.role.user')}</option>
              <option value="admin">{t('user.form.role.admin')}</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* 编辑用户 */}
      <Modal
        open={!!editingUser}
        onClose={() => setEditingUser(null)}
        title={editingUser ? `${t('user.modal.edit.title')}: ${editingUser.username}` : t('user.modal.edit.title')}
        size="sm"
        footer={
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setEditingUser(null)}
              className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
            >
              {t('user.modal.cancel')}
            </button>
            <button
              type="submit"
              form="edit-user-form"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              {t('user.modal.save')}
            </button>
          </div>
        }
      >
        {editingUser && (
          <form id="edit-user-form" onSubmit={handleUpdate}>
            <input type="hidden" name="userId" value={editingUser.id} />
            <div className="mb-4">
              <label className="block mb-2">{t('user.form.email')}</label>
              <input
                type="email"
                name="email"
                defaultValue={editingUser.email || ''}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">{t('user.form.role.label')}</label>
              <select
                name="role"
                defaultValue={editingUser.role}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="user">{t('user.form.role.user')}</option>
                <option value="admin">{t('user.form.role.admin')}</option>
              </select>
            </div>
            <div className="mb-0">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="isActive" value="true" defaultChecked={editingUser.isActive === 1} />{' '}
                {t('user.form.active')}
              </label>
            </div>
          </form>
        )}
      </Modal>

      {/* 修改密码 */}
      <Modal
        open={!!changingPassword}
        onClose={() => setChangingPassword(null)}
        title={
          changingPassword
            ? `${t('user.modal.password.title')}: ${changingPassword.username}`
            : t('user.modal.password.title')
        }
        size="sm"
        footer={
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setChangingPassword(null)}
              className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
            >
              {t('user.modal.cancel')}
            </button>
            <button
              type="submit"
              form="change-password-form"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              {t('user.modal.save')}
            </button>
          </div>
        }
      >
        {changingPassword && (
          <form id="change-password-form" onSubmit={handleChangePassword}>
            <input type="hidden" name="userId" value={changingPassword.id} />
            <div className="mb-0">
              <label className="block mb-2">
                {t('user.form.newPassword')} <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="newPassword"
                required
                minLength={6}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
              <p className="text-sm text-gray-500 mt-1">至少6个字符</p>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
