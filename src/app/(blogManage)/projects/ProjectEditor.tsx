'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProject, updateProject } from './actions';
import { appendCsrfToken } from '@/lib/csrf';
import TagSelector from '@/app/components/TagSelector';
import SimpleMarkdownEditor from '@/app/(blogManage)/writing/SimpleMarkdownEditor';
import ByteMDEditor from '@/app/(blogManage)/writing/ByteMDEditor';
import { emit as showToast } from '@/lib/toastBus';
import { IoArrowBack, IoRefreshOutline, IoBrush } from 'react-icons/io5';
import { useTranslations } from 'next-intl';

interface Category {
  id: string;
  name: string;
  icon?: string | null;
  order: number;
}

interface Project {
  id: string;
  name: string;
  description?: string | null;
  url?: string | null;
  linkName?: string | null;
  tags: string[];
  categoryId: string;
  featured: boolean;
}

interface EditorProps {
  categories: Category[];
  existingProject?: Project | null;
}

export default function ProjectEditor({ categories, existingProject }: EditorProps) {
  const router = useRouter();
  const t = useTranslations();
  const [name, setName] = useState(existingProject?.name || '');
  const [description, setDescription] = useState(existingProject?.description || '');
  const [url, setUrl] = useState(existingProject?.url || '');
  const [linkName, setLinkName] = useState(existingProject?.linkName || '');
  const [categoryId, setCategoryId] = useState(existingProject?.categoryId || categories[0]?.id || '');
  const [featured, setFeatured] = useState(existingProject?.featured || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState<string[]>(existingProject?.tags || []);
  const [useHighlighter, setUseHighlighter] = useState<'stable' | 'bytemd'>('bytemd');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      appendCsrfToken(formData);

      if (existingProject) {
        formData.append('id', existingProject.id);
      }
      formData.append('name', name);
      formData.append('description', description);
      formData.append('url', url);
      formData.append('linkName', linkName);
      formData.append('categoryId', categoryId);
      formData.append('tags', tags.join(','));
      formData.append('featured', String(featured));

      if (existingProject) {
        const result = await updateProject(formData);
        if (result?.ok) {
          const urlParams = new URLSearchParams(window.location.search);
          const fromDetail = urlParams.get('from') === 'detail';
          let target = new URL('/project-list', window.location.origin);
          if (fromDetail) {
            target = new URL(`/project/${existingProject.id}`, window.location.origin);
          }
          target.searchParams.set('toast', t('project.toast.updateSuccess'));
          target.searchParams.set('toast_type', 'success');
          router.push(target.pathname + target.search);
        } else {
          showToast({ type: 'error', message: result?.message || t('project.toast.updateFailure') });
        }
      } else {
        const result = await createProject(formData);
        if (!result?.ok) {
          showToast({ type: 'error', message: result?.message || t('project.toast.createFailure') });
          return;
        }
        setName('');
        setDescription('');
        setUrl('');
        setLinkName('');
        setTags([]);
        setFeatured(false);
        setCategoryId(categories[0]?.id || '');
        setTimeout(() => {
          showToast({ type: 'success', message: t('project.toast.createSuccess') });
        }, 0);
      }
    } catch (error) {
      showToast({
        type: 'error',
        message: error instanceof Error ? error.message : t('project.toast.operationFailure'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="editor-container">
      {/* 表单布局：四行结构 + 自适应编辑器 */}
      <form onSubmit={handleSubmit} className="editor-form">
        {/* 第一行：项目名称、类别 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8">
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              {t('project.editor.nameLabel')} <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full border-2 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all border-gray-300 hover:border-gray-400 bg-white shadow-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('project.editor.namePlaceholder')}
              required
            />
          </div>
          <div className="lg:col-span-4">
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              {t('project.editor.categoryLabel')} <span className="text-red-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full border-2 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all border-gray-300 hover:border-gray-400 bg-white shadow-sm"
            >
              {categories.map((cat: Category) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 第二行：链接名称、项目链接 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8">
            <label className="block text-sm font-semibold mb-2 text-gray-700">{t('project.editor.urlLabel')}</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full border-2 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all border-gray-300 hover:border-gray-400 bg-white shadow-sm"
              placeholder={t('project.editor.urlPlaceholder')}
            />
          </div>
          <div className="lg:col-span-4">
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              {t('project.editor.linkNameLabel')}{' '}
              <span className="text-gray-400 font-normal">({t('project.editor.linkNameHint')})</span>
            </label>
            <input
              type="text"
              value={linkName}
              onChange={(e) => setLinkName(e.target.value)}
              className="w-full border-2 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all border-gray-300 hover:border-gray-400 bg-white shadow-sm"
              placeholder={t('project.editor.linkNamePlaceholder')}
            />
          </div>
        </div>

        {/* 第三行：标签、是否精选 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8">
            <label className="block text-sm font-semibold mb-2 text-gray-700">{t('project.editor.tagsLabel')}</label>
            <TagSelector value={tags} onChange={setTags} placeholder={t('project.editor.tagsPlaceholder')} />
          </div>
          <div className="lg:col-span-4 flex items-end">
            <label className="inline-flex items-center gap-3 text-sm select-none text-gray-700 font-medium cursor-pointer hover:text-blue-600 transition-colors w-full h-[52px] border-2 border-transparent rounded-lg px-3">
              <input
                type="checkbox"
                className="h-5 w-5 rounded cursor-pointer"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
              />
              {t('project.editor.featured')}
            </label>
          </div>
        </div>

        {/* 第三行：编辑器（自适应填充高度） */}
        <div className="grid grid-cols-1 gap-4 flex-1 min-h-0">
          <div
            data-color-mode="light"
            className="rounded-xl border-2 bg-white shadow-lg border-gray-300 flex min-h-0 flex-col overflow-hidden"
          >
            <div className="px-4 py-3 border-b text-sm font-semibold text-gray-800 bg-linear-to-r from-gray-50 to-gray-100 flex items-center justify-between">
              <span className="flex items-center gap-2">📝 {t('project.editor.descriptionLabel')}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-600 hidden md:inline font-medium">
                  {t('project.editor.editorModeLabel')}
                </span>
                <select
                  className="text-xs border-2 border-gray-300 rounded-lg px-3 py-1.5 font-medium bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer"
                  value={useHighlighter}
                  onChange={(e) => setUseHighlighter(e.target.value as 'stable' | 'bytemd')}
                >
                  <option value="bytemd">{t('writing.editor.mode.bytemd')}</option>
                  <option value="stable">{t('writing.editor.mode.stable')}</option>
                </select>
              </div>
            </div>
            <div className="md-editor-wrapper flex-1 min-h-0 overflow-auto" data-color-mode="light">
              {useHighlighter === 'stable' && <SimpleMarkdownEditor value={description} onChange={setDescription} />}
              {useHighlighter === 'bytemd' && <ByteMDEditor value={description} onChange={setDescription} />}
            </div>
          </div>
        </div>

        {/* 第四行：底部操作栏 */}
        <div className="flex flex-nowrap justify-center gap-2 sm:gap-4 pt-2 px-3 sm:px-0 bg-white/0 sm:bg-transparent overflow-x-auto">
          <button
            type="button"
            onClick={() => router.push('/project-list')}
            className="cursor-pointer px-3 py-2 sm:px-6 sm:py-2.5 rounded-lg border-2 border-blue-400 bg-white hover:bg-gray-100 active:bg-gray-200 text-sm font-semibold text-gray-700 shadow-md hover:shadow-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400/40 inline-flex items-center gap-2"
          >
            <IoArrowBack className="text-sm sm:text-base" />
            {t('project.editor.backBtn')}
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm(t('project.editor.resetConfirm'))) {
                setName('');
                setDescription('');
                setUrl('');
                setLinkName('');
                setTags([]);
                setFeatured(false);
                setCategoryId(categories[0]?.id || '');
              }
            }}
            className="cursor-pointer px-3 py-2 sm:px-6 sm:py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 text-sm font-semibold text-gray-700 shadow-md hover:shadow-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400/40 inline-flex items-center gap-2"
          >
            <IoRefreshOutline className="text-sm sm:text-base" />
            {t('project.editor.resetBtn')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer px-3 py-2 sm:px-6 sm:py-2.5 rounded-lg bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 active:from-blue-700 active:to-blue-600 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 inline-flex items-center gap-2"
          >
            <IoBrush className="text-sm sm:text-base" />
            {isSubmitting
              ? t('project.editor.processing')
              : existingProject
              ? t('project.editor.updateBtn')
              : t('project.editor.createBtn')}
          </button>
        </div>
      </form>
    </div>
  );
}
