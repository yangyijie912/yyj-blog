'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import Pagination from './Pagination';
import { useTranslations } from 'next-intl';

export interface Column<T> {
  key: string;
  title: string;
  align?: 'left' | 'center' | 'right';
  width?: string; // 列宽，如 '120px', '20%', 'auto' 等
  render?: (item: T) => ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;

  // 分页
  total?: number;
  page?: number;
  pageSize?: number;
  basePath?: string;

  // 头部
  title?: string;
  backLink?: { href: string; label: string };
  actions?: ReactNode;
  headerContent?: ReactNode; // 用于搜索、排序等自定义内容

  // 样式
  className?: string;
  emptyText?: string;
}

export default function DataTable<T>({
  columns,
  data,
  keyExtractor,
  total,
  page = 1,
  pageSize = 10,
  basePath,
  title,
  backLink,
  actions,
  headerContent,
  className,
  emptyText = undefined,
}: DataTableProps<T>) {
  const t = useTranslations();
  const defaultEmpty = emptyText ?? t('datatable.empty');
  return (
    <div className={`relative sm:fixed sm:inset-0 z-50 bg-white dark:bg-slate-900 overflow-auto ${className || ''}`}>
      <div className="mx-auto p-6 w-full sm:w-[95%] sm:max-w-[1800px]">
        {/* 头部 */}
        {(title || backLink || actions) && (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-6">
              {backLink && (
                <Link href={backLink.href} className="text-sm text-blue-600 hover:underline">
                  ← {backLink.label}
                </Link>
              )}
            </div>
            <div className="flex items-center justify-between mb-6">
              {title && <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>}
              {actions && <div>{actions}</div>}
            </div>
          </div>
        )}

        {/* 自定义头部内容（搜索、排序等） */}
        {headerContent && <div className="mb-6">{headerContent}</div>}

        {/* 表格 */}
        {data.length === 0 ? (
          <div className="text-center py-16 text-gray-500">{defaultEmpty}</div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-700">
            <table className="w-full border-collapse text-sm sm:table-fixed table-auto">
              <thead className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300">
                <tr>
                  {columns.map((col: Column<T>) => (
                    <th
                      key={col.key}
                      className={`px-4 py-3 font-medium ${
                        col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                      }`}
                      style={col.width ? { width: col.width } : undefined}
                    >
                      {col.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item: T) => (
                  <tr
                    key={keyExtractor(item)}
                    className="border-t border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {columns.map((col: Column<T>) => (
                      <td
                        key={col.key}
                        className={`px-4 py-3 ${
                          col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                        }`}
                        style={col.width ? { width: col.width } : undefined}
                      >
                        {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 分页 */}
        {basePath && total !== undefined && total > 0 && (
          <div className="mt-6">
            <style jsx global>{`
              /* 覆盖 select 的黑色背景 */
              .pagination-light select {
                background-color: #ffffff !important;
                border-color: #d1d5db !important;
                color: #374151 !important;
              }
              .pagination-light select:hover {
                border-color: #3b82f6 !important;
              }
              .pagination-light select:focus {
                outline: none;
                ring: 2px;
                ring-color: #3b82f680;
                border-color: #3b82f6 !important;
              }
              /* 覆盖 input 的黑色背景 */
              .pagination-light input {
                background-color: #ffffff !important;
                border-color: #d1d5db !important;
                color: #374151 !important;
              }
              .pagination-light input:focus {
                outline: none;
                box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
                border-color: #3b82f6 !important;
              }
              /* 文字颜色 */
              .pagination-light span {
                color: #6b7280 !important;
              }
              /* 链接和按钮样式 */
              .pagination-light a,
              .pagination-light button {
                color: #374151;
                border-color: #d1d5db;
              }
              .pagination-light a:hover:not([aria-disabled='true']):not([aria-current='page']),
              .pagination-light button:hover:not(:disabled) {
                border-color: #3b82f6;
                color: #3b82f6;
              }
              .pagination-light [aria-current='page'] {
                background-color: #3b82f6 !important;
                color: white !important;
                border-color: #3b82f6;
              }
              .pagination-light [aria-disabled='true'],
              .pagination-light button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
              }
            `}</style>
            <div className="pagination-light">
              <Pagination
                current={page}
                total={total}
                pageSize={pageSize}
                basePath={basePath}
                showPageSize={true}
                showJump={true}
                prevLabel={t('pagination.prev')}
                nextLabel={t('pagination.next')}
                texts={{
                  itemsPerPageSuffix: t('pagination.itemsSuffix'),
                  jumpToLabel: t('pagination.jumpTo'),
                  pageUnitLabel: t('pagination.pageUnit'),
                  ellipsis: t('pagination.ellipsis'),
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
