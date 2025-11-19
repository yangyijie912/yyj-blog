import React from 'react';
import Editor from './Editor';
import { createPost, updatePost } from './actions';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/db';

type UnknownParamsPromise = Promise<unknown>;

export default async function WritingPage({ searchParams }: { searchParams?: UnknownParamsPromise }) {
  // 确保用户已认证
  await requireAuth();
  // 获取可能的编辑文章ID
  const raw = searchParams ? await searchParams : undefined;
  const { edit } = (raw ?? {}) as { edit?: string };
  // 如果有编辑ID，获取现有文章数据
  let existing: null | {
    id: string;
    title: string;
    intro?: string | null;
    content: string;
    tags: unknown;
    featured?: boolean;
  } = null;
  if (edit) {
    const found = await prisma.post.findUnique({ where: { id: edit } });
    if (found) {
      existing = {
        id: found.id,
        title: found.title,
        intro: found.intro,
        content: found.content,
        tags: found.tags,
        featured: found.featured,
      };
    }
  }
  return (
    <div className="writing-page">
      <Editor createAction={createPost} updateAction={updatePost} existingPost={existing} />
    </div>
  );
}
