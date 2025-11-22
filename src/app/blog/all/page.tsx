import { prisma } from '@/db';
import BlogSearchList from '../BlogSearchList';
import Pagination from '@/app/components/Pagination';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams?: Promise<{
    page?: string;
    pageSize?: string;
  }>;
};

export default async function BlogAll({ searchParams }: Props) {
  const t = await getTranslations();
  const sp = (await searchParams) ?? {};
  const pageSize = Math.max(1, Math.min(50, Number(sp.pageSize ?? 10) || 10));
  const page = Math.max(1, Number(sp.page ?? 1) || 1);

  const [total, posts] = await Promise.all([
    prisma.post.count(),
    prisma.post.findMany({
      orderBy: [{ featured: 'desc' }, { updatedAt: 'desc' }],
      select: {
        id: true,
        title: true,
        intro: true,
        createdAt: true,
        updatedAt: true,
        tags: true,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  // totalPages 由分页组件内部根据 total 与 pageSize 计算,这里不再需要

  return (
    <section className="w-full bg-[#0B1220] text-slate-100 pt-6 sm:pt-0">
      <div className="px-6 md:px-10 lg:px-14 xl:px-20 py-12 md:py-16 max-w-6xl lg:max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{t('blogAllPage.title')}</h1>
        <p className="mt-3 text-slate-300/90 max-w-2xl text-sm md:text-base leading-relaxed">
          {t('blogAllPage.subtitle')}
        </p>
        <BlogSearchList posts={posts} columns={2} />

        {/* 分页器 */}
        <nav className="mt-10 flex items-center justify-center gap-4" aria-label={t('blogAllPage.pagination.aria')}>
          <Pagination
            current={page}
            total={total}
            pageSize={pageSize}
            basePath="/blog/all"
            showPageSize
            showJump
            maxShown={5}
            prevLabel={t('pagination.prev')}
            nextLabel={t('pagination.next')}
            texts={{
              itemsPerPageSuffix: t('pagination.itemsSuffix'),
              jumpToLabel: t('pagination.jumpTo'),
              pageUnitLabel: t('pagination.pageUnit'),
              ellipsis: t('pagination.ellipsis'),
            }}
          />
        </nav>
      </div>
    </section>
  );
}
