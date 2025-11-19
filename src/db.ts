import { PrismaClient } from '@prisma/client';

// 全局缓存，避免开发环境热重载创建多个实例
declare global {
  var __prisma__: PrismaClient | undefined;
}

const prisma = global.__prisma__ || new PrismaClient();
if (process.env.NODE_ENV !== 'production') {
  global.__prisma__ = prisma;
}

export { prisma };
