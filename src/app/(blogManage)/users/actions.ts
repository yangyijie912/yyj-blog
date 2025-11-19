'use server';

import { prisma } from '@/db';
import { verifyAdmin, verifyAuthAndCsrf } from '@/lib/auth';
import { hashSync } from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import type { ActionResult, ActionResultData } from '@/types/actions';

type UserSummary = {
  id: string;
  username: string;
  email: string | null;
  role: string;
  isActive: number;
  createdAt: Date;
  updatedAt: Date;
};

// 获取所有用户列表（仅管理员）
export async function getUsersAction(): Promise<ActionResultData<{ users?: UserSummary[] }>> {
  const auth = await verifyAdmin();
  if (!auth.ok) {
    return { ok: false, message: auth.message };
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { ok: true, users };
  } catch (error) {
    console.error('获取用户列表失败:', error);
    return { ok: false, message: '获取用户列表失败' };
  }
}

// 创建新用户（仅管理员）
export async function createUserAction(formData: FormData): Promise<ActionResult> {
  const auth = await verifyAuthAndCsrf(formData);
  if (!auth.ok || auth.role !== 'admin') {
    return { ok: false, message: auth.message || '需要管理员权限' };
  }

  const username = formData.get('username')?.toString().trim();
  const email = formData.get('email')?.toString().trim() || null;
  const password = formData.get('password')?.toString();
  const role = formData.get('role')?.toString() || 'user';

  // 验证必填字段
  if (!username || !password) {
    return { ok: false, message: '用户名和密码不能为空' };
  }

  // 验证用户名格式（3-20个字符，仅字母数字下划线）
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return { ok: false, message: '用户名格式不正确（3-20个字母数字下划线）' };
  }

  // 验证密码长度
  if (password.length < 6) {
    return { ok: false, message: '密码至少6个字符' };
  }

  // 验证邮箱格式
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: '邮箱格式不正确' };
  }

  // 验证角色
  if (!['admin', 'user'].includes(role)) {
    return { ok: false, message: '角色无效' };
  }

  try {
    // 检查用户名是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return { ok: false, message: '用户名已存在' };
    }

    // 检查邮箱是否已存在
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (existingEmail) {
        return { ok: false, message: '邮箱已被使用' };
      }
    }

    // 创建用户
    const passwordHash = hashSync(password, 12);
    await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        role,
        isActive: 1,
      },
    });

    revalidatePath('/users');
    return { ok: true, message: '用户创建成功' };
  } catch (error) {
    console.error('创建用户失败:', error);
    return { ok: false, message: '创建用户失败' };
  }
}

// 更新用户信息（仅管理员）
export async function updateUserAction(formData: FormData): Promise<ActionResult> {
  const auth = await verifyAuthAndCsrf(formData);
  if (!auth.ok || auth.role !== 'admin') {
    return { ok: false, message: auth.message || '需要管理员权限' };
  }

  const userId = formData.get('userId')?.toString();
  const email = formData.get('email')?.toString().trim() || null;
  const role = formData.get('role')?.toString();
  const isActive = formData.get('isActive')?.toString() === 'true';

  if (!userId) {
    return { ok: false, message: '用户ID不能为空' };
  }

  // 验证邮箱格式
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: '邮箱格式不正确' };
  }

  // 验证角色
  if (role && !['admin', 'user'].includes(role)) {
    return { ok: false, message: '角色无效' };
  }

  try {
    // 防止删除最后一个管理员
    if (role === 'user' || !isActive) {
      const adminCount = await prisma.user.count({
        where: { role: 'admin', isActive: 1 },
      });

      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (currentUser?.role === 'admin' && currentUser.isActive && adminCount <= 1) {
        return { ok: false, message: '不能禁用或降级最后一个管理员' };
      }
    }

    // 检查邮箱是否被其他用户使用
    if (email) {
      const existingEmail = await prisma.user.findFirst({
        where: {
          email,
          id: { not: userId },
        },
      });

      if (existingEmail) {
        return { ok: false, message: '邮箱已被其他用户使用' };
      }
    }

    // 更新用户
    await prisma.user.update({
      where: { id: userId },
      data: {
        email,
        role,
        isActive: isActive ? 1 : 0,
      },
    });

    revalidatePath('/users');
    return { ok: true, message: '用户信息已更新' };
  } catch (error) {
    console.error('更新用户失败:', error);
    return { ok: false, message: '更新用户失败' };
  }
}

// 修改用户密码（仅管理员）
export async function changeUserPasswordAction(formData: FormData): Promise<ActionResult> {
  const auth = await verifyAuthAndCsrf(formData);
  if (!auth.ok || auth.role !== 'admin') {
    return { ok: false, message: auth.message || '需要管理员权限' };
  }

  const userId = formData.get('userId')?.toString();
  const newPassword = formData.get('newPassword')?.toString();

  if (!userId || !newPassword) {
    return { ok: false, message: '用户ID和新密码不能为空' };
  }

  if (newPassword.length < 6) {
    return { ok: false, message: '密码至少6个字符' };
  }

  try {
    const passwordHash = hashSync(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { ok: true, message: '密码已更新' };
  } catch (error) {
    console.error('修改密码失败:', error);
    return { ok: false, message: '修改密码失败' };
  }
}

// 删除用户（仅管理员）
export async function deleteUserAction(formData: FormData): Promise<ActionResult> {
  // 统一认证与 CSRF 校验
  const auth = await verifyAuthAndCsrf(formData);
  if (!auth.ok || auth.role !== 'admin') {
    return { ok: false, message: auth.message || '需要管理员权限' };
  }

  const userId = formData.get('userId')?.toString();

  if (!userId) {
    return { ok: false, message: '用户ID不能为空' };
  }

  try {
    // 检查是否为最后一个管理员
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { ok: false, message: '用户不存在' };
    }

    if (user.role === 'admin') {
      const adminCount = await prisma.user.count({
        where: { role: 'admin', isActive: 1 },
      });

      if (adminCount <= 1) {
        return { ok: false, message: '不能删除最后一个管理员' };
      }
    }

    // 防止删除自己
    if (userId === auth.userId) {
      return { ok: false, message: '不能删除自己的账号' };
    }

    // 删除用户（级联删除文章和项目）
    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath('/users');
    return { ok: true, message: '用户已删除' };
  } catch (error) {
    console.error('删除用户失败:', error);
    return { ok: false, message: '删除用户失败' };
  }
}
