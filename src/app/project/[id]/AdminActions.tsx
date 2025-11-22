'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteProject } from '@/app/(blogManage)/projects/actions';
import { appendCsrfToken } from '@/lib/csrf';
import { FaTrashAlt, FaEdit } from 'react-icons/fa';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { emit as showToast } from '@/lib/toastBus';

export default function AdminActions({ id }: { id: string }) {
  const router = useRouter();
  const t = useTranslations();
  const [loading, setLoading] = useState(false);

  const onDelete = async () => {
    if (!confirm(t('project.delete.confirm'))) return;
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('id', id);
      appendCsrfToken(formData);
      const result = await deleteProject(formData);
      if (!result?.ok) {
        const msg = result?.message || t('project.delete.failure');
        showToast({ message: msg, type: 'error' });
        return;
      }
      // 删除成功：显式跳转并通过 URL 参数交由 ToastManager 显示
      const target = new URL('/project', window.location.origin);
      target.searchParams.set('toast', t('project.delete.success'));
      target.searchParams.set('toast_type', 'success');
      router.replace(target.pathname + target.search);
      // 可选刷新，确保列表立即反映删除
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : t('project.delete.failure');
      showToast({ message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-3">
      <Link
        href={`/projects?edit=${id}&from=detail`}
        replace
        className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-slate-700/60 bg-slate-800/60 text-sm hover:border-cyan-400/60 hover:text-cyan-200 transition"
      >
        <FaEdit /> {t('project.action.edit')}
      </Link>
      <button
        onClick={onDelete}
        disabled={loading}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-red-700/60 bg-red-900/40 text-sm text-red-200 hover:border-red-400/60 hover:text-red-100 transition disabled:opacity-60"
      >
        <FaTrashAlt /> {loading ? t('project.action.deleteLoading') : t('project.action.delete')}
      </button>
    </div>
  );
}
