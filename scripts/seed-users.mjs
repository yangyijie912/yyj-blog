#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始初始化用户数据...\n');

  // 检查是否已存在用户
  const existingUsers = await prisma.user.count();
  
  if (existingUsers > 0) {
    console.log(`⚠️  数据库中已存在 ${existingUsers} 个用户，跳过初始化`);
    console.log('如需重新初始化，请先清空User表\n');
    return;
  }

  // 生成随机密码
  const randomPassword = randomBytes(16).toString('hex');
  const passwordHash = await bcrypt.hash(randomPassword, 12);

  // 创建默认admin用户
  const adminUser = await prisma.user.create({
    data: {
      id: 'default_admin_id',
      username: 'yyj',
      email: null,
      passwordHash: passwordHash,
      role: 'admin',
      isActive: 1, // SQLite: 1 = true, 0 = false
    },
  });

  console.log('✅ 默认管理员账号创建成功:');
  console.log(`   用户名: ${adminUser.username}`);
  console.log(`   密码: ${randomPassword}`);
  console.log(`   角色: ${adminUser.role}\n`);
  
  console.log('⚠️  重要提示:');
  console.log('   1. 请立即登录并修改密码');
  console.log('   2. 请妥善保管上述密码，它不会再次显示');
  console.log('   3. 可使用 npm run hash:admin 生成新的密码哈希\n');

  console.log('\n🎉 用户系统初始化完成！\n');
}

main()
  .catch((e) => {
    console.error('❌ 初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
