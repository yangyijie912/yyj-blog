'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useRouter } from 'next/navigation';
import classnames from 'classnames';
import BlogActionBar from './BlogActionBar';
import { emit as showToast } from '@/lib/toastBus';
import { deletePost } from '@/app/(blogManage)/writing/actions';
import { appendCsrfToken } from '@/lib/csrf';
import { useTranslations } from 'next-intl';
export interface ClientViewProps {
  post: {
    id: string;
    title: string;
    intro?: string | null;
    content: string;
    tags: unknown;
    createdAt: string | Date;
  };
  isAuthor: boolean;
}

// 客户端组件：博客详情视图
const ClientView: React.FC<ClientViewProps> = ({ post, isAuthor }) => {
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showBar, setShowBar] = useState(true);
  const lastYRef = useRef(0);
  const tickingRef = useRef(false);
  const t = useTranslations();

  // 初始化主题：与全局 html[data-theme] 保持一致
  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme');
    if (current === 'dark' || current === 'light') {
      setTheme(current);
    }
  }, []);

  // 将主题作用到整个右侧 content 容器
  useEffect(() => {
    const el = document.querySelector('.content');
    if (!el) return;
    el.classList.toggle('dark-content', theme === 'dark');
    return () => el.classList.remove('dark-content');
  }, [theme]);

  // 滚动隐藏/显示
  useEffect(() => {
    const onScroll = () => {
      if (tickingRef.current) return;
      window.requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        const last = lastYRef.current;
        if (Math.abs(y - last) > 4) {
          setShowBar(y <= last);
          lastYRef.current = y;
        }
        tickingRef.current = false;
      });
      tickingRef.current = true;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const tags = useMemo(() => {
    if (Array.isArray(post.tags)) return post.tags as string[];
    if (typeof post.tags === 'string') {
      try {
        const arr = JSON.parse(post.tags);
        if (Array.isArray(arr)) return arr as string[];
      } catch {}
    }
    return [] as string[];
  }, [post.tags]);

  const isDark = theme === 'dark';

  // 处理删除
  const handleDelete = async () => {
    if (!confirm(t('blog.delete.confirm'))) {
      return;
    }

    const formData = new FormData();
    formData.append('id', post.id);
    // 注入 CSRF（若缺失则先提示刷新）
    appendCsrfToken(formData);

    const result = await deletePost(formData);
    if (result.ok) {
      // 回退到上一页无法附带参数，改为显式跳转到博客列表页
      const backTo = '/blog';
      const target = new URL(backTo, window.location.origin);
      target.searchParams.set('toast', t('blog.delete.success'));
      target.searchParams.set('toast_type', 'success');
      router.push(target.pathname + target.search);
    } else {
      showToast({ message: result.message || t('blog.delete.failure'), type: 'error' });
    }
  };

  return (
    <article className={classnames({ 'dark-article': isDark })}>
      {/* 操作栏组件 */}
      <BlogActionBar
        postId={post.id}
        isAuthor={isAuthor}
        theme={theme}
        showBar={showBar}
        onThemeToggle={async () => {
          const next = theme === 'light' ? 'dark' : 'light';
          // 1) 立即更新 UI（无刷新）
          document.documentElement.setAttribute('data-theme', next);
          setTheme(next);
          // 2) 持久化到 Cookie（全局生效）
          try {
            await fetch('/api/theme', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ theme: next }),
            });
          } catch {}
        }}
        onDelete={handleDelete}
        onMouseEnter={() => setShowBar(true)}
        onMouseLeave={() => setShowBar(false)}
      />

      {/* 内容主体 */}
      <div className="mx-auto w-[90%] max-w-[1100px] px-6 pt-24 pb-10">
        <h1
          className={classnames({
            'text-4xl font-bold mb-6': true,
            'text-slate-900': !isDark,
            'text-slate-100': isDark,
          })}
        >
          {post.title}
        </h1>
        <div
          className={classnames({
            'text-sm mb-6': true,
            'text-slate-600': !isDark,
            'text-slate-300': isDark,
          })}
        >
          <span>{new Date(post.createdAt).toLocaleString()}</span>
        </div>

        {tags.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {tags.map((t) => (
              <span key={t} className="tag">
                #{t}
              </span>
            ))}
          </div>
        )}

        <div className={classnames('rounded markdown-body', { 'markdown-body-dark': isDark })}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>
      </div>
    </article>
  );
};

export default ClientView;
