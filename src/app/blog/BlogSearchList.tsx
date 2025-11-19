'use client';

import { useMemo, useState, KeyboardEvent } from 'react';
import Link from 'next/link';
import classnames from 'classnames';
import { useTranslations } from 'next-intl';

export type BlogListItem = {
  id: string;
  title: string;
  intro?: string | null;
  createdAt: Date | string;
  updatedAt?: Date | string;
  tags: unknown; // stored as Json in prisma
};

function toTags(tags: unknown): string[] {
  if (Array.isArray(tags)) return tags as string[];
  return [];
}

const fmt = (d: Date | string) =>
  new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(d));

export default function BlogSearchList({
  posts,
  dateLabel = '发布于',
  dateField = 'createdAt',
  columns = 1,
}: {
  posts: BlogListItem[];
  dateLabel?: string;
  dateField?: 'createdAt' | 'updatedAt';
  columns?: 1 | 2; // 控制列数：默认单列；/blog/all 传 2 变为两列
}) {
  const [q, setQ] = useState(''); // 输入框内容
  const [keyword, setKeyword] = useState(''); // 生效的关键词（点击“搜索”或回车时更新）
  const t = useTranslations();

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return posts;
    return posts.filter((p) => {
      const title = p.title?.toLowerCase?.() ?? '';
      const intro = (p.intro ?? '')?.toLowerCase?.();
      const tagStr = toTags(p.tags).join(' ').toLowerCase();
      return title.includes(kw) || intro.includes(kw) || tagStr.includes(kw);
    });
  }, [keyword, posts]);

  const doSearch = () => setKeyword(q);
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') doSearch();
  };

  const listClass = columns === 2 ? 'mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-7 lg:gap-8' : 'mt-8 space-y-6';

  return (
    <div className="w-full">
      {/* Search bar */}
      <div className="mt-6 flex items-center gap-3">
        <div className="flex-1 relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKey}
            placeholder={t('blogSearchList.search.placeholder')}
            className="w-full h-11 rounded-lg bg-slate-800/70 border border-slate-700/60 px-4 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="size-5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
        </div>
        <button
          onClick={doSearch}
          className="px-4 h-11 inline-flex items-center rounded-lg bg-emerald-500/90 hover:bg-emerald-400 text-slate-900 font-medium border border-emerald-400/50"
        >
          {t('blogSearchList.search.btn')}
        </button>
      </div>

      {/* List */}
      <ul className={listClass}>
        {filtered.map((p) => (
          <li
            key={p.id}
            className="group rounded-xl border border-slate-800/80 bg-slate-900/60 hover:border-emerald-500/50 transition overflow-hidden h-full"
          >
            <Link href={`/blog/${p.id}`} className="block p-5 h-full">
              <h3 className="text-xl font-semibold tracking-tight group-hover:text-emerald-300 transition line-clamp-1">
                {p.title}
              </h3>
              <div className="mt-1 text-xs text-slate-400 flex items-center gap-3">
                <span>
                  {dateLabel} {fmt(dateField === 'updatedAt' ? p.updatedAt ?? p.createdAt : p.createdAt)}
                </span>
                {toTags(p.tags).length > 0 && <span>·</span>}
                <span className="flex flex-wrap gap-2">
                  {toTags(p.tags).map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 text-[11px] rounded-full bg-slate-800/80 border border-slate-700/60"
                    >
                      #{t}
                    </span>
                  ))}
                </span>
              </div>
              {p.intro && <p className="mt-2 text-slate-300/90 text-sm leading-7 line-clamp-2">{p.intro}</p>}
              <span className="mt-3 inline-flex items-center gap-1 text-emerald-300/90 text-sm">
                {t('blogSearchList.search.readMore')}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="size-4"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className={classnames('text-sm text-slate-400', { 'col-span-full': columns === 2 })}>
            {t('blogSearchList.search.noResults')}
          </li>
        )}
      </ul>
    </div>
  );
}
