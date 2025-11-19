import React from 'react';
import CategoryManager from './CategoryManager';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/db';

interface PageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    pageSize?: string;
  }>;
}

export default async function CategoriesPage({ searchParams }: PageProps) {
  await requireAuth();

  const params = await searchParams;
  const q = (params?.q ?? '').trim();
  const page = Math.max(1, parseInt(params?.page ?? '1', 10) || 1);
  const pageSize = Math.min(50, Math.max(5, parseInt(params?.pageSize ?? '10', 10) || 10));

  const where = q
    ? {
        name: {
          contains: q,
        },
      }
    : undefined;

  const total = await prisma.category.count({ where });

  const categories = await prisma.category.findMany({
    where,
    orderBy: { order: 'asc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      _count: {
        select: { projects: true },
      },
    },
  });

  return (
    <div className="categories-manage-page">
      <CategoryManager categories={categories} total={total} page={page} pageSize={pageSize} q={q} />
    </div>
  );
}
