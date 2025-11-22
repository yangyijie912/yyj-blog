'use client';
import React, { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IoArrowBack, IoRefreshOutline, IoBrush } from 'react-icons/io5';
import SimpleMarkdownEditor from './SimpleMarkdownEditor';
import ByteMDEditor from './ByteMDEditor';
import { appendCsrfToken } from '@/lib/csrf';
import TagSelector from '@/app/components/TagSelector';
import { emit as showToast } from '@/lib/toastBus';
import { useTranslations } from 'next-intl';

interface SimplePost {
  id: string;
  title: string;
  intro?: string | null;
  content: string;
  tags: unknown;
  featured?: boolean;
}

interface EditorProps {
  createAction: (formData: FormData) => Promise<{ ok: boolean; id?: string; message?: string }>;
  updateAction?: (formData: FormData) => Promise<{ ok: boolean; id?: string; message?: string }>;
  existingPost?: SimplePost | null;
}

// 简单的 Markdown 编辑器（移除实时预览，编辑器占满单列）
const Editor: React.FC<EditorProps> = ({ createAction, updateAction, existingPost }) => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [intro, setIntro] = useState('');
  const [content, setContent] = useState('');
  // 编辑器模式：stable=纯 textarea，bytemd=Bytemd 高亮
  const [useHighlighter, setUseHighlighter] = useState<'stable' | 'bytemd'>('bytemd');

  const [tags, setTags] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);
  const [isPending, startTransition] = useTransition();

  // 预填充编辑数据
  useEffect(() => {
    if (!existingPost) return;
    setTitle(existingPost.title || '');
    setIntro(existingPost.intro || '');
    setContent(existingPost.content || '');
    // tags 兼容 JSON 字段
    let preset: string[] = [];
    if (Array.isArray(existingPost.tags)) preset = existingPost.tags as string[];
    else if (typeof existingPost.tags === 'string') {
      try {
        const arr = JSON.parse(existingPost.tags) as unknown;
        if (Array.isArray(arr)) preset = arr as string[];
      } catch {}
    }
    setTags(preset);
    setFeatured(!!existingPost.featured);
  }, [existingPost]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', title);
    fd.append('intro', intro);
    fd.append('content', content);
    fd.append('tags', tags.join(','));
    fd.append('featured', String(featured));
    if (existingPost?.id) fd.append('id', existingPost.id);
    // CSRF 双提交 token 注入
    appendCsrfToken(fd);

    startTransition(async () => {
      const res = existingPost && updateAction ? await updateAction(fd) : await createAction(fd);
      if (res.ok) {
        if (existingPost && res.id) {
          // 更新成功：检查是否从详情页进入编辑
          const urlParams = new URLSearchParams(window.location.search);
          const fromDetail = urlParams.get('from') === 'detail';
          // 默认从列表页进入
          let target = new URL('/blog-list', window.location.origin);
          if (fromDetail) {
            // 从详情页进入，返回详情页并显示toast —— 使用 replace 替换历史，避免回退再回到编辑页
            target = new URL(`/blog/${res.id}`, window.location.origin);
            target.searchParams.set('toast', t('writing.toast.updateSuccess'));
            target.searchParams.set('toast_type', 'success');
            router.replace(target.pathname + target.search);
            return;
          }
          target.searchParams.set('toast', t('writing.toast.updateSuccess'));
          target.searchParams.set('toast_type', 'success');
          router.push(target.pathname + target.search);
          return;
        }
        // 创建成功：先清空表单（避免状态更新干扰toast），再延迟触发提示
        setTitle('');
        setIntro('');
        setContent('');
        setTags([]);
        setFeatured(false);
        // 延迟确保 ToastManager 稳定接收
        setTimeout(() => {
          showToast({ type: 'success', message: t('writing.toast.createSuccess') });
        }, 0);
      } else {
        showToast({ type: 'error', message: `${t('writing.toast.operationFailure')}: ${res.message}` });
      }
    });
  };

  const t = useTranslations();
  return (
    <div className="editor-container">
      {/* 基础信息表单 */}
      <form onSubmit={handleSubmit} className="editor-form">
        {/* 布局：PC 端两列：左列（标题/标签/精选），右列（简介） */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">{t('writing.form.title.label')}</label>
              <input
                className="w-full border-2 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all border-gray-300 hover:border-gray-400 bg-white shadow-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('writing.form.title.placeholder')}
                required
              />
            </div>

            {/* 标签选择器（复用组件） */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">{t('writing.form.tags.label')}</label>
              <TagSelector value={tags} onChange={setTags} placeholder={t('writing.form.tags.placeholder')} />
            </div>

            <div className="pt-2">
              <label className="inline-flex items-center gap-3 text-sm select-none text-gray-700 font-medium cursor-pointer hover:text-blue-600 transition-colors">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounde cursor-pointer"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                />
                {t('writing.form.featured')}
              </label>
            </div>
          </div>
          <div className="lg:col-span-5">
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              {t('writing.form.intro.label')}{' '}
              <span className="text-gray-400 font-normal">{t('writing.form.intro.optional')}</span>
            </label>
            <textarea
              className="w-full border-2 rounded-lg px-4 py-3 text-base h-40 resize-none border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all bg-white shadow-sm"
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              placeholder={t('writing.form.intro.placeholder')}
            />
          </div>
        </div>

        {/* 编辑区（占据剩余空间，内部滚动） */}
        <div className="grid grid-cols-1 gap-6 flex-1 min-h-0">
          <div
            data-color-mode="light"
            className="rounded-xl border-2 bg-white shadow-lg border-gray-300 flex min-h-0 flex-col overflow-hidden"
          >
            <div className="px-4 py-3 border-b text-sm font-semibold text-gray-800 bg-linear-to-r from-gray-50 to-gray-100 flex items-center justify-between">
              <span className="flex items-center gap-2">{t('writing.editor.title')}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-600 hidden md:inline font-medium">
                  {t('writing.editor.modeLabel')}
                </span>
                <select
                  className="text-xs border-2 border-gray-300 rounded-lg px-3 py-1.5 font-medium bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer"
                  value={useHighlighter}
                  onChange={(e) => setUseHighlighter(e.target.value as 'stable' | 'bytemd')}
                  title="默认Bytemd，高亮稳定；如异常可切换'稳定'模式"
                >
                  <option value="bytemd">{t('writing.editor.mode.bytemd')}</option>
                  <option value="stable">{t('writing.editor.mode.stable')}</option>
                </select>
              </div>
            </div>
            <div className="md-editor-wrapper min-h-0 flex-1 overflow-auto" data-color-mode="light">
              {useHighlighter === 'stable' && <SimpleMarkdownEditor value={content} onChange={setContent} />}
              {useHighlighter === 'bytemd' && <ByteMDEditor value={content} onChange={setContent} />}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 left-0 right-0 flex flex-nowrap justify-center gap-2 sm:gap-4 pt-2 px-3 sm:px-0 bg-white/0 sm:bg-transparent overflow-x-auto">
          <button
            type="button"
            onClick={() => router.push('/blog-list')}
            className="cursor-pointer px-3 py-2 sm:px-6 sm:py-2.5 rounded-lg border-2 border-blue-400 bg-white hover:bg-gray-100 active:bg-gray-200 text-sm font-semibold text-gray-700 shadow-md hover:shadow-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400/40 inline-flex items-center gap-2"
          >
            <IoArrowBack className="text-sm sm:text-base" />
            {t('writing.editor.backList')}
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm(t('writing.editor.resetConfirm'))) {
                setTitle('');
                setIntro('');
                setContent('');
                setTags([]);
                setFeatured(false);
              }
            }}
            className="cursor-pointer px-3 py-2 sm:px-6 sm:py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 text-sm font-semibold text-gray-700 shadow-md hover:shadow-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400/40 inline-flex items-center gap-2"
          >
            <IoRefreshOutline className="text-sm sm:text-base" />
            {t('writing.editor.resetBtn')}
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="cursor-pointer px-3 py-2 sm:px-6 sm:py-2.5 rounded-lg bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 active:from-blue-700 active:to-blue-600 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 inline-flex items-center gap-2"
          >
            <IoBrush className="text-sm sm:text-base" />
            {isPending
              ? t('writing.editor.submit.creating')
              : existingPost
              ? t('writing.editor.submit.update')
              : t('writing.editor.submit.create')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Editor;
