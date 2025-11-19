import React from 'react';
import ProjectPageClient from './ProjectPageClient';
import { prisma } from '@/db';

export default async function ProjectPage() {
  // 获取所有分类及其项目
  const categoriesData = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    include: {
      projects: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  // 转换数据格式
  const categories = categoriesData.map((cat) => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
    order: cat.order,
    projects: cat.projects.map((proj) => ({
      id: proj.id,
      name: proj.name,
      description: proj.description,
      url: proj.url,
      linkName: proj.linkName,
      tags: Array.isArray(proj.tags) ? proj.tags.filter((tag): tag is string => typeof tag === 'string') : [],
      featured: proj.featured,
    })),
  }));

  return <ProjectPageClient categories={categories} />;
}
