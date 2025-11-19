'use server';
import { prisma } from '@/db';
import { verifyAuthAndCsrf } from '@/lib/auth';
import type { ActionResult, ActionResultWithId } from '@/types/actions';

export async function createPost(formData: FormData): Promise<ActionResultWithId> {
  // 认证和CSRF校验
  const authResult = await verifyAuthAndCsrf(formData);
  if (!authResult.ok) {
    return authResult;
  }

  // 提取并验证表单数据
  const title = (formData.get('title') || '').toString().trim();
  const intro = (formData.get('intro') || '').toString().trim();
  const content = (formData.get('content') || '').toString();
  const tagsRaw = (formData.get('tags') || '').toString();
  const featuredRaw = (formData.get('featured') || 'false').toString();
  const featured = featuredRaw === 'true';

  if (!title) throw new Error('标题不能为空');
  if (!content) throw new Error('内容不能为空');

  // 处理标签，去重
  const tags = Array.from(
    new Set(
      tagsRaw
        .split(/[,\n]/)
        .map((t) => t.trim())
        .filter(Boolean)
    )
  );

  // 创建文章
  try {
    const created = await prisma.post.create({
      data: {
        title,
        intro: intro || content.slice(0, 200),
        content,
        tags,
        featured,
      },
    });
    return { ok: true, id: created.id };
  } catch (err: unknown) {
    console.error('createPost error:', err);
    return { ok: false, message: err instanceof Error ? err.message : '创建失败' };
  }
}

// 更新文章
export async function updatePost(formData: FormData): Promise<ActionResultWithId> {
  // 认证和CSRF校验
  const authResult = await verifyAuthAndCsrf(formData);
  if (!authResult.ok) {
    return authResult;
  }
  const id = (formData.get('id') || '').toString();
  if (!id) return { ok: false, message: '缺少文章ID' };
  const title = (formData.get('title') || '').toString().trim();
  const intro = (formData.get('intro') || '').toString().trim();
  const content = (formData.get('content') || '').toString();
  const tagsRaw = (formData.get('tags') || '').toString();
  const featuredRaw = (formData.get('featured') || 'false').toString();
  const featured = featuredRaw === 'true';
  if (!title) return { ok: false, message: '标题不能为空' };
  if (!content) return { ok: false, message: '内容不能为空' };
  const tags = Array.from(
    new Set(
      tagsRaw
        .split(/[,\n]/)
        .map((t) => t.trim())
        .filter(Boolean)
    )
  );
  try {
    const updated = await prisma.post.update({
      where: { id },
      data: {
        title,
        intro: intro || content.slice(0, 200),
        content,
        tags,
        featured,
      },
    });
    return { ok: true, id: updated.id };
  } catch (err: unknown) {
    console.error('updatePost error:', err);
    return { ok: false, message: err instanceof Error ? err.message : '更新失败' };
  }
}

// 删除文章
export async function deletePost(formData: FormData): Promise<ActionResult> {
  // 认证和CSRF校验
  const authResult = await verifyAuthAndCsrf(formData);
  if (!authResult.ok) {
    return authResult;
  }
  const id = (formData.get('id') || '').toString();
  if (!id) return { ok: false, message: '缺少文章ID' };

  try {
    await prisma.post.delete({
      where: { id },
    });
    return { ok: true };
  } catch (err: unknown) {
    console.error('deletePost error:', err);
    return { ok: false, message: err instanceof Error ? err.message : '删除失败' };
  }
}
