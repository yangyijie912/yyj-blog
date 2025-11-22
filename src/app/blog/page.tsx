import React from 'react';
import { prisma } from '@/db';
import BlogSearchList from './BlogSearchList';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

const Blog = async () => {
  const t = await getTranslations();
  const posts = await prisma.post.findMany({
    orderBy: [{ featured: 'desc' }, { updatedAt: 'desc' }],
    select: {
      id: true,
      title: true,
      intro: true,
      createdAt: true,
      updatedAt: true,
      tags: true,
    },
    take: 6,
  });

  return (
    <section className="w-full bg-[#0B1220] text-slate-100 pt-6 sm:pt-0">
      <div className="px-6 md:px-10 lg:px-14 py-12 md:py-16 max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{t('blogPage.title')}</h1>
        <p className="mt-3 text-slate-300/90 max-w-2xl text-sm md:text-base leading-relaxed">
          {t('blogPage.subtitle')}
        </p>
        {/* 搜索 + 列表（仅展示 6 条） */}
        <BlogSearchList posts={posts} dateField="updatedAt" dateLabel={t('blogPage.dateLabel.updated')} />

        {/* 查看全部 */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/blog/all"
            className="px-5 py-2.5 rounded-lg border border-slate-700/60 text-slate-100 text-sm font-medium hover:border-cyan-400/60 hover:text-cyan-200 transition"
          >
            {t('blogPage.viewAll')}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Blog;
