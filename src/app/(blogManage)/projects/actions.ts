'use server';

import { prisma } from '@/db';
import { verifyAuthAndCsrf } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { ActionResult, ActionResultWithId } from '@/types/actions';

export async function createProject(formData: FormData): Promise<ActionResultWithId> {
  const authResult = await verifyAuthAndCsrf(formData);
  if (!authResult.ok) {
    return authResult;
  }

  const name = (formData.get('name') || '').toString().trim();
  const description = (formData.get('description') || '').toString();
  const url = (formData.get('url') || '').toString();
  const linkName = (formData.get('linkName') || '').toString();
  const categoryId = (formData.get('categoryId') || '').toString();
  const tagsStr = (formData.get('tags') || '').toString();
  const featured = (formData.get('featured') || 'false').toString() === 'true';

  if (!name || !categoryId) {
    return { ok: false, message: '项目名称和分类为必填项' };
  }

  const tags = tagsStr
    ? tagsStr
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  try {
    const created = await prisma.project.create({
      data: {
        name,
        description: description || null,
        url: url || null,
        linkName: linkName || null,
        tags,
        categoryId,
        featured,
      },
    });

    revalidatePath('/project');
    revalidatePath('/projects');
    revalidatePath('/project-list');

    return { ok: true, id: created.id }; // Original line
  } catch (err: unknown) {
    console.error('createProject error:', err);
    return { ok: false, message: err instanceof Error ? err.message : '创建失败' };
  }
}

export async function updateProject(formData: FormData): Promise<ActionResultWithId> {
  const authResult = await verifyAuthAndCsrf(formData);
  if (!authResult.ok) {
    return authResult;
  }

  const id = (formData.get('id') || '').toString();
  const name = (formData.get('name') || '').toString().trim();
  const description = (formData.get('description') || '').toString();
  const url = (formData.get('url') || '').toString();
  const linkName = (formData.get('linkName') || '').toString();
  const categoryId = (formData.get('categoryId') || '').toString();
  const tagsStr = (formData.get('tags') || '').toString();
  const featured = (formData.get('featured') || 'false').toString() === 'true';

  if (!id) return { ok: false, message: '缺少项目ID' };
  if (!name || !categoryId) {
    return { ok: false, message: '项目名称和分类为必填项' };
  }

  const tags = tagsStr
    ? tagsStr
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  try {
    const updated = await prisma.project.update({
      where: { id },
      data: {
        name,
        description: description || null,
        url: url || null,
        linkName: linkName || null,
        tags,
        categoryId,
        featured,
      },
    });

    revalidatePath('/project');
    revalidatePath('/projects');
    revalidatePath('/project-list');
    revalidatePath(`/project/${id}`);

    return { ok: true, id: updated.id }; // Original line
  } catch (err: unknown) {
    console.error('updateProject error:', err);
    return { ok: false, message: err instanceof Error ? err.message : '更新失败' };
  }
}

export async function deleteProject(formData: FormData): Promise<ActionResult> {
  const authResult = await verifyAuthAndCsrf(formData);
  if (!authResult.ok) {
    return authResult;
  }

  const id = (formData.get('id') || '').toString();
  if (!id) {
    return { ok: false, message: '项目id不能为空' };
  }

  try {
    await prisma.project.delete({
      where: { id },
    });

    revalidatePath('/project');
    revalidatePath('/projects');
    revalidatePath('/project-list');

    return { ok: true }; // Original line
  } catch (err: unknown) {
    console.error('deleteProject error:', err);
    return { ok: false, message: err instanceof Error ? err.message : '删除失败' };
  }
}

export async function createCategory(formData: FormData): Promise<ActionResultWithId> {
  const authResult = await verifyAuthAndCsrf(formData);
  if (!authResult.ok) {
    return authResult;
  }

  const name = (formData.get('name') || '').toString().trim();
  const icon = (formData.get('icon') || '').toString().trim();
  const order = parseInt((formData.get('order') || '0').toString()) || 0;

  if (!name) {
    return { ok: false, message: '分类名称为必填项' };
  }

  try {
    const created = await prisma.category.create({
      data: {
        name,
        icon: icon || null,
        order,
      },
    });

    revalidatePath('/projects');

    return { ok: true, id: created.id }; // Original line
  } catch (err: unknown) {
    console.error('createCategory error:', err);
    return { ok: false, message: err instanceof Error ? err.message : '创建失败' };
  }
}

export async function updateCategory(formData: FormData): Promise<ActionResultWithId> {
  const authResult = await verifyAuthAndCsrf(formData);
  if (!authResult.ok) {
    return authResult;
  }

  const id = (formData.get('id') || '').toString();
  const name = (formData.get('name') || '').toString().trim();
  const icon = (formData.get('icon') || '').toString().trim();
  const order = parseInt((formData.get('order') || '0').toString()) || 0;

  if (!id) return { ok: false, message: '分类ID不能为空' };
  if (!name) return { ok: false, message: '分类名称为必填项' };

  try {
    const updated = await prisma.category.update({
      where: { id },
      data: {
        name,
        icon: icon || null,
        order,
      },
    });

    revalidatePath('/projects');

    return { ok: true, id: updated.id }; // Original line
  } catch (err: unknown) {
    console.error('updateCategory error:', err);
    return { ok: false, message: err instanceof Error ? err.message : '更新失败' };
  }
}

export async function deleteCategory(formData: FormData): Promise<ActionResult> {
  const authResult = await verifyAuthAndCsrf(formData);
  if (!authResult.ok) {
    return authResult;
  }

  const id = (formData.get('id') || '').toString();
  if (!id) {
    return { ok: false, message: '分类ID不能为空' };
  }

  try {
    const count = await prisma.project.count({
      where: { categoryId: id },
    });

    if (count > 0) {
      return { ok: false, message: '该分类下还有项目，无法删除' };
    }

    await prisma.category.delete({
      where: { id },
    });

    revalidatePath('/projects');

    return { ok: true }; // Original line
  } catch (err: unknown) {
    console.error('deleteCategory error:', err);
    return { ok: false, message: err instanceof Error ? err.message : '删除失败' };
  }
}
