import React from 'react';
import ProjectList from './ProjectList';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/db';

interface PageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    pageSize?: string;
    sortBy?: string;
    categoryId?: string;
  }>;
}

export default async function ProjectListPage({ searchParams }: PageProps) {
  await requireAuth();

  const params = await searchParams;
  const q = (params?.q ?? '').trim();
  const page = Math.max(1, parseInt(params?.page ?? '1', 10) || 1);
  const pageSize = Math.min(50, Math.max(5, parseInt(params?.pageSize ?? '10', 10) || 10));
  const sortBy = params?.sortBy ?? 'createdAt-desc';
  const categoryId = params?.categoryId ?? '';

  const where = q
    ? {
        OR: [{ name: { contains: q } }, { description: { contains: q } }, { category: { name: { contains: q } } }],
        ...(categoryId ? { categoryId } : {}),
      }
    : categoryId
    ? { categoryId }
    : undefined;

  const total = await prisma.project.count({ where });

  // 获取所有分类用于筛选
  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    select: { id: true, name: true },
  });

  // 解析排序参数
  const [sortField, sortOrder] = sortBy.split('-');
  const orderBy =
    sortField === 'updatedAt'
      ? { updatedAt: (sortOrder || 'desc') as 'asc' | 'desc' }
      : { createdAt: (sortOrder || 'desc') as 'asc' | 'desc' };

  const projectsData = await prisma.project.findMany({
    where,
    orderBy,
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      category: {
        select: { name: true },
      },
    },
  });

  // 转换数据格式
  const projects = projectsData.map((proj: (typeof projectsData)[0]) => ({
    id: proj.id,
    name: proj.name,
    description: proj.description,
    category: {
      name: proj.category.name,
    },
    tags: Array.isArray(proj.tags) ? proj.tags.filter((tag: unknown): tag is string => typeof tag === 'string') : [],
    featured: proj.featured,
    createdAt: proj.createdAt,
    updatedAt: proj.updatedAt,
  }));

  return (
    <div className="project-list-page">
      <ProjectList
        projects={projects}
        total={total}
        page={page}
        pageSize={pageSize}
        q={q}
        sortBy={sortBy}
        categoryId={categoryId}
        categories={categories}
      />
    </div>
  );
}
