import React from 'react';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { prisma } from '@/db';
import { verifySession } from '@/lib/auth';
import ClientView from './ClientView';

export const dynamic = 'force-dynamic';

// Next.js App Router 动态段参数在最新类型中可能被推断为 Promise，需要显式解包
type PageParams = { id: string };

type UnknownParamsPromise = Promise<unknown>;

async function BlogDetail({ params }: { params?: UnknownParamsPromise }) {
  const raw = params ? await params : undefined;
  const { id } = (raw ?? {}) as PageParams;

  const post = await prisma.post.findUnique({
    where: { id },
  });
  if (!post) return notFound();

  // 判断当前用户是否已登录(用于显示"编辑"按钮)
  const token = (await cookies()).get('session')?.value;
  const payload = token ? await verifySession(token) : null;
  const isAuthor = !!payload; // 所有登录用户都可以编辑

  return <ClientView post={{ ...post, createdAt: post.createdAt }} isAuthor={isAuthor} />;
}

export default BlogDetail;
