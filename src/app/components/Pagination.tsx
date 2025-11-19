'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import classnames from 'classnames';

export type PaginationProps = {
  current: number; // 当前页码（从 1 开始）
  total?: number; // 总条目数
  totalPages?: number; // 建议传 total；totalPages 仅用于兼容旧调用
  pageSize?: number; // 每页条数
  basePath?: string; // 例如 "/blog/all"
  hrefForPage?: (page: number) => string; // 自定义生成链接
  prevLabel?: string; // 上一页按钮文本
  nextLabel?: string; // 下一页按钮文本
  maxShown?: number; // 最多展示多少个页码按钮（含当前）
  className?: string;
  showPageSize?: boolean; // 页数选择器，显示“XX条/页”
  pageSizeOptions?: number[]; // 每页条数选项
  showJump?: boolean; // 显示“跳至X页”
  texts?: {
    // 自定义文本，用于国际化等场景
    itemsPerPageSuffix?: string; // “ 条/页”
    jumpToLabel?: string; // “跳至”
    pageUnitLabel?: string; // “页”
    ellipsis?: string; // 省略号
  };
};

function makeQuery(page: number, pageSize: number | undefined) {
  const params = new URLSearchParams();
  if (page > 1) params.set('page', String(page));
  if (pageSize && pageSize !== 10) params.set('pageSize', String(pageSize));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export default function Pagination({
  current,
  total,
  totalPages,
  pageSize,
  basePath,
  hrefForPage,
  prevLabel = '上一页',
  nextLabel = '下一页',
  maxShown = 5,
  className,
  showPageSize = false,
  pageSizeOptions = [10, 20, 30, 50],
  showJump = false,
  texts,
}: PaginationProps) {
  const router = useRouter();
  const t = {
    itemsPerPageSuffix: ' 条/页',
    jumpToLabel: '跳至',
    pageUnitLabel: '页',
    ellipsis: '…',
    ...(texts ?? {}),
  } as Required<NonNullable<PaginationProps['texts']>>;

  const size = pageSize ?? 10;
  const totalPagesCalc = Math.max(1, typeof total === 'number' ? Math.ceil(total / size) : totalPages ?? 1);

  const buildHref = (p: number) => {
    if (hrefForPage) return hrefForPage(p);
    if (!basePath) throw new Error('Pagination requires either hrefForPage or basePath');
    return `${basePath}${makeQuery(p, pageSize)}`;
  };

  const pages: number[] = [];
  let start = Math.max(1, current - Math.floor(maxShown / 2));
  const end = Math.min(totalPagesCalc, start + maxShown - 1);
  start = Math.max(1, Math.min(start, Math.max(1, end - maxShown + 1)));
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div
      className={
        className
          ? className
          : 'flex w-full items-center justify-end gap-2 whitespace-nowrap overflow-x-auto py-1 sm:flex-wrap sm:overflow-visible sm:gap-3'
      }
    >
      {/* Page size selector */}
      {showPageSize && (
        <div className="hidden sm:flex items-center gap-2">
          <select
            value={size}
            onChange={(e) => {
              if (!basePath) return;
              const newSize = Math.max(1, Number(e.target.value) || 10);
              router.push(`${basePath}${makeQuery(1, newSize)}`);
            }}
            aria-label="每页条数"
            className="h-9 rounded-lg bg-slate-800/70 border border-slate-700/60 px-3 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50 cursor-pointer hover:border-emerald-400/60"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt} className="cursor-pointer">
                {opt}
                {t.itemsPerPageSuffix}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Pager core */}
      <div className="inline-flex items-center gap-1 whitespace-nowrap">
        {/* Prev */}
        <Link
          href={buildHref(Math.max(1, current - 1))}
          className={classnames('px-3 h-9 inline-flex items-center rounded-lg border text-sm shrink-0', {
            'border-slate-800/60 text-slate-600 cursor-not-allowed': current === 1,
            'border-slate-700/60 text-slate-200 hover:border-emerald-400/60 hover:text-emerald-200': current > 1,
          })}
          aria-disabled={current === 1}
        >
          {prevLabel}
        </Link>

        {start > 1 && (
          <>
            <Link
              href={buildHref(1)}
              className="px-3 h-9 inline-flex items-center rounded-lg border text-sm shrink-0 border-slate-700/60 text-slate-200 hover:border-emerald-400/60 hover:text-emerald-200"
            >
              1
            </Link>
            {start > 2 && <span className="px-2 text-slate-500 shrink-0">{t.ellipsis}</span>}
          </>
        )}

        {pages.map((p) => (
          <Link
            key={p}
            href={buildHref(p)}
            aria-current={p === current ? 'page' : undefined}
            className={classnames('px-3 h-9 inline-flex items-center rounded-lg border text-sm shrink-0', {
              'bg-emerald-500/90 text-slate-900 border-emerald-400/50 cursor-default': p === current,
              'border-slate-700/60 text-slate-200 hover:border-emerald-400/60 hover:text-emerald-200': p !== current,
            })}
          >
            {p}
          </Link>
        ))}

        {end < totalPagesCalc && (
          <>
            {end < totalPagesCalc - 1 && <span className="px-2 text-slate-500 shrink-0">{t.ellipsis}</span>}
            <Link
              href={buildHref(totalPagesCalc)}
              className="px-3 h-9 inline-flex items-center rounded-lg border text-sm shrink-0 border-slate-700/60 text-slate-200 hover:border-emerald-400/60 hover:text-emerald-200"
            >
              {totalPagesCalc}
            </Link>
          </>
        )}

        {/* Next */}
        <Link
          href={buildHref(Math.min(totalPagesCalc, current + 1))}
          className={classnames('px-3 h-9 inline-flex items-center rounded-lg border text-sm shrink-0', {
            'border-slate-800/60 text-slate-600 cursor-not-allowed': current === totalPagesCalc,
            'border-slate-700/60 text-slate-200 hover:border-emerald-400/60 hover:text-emerald-200':
              current < totalPagesCalc,
          })}
          aria-disabled={current === totalPagesCalc}
        >
          {nextLabel}
        </Link>
      </div>

      {/* Jump to page */}
      {showJump && basePath && (
        <div className="hidden sm:flex">
          <JumpTo
            current={current}
            totalPages={totalPagesCalc}
            basePath={basePath}
            pageSize={size}
            jumpToLabel={t.jumpToLabel}
            pageUnitLabel={t.pageUnitLabel}
          />
        </div>
      )}
    </div>
  );
}

function JumpTo({
  current,
  totalPages,
  basePath,
  pageSize,
  jumpToLabel,
  pageUnitLabel,
}: {
  current: number;
  totalPages: number;
  basePath: string;
  pageSize?: number;
  jumpToLabel: string;
  pageUnitLabel: string;
}) {
  const router = useRouter();
  const [val, setVal] = useState<string>('');

  const go = () => {
    const n = Number(val);
    if (!Number.isFinite(n)) return;
    const target = Math.max(1, Math.min(totalPages, Math.floor(n)));
    router.push(`${basePath}${makeQuery(target, pageSize)}`);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-400">{jumpToLabel}</span>
      <input
        value={val}
        onChange={(e) => setVal(e.target.value.replace(/[^0-9]/g, ''))}
        onKeyDown={(e) => {
          if (e.key === 'Enter') go();
        }}
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder={String(current)}
        className="w-16 h-9 rounded-lg bg-slate-800/70 border border-slate-700/60 px-2 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
      />
      <span className="text-sm text-slate-400">{pageUnitLabel}</span>
    </div>
  );
}
