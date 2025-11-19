import React from 'react';
import ProjectEditor from './ProjectEditor';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/db';

type UnknownParamsPromise = Promise<unknown>;

export default async function ProjectsPage({ searchParams }: { searchParams?: UnknownParamsPromise }) {
  await requireAuth();

  const raw = searchParams ? await searchParams : undefined;
  const { edit } = (raw ?? {}) as { edit?: string };

  // 获取所有分类
  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
  });

  // 如果有编辑ID，获取现有项目数据
  let existingProject: null | {
    id: string;
    name: string;
    description?: string | null;
    url?: string | null;
    linkName?: string | null;
    tags: string[];
    categoryId: string;
    featured: boolean;
  } = null;

  if (edit) {
    const found = await prisma.project.findUnique({ where: { id: edit } });
    if (found) {
      existingProject = {
        id: found.id,
        name: found.name,
        description: found.description,
        url: found.url,
        linkName: found.linkName,
        tags: Array.isArray(found.tags) ? found.tags.filter((tag): tag is string => typeof tag === 'string') : [],
        categoryId: found.categoryId,
        featured: found.featured,
      };
    }
  }

  return (
    <div className="projects-manage-page">
      <ProjectEditor categories={categories} existingProject={existingProject} />
    </div>
  );
}
