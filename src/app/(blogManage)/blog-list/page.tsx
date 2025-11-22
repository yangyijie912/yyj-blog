import React from 'react';
import BlogList from './BlogList';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/db';

interface PageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    pageSize?: string;
    sortBy?: string;
  }>;
}

export default async function BlogListPage({ searchParams }: PageProps) {
  await requireAuth();

  const params = await searchParams;
  const q = (params?.q ?? '').trim();
  const page = Math.max(1, parseInt(params?.page ?? '1', 10) || 1);
  const pageSize = Math.min(50, Math.max(5, parseInt(params?.pageSize ?? '10', 10) || 10));
  const sortBy = params?.sortBy ?? 'createdAt-desc';

  const where = q
    ? {
        OR: [{ title: { contains: q } }, { intro: { contains: q } }],
      }
    : undefined;

  const total = await prisma.post.count({ where });

  // 优先按 featured，再按 updatedAt 降序排序（保持固定行为）
  const postsData = await prisma.post.findMany({
    where,
    orderBy: [{ featured: 'desc' }, { updatedAt: 'desc' }],
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  // 转换数据格式
  const posts = postsData.map((post: (typeof postsData)[0]) => ({
    id: post.id,
    title: post.title,
    intro: post.intro,
    tags: Array.isArray(post.tags) ? post.tags.filter((tag: unknown): tag is string => typeof tag === 'string') : [],
    featured: post.featured,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  }));

  return (
    <div className="blog-list-page">
      <BlogList posts={posts} total={total} page={page} pageSize={pageSize} q={q} sortBy={sortBy} />
    </div>
  );
}
