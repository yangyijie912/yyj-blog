import React, { type ComponentPropsWithoutRef } from 'react';
import { prisma } from '@/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { verifyAuth } from '@/lib/auth';
import AdminActions from './AdminActions';
import { getTranslations } from 'next-intl/server';
import { FaExternalLinkAlt, FaTag, FaClock, FaFolderOpen, FaArrowLeft, FaStar } from 'react-icons/fa';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import classnames from 'classnames';

interface ProjectParamsPromiseProps {
  params: Promise<{ id: string }>;
}

function asStringArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((v: string) => v.trim())
      .filter(Boolean);
  }
  return [];
}

function formatDate(dt: Date) {
  return dt.toISOString().split('T')[0];
}

export default async function ProjectDetailPage({ params }: ProjectParamsPromiseProps) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!project) return notFound();

  const auth = await verifyAuth();
  const canManage = auth.ok;

  const tags = asStringArray(project.tags);

  // Markdown 组件样式
  const MDComponents: Components = {
    h1: (props) => <h1 {...props} className="text-2xl md:text-3xl font-semibold mt-6 mb-3" />,
    h2: (props) => <h2 {...props} className="text-xl md:text-2xl font-semibold mt-6 mb-3" />,
    h3: (props) => <h3 {...props} className="text-lg md:text-xl font-semibold mt-5 mb-2" />,
    p: (props) => <p {...props} className="my-3 leading-7 text-slate-200" />,
    ul: (props) => <ul {...props} className="my-3 list-disc pl-6 space-y-1" />,
    ol: (props) => <ol {...props} className="my-3 list-decimal pl-6 space-y-1" />,
    li: (props) => <li {...props} className="leading-7" />,
    blockquote: (props) => (
      <blockquote {...props} className="my-4 border-l-2 border-cyan-500/40 pl-4 text-slate-300 italic" />
    ),
    a: ({ href, children, ...rest }) => (
      <a
        href={href}
        {...rest}
        target={href && href.startsWith('http') ? '_blank' : undefined}
        rel={href && href.startsWith('http') ? 'noopener noreferrer' : undefined}
        className="text-cyan-300 hover:text-cyan-200 underline decoration-dotted"
      >
        {children}
      </a>
    ),
    code: ({ inline, className, children, ...props }: ComponentPropsWithoutRef<'code'> & { inline?: boolean }) => {
      if (inline) {
        return (
          <code
            {...props}
            className={classnames(
              'px-1.5 py-0.5 rounded bg-slate-800/70 border border-slate-700/60 text-emerald-300 text-[0.92em]',
              className
            )}
          >
            {children}
          </code>
        );
      }
      return (
        <code {...props} className={classnames('block p-4 text-[0.95em] leading-7', className)}>
          {children}
        </code>
      );
    },
    pre: (props) => (
      <pre className="my-4 rounded-lg bg-[#0a0f1a] border border-slate-800/80 overflow-x-auto">{props.children}</pre>
    ),
    hr: () => <hr className="my-6 border-slate-800/80" />,
    table: (props) => (
      <div className="my-4 overflow-x-auto">
        <table {...props} className="min-w-full text-left border-collapse" />
      </div>
    ),
    th: (props) => <th {...props} className="border border-slate-700/60 px-3 py-2 bg-slate-800/60" />,
    td: (props) => <td {...props} className="border border-slate-700/60 px-3 py-2" />,
  };

  const t = await getTranslations();
  return (
    <div className="min-h-screen w-full bg-[#0B1220] text-slate-100 text-[16px] md:text-[17px]  pt-6 sm:pt-0">
      <div className="px-6 md:px-10 lg:px-14 py-10 md:py-16 max-w-6xl mx-auto">
        {/* 返回与标题 */}
        <div className="mb-8 flex items-start gap-6">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
              <span className="inline-block w-2 h-8 bg-cyan-400 rounded-sm" />
              <span className="tracking-tight">{project.name}</span>
              {project.featured && (
                <span className="px-2 py-1 text-[14px] rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                  <FaStar className="text-[14px]" /> {t('project.card.featured')}
                </span>
              )}
            </h1>
            <p className="mt-3 font-mono text-sm text-slate-300/90">&gt; {t('project.page.subtitle', { count: 1 })}</p>
          </div>
        </div>

        {/* 元信息 / 技术栈 */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="md:col-span-2 space-y-6">
            {/* 描述 */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-800/70 flex items-center gap-2 font-mono text-[14px] tracking-wide text-cyan-300">
                <span className="inline-block w-2 h-4 bg-cyan-400/60" /> DESCRIPTION.md
              </div>
              <div className="p-5">
                {project.description ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={MDComponents}>
                    {project.description}
                  </ReactMarkdown>
                ) : (
                  <p className="text-slate-500 text-base">-</p>
                )}
              </div>
            </div>

            {/* 技术栈标签 */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/60">
              <div className="px-5 py-3 border-b border-slate-800/70 flex items-center gap-2 font-mono text-[14px] text-emerald-300">
                <FaTag className="text-[14px]" /> TECH_STACK.json
              </div>
              <div className="p-5 flex flex-wrap gap-2">
                {tags.length === 0 && <span className="text-slate-500 text-sm">-</span>}
                {tags.map((tag: string, i: number) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-[14px] rounded-full bg-slate-800/80 border border-slate-700/60 font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* 行动按钮 */}
            <div className="flex flex-wrap gap-4 items-center">
              <Link
                href={`/project`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-slate-700/60 bg-slate-800/60 text-sm hover:border-cyan-400/60 hover:text-cyan-200 transition"
              >
                <FaArrowLeft /> {t('project.action.back')}
              </Link>
              {project.url && (
                <Link
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 px-4 py-2 rounded-md border border-slate-700/60 bg-slate-900/60 text-sm hover:border-emerald-400/60 hover:text-emerald-200 transition"
                >
                  <FaExternalLinkAlt className="group-hover:rotate-12 transition" />
                  {project.linkName || t('project.external.link')}
                </Link>
              )}
              {canManage && (
                <div className="ml-auto">
                  <AdminActions id={project.id} />
                </div>
              )}
            </div>
          </div>

          {/* 侧边元数据 */}
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/60">
              <div className="px-5 py-3 border-b border-slate-800/70 flex items-center gap-2 font-mono text-[14px] text-cyan-300">
                META.yml
              </div>
              <div className="p-5 text-sm space-y-3 font-mono">
                <div className="flex items-center gap-2">
                  <FaFolderOpen className="text-slate-400" />{' '}
                  <span className="text-slate-400">{t('project.meta.category')}</span>
                  <span className="text-slate-200">{project.category?.name || t('project.meta.unclassified')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaClock className="text-slate-400" />{' '}
                  <span className="text-slate-400">{t('project.meta.created')}</span>
                  <span className="text-slate-300">{formatDate(project.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaClock className="text-slate-400" />{' '}
                  <span className="text-slate-400">{t('project.meta.updated')}</span>
                  <span className="text-slate-300">{formatDate(project.updatedAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaStar className="text-slate-400" />{' '}
                  <span className="text-slate-400">{t('project.meta.featured')}</span>
                  <span className={project.featured ? 'text-amber-300' : 'text-slate-500'}>
                    {project.featured ? 'YES' : 'NO'}
                  </span>
                </div>
                <div className="mt-4 text-[14px] text-slate-500 leading-relaxed">
                  # 以工程化视角梳理元数据，保持信息原子性与可演化性。
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/60">
              <div className="px-5 py-3 border-b border-slate-800/70 flex items-center gap-2 font-mono text-[14px] text-purple-300">
                STRUCTURE.json
              </div>
              <div className="p-5 font-mono text-xs text-slate-300 whitespace-pre-wrap">
                {`{
    "id": "${project.id}",
    "name": "${project.name}",
    "tags": [${tags.map((t: string) => '"' + t + '"').join(', ')}],
    "featured": ${project.featured},
    "category": "${project.category?.name || ''}"
}`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
