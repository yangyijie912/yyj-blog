#!/usr/bin/env node

/**
 * 生产环境初始化脚本
 */

import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const prisma = new PrismaClient();

// 解析命令行参数：支持 --password=xxx、-p xxx、或第一个位置参数
function parsePasswordArg() {
  const argv = process.argv.slice(2);
  let provided = null;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--password=')) {
      provided = a.slice('--password='.length);
      break;
    } else if (a === '--password' || a === '-p') {
      provided = argv[i + 1] || '';
      break;
    }
  }

  // 若未通过带名参数提供，接受第一个非短横线开头的位置参数
  if (!provided) {
    const pos = argv.find((x) => x && !x.startsWith('-'));
    if (pos) provided = pos;
  }

  if (provided && typeof provided === 'string') {
    const trimmed = provided.trim();
    if (trimmed.length > 0) return trimmed;
  }
  return null;
}

// 生成随机密钥
function generateSecret(length = 32) {
  return randomBytes(length).toString('base64');
}

// 生成密码哈希（与登录逻辑保持一致：bcrypt）
function hashPassword(password) {
  return bcrypt.hashSync(password, 12);
}

// 更新或创建 .env 文件
function updateEnvFile(key, value) {
  const envPath = join(__dirname, '..', '.env');
  let envContent = '';
  
  if (existsSync(envPath)) {
    envContent = readFileSync(envPath, 'utf-8');
  }
  
  // 检查是否已存在该键
  const lines = envContent.split('\n');
  const keyExists = lines.some(line => line.startsWith(`${key}=`));
  
  if (keyExists) {
    // 更新现有键
    envContent = lines
      .map(line => line.startsWith(`${key}=`) ? `${key}="${value}"` : line)
      .join('\n');
  } else {
    // 添加新键
    if (envContent && !envContent.endsWith('\n')) {
      envContent += '\n';
    }
    envContent += `${key}="${value}"\n`;
  }
  
  writeFileSync(envPath, envContent, 'utf-8');
}

async function initProduction() {
  console.log('------开始生产环境初始化...\n');
  
  try {
    const providedPassword = parsePasswordArg();
    // 1. 生成并写入 AUTH_SECRET
    console.log('------生成 AUTH_SECRET...');
    const authSecret = generateSecret(32);
    updateEnvFile('AUTH_SECRET', authSecret);
    console.log('✓ 已生成并写入 .env 文件\n');
    
    // 2. 创建管理员账号
    console.log('------创建管理员账号...');
    
    // 默认管理员信息
    const adminUsername = 'yyj';
    
    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username: adminUsername },
      select: { id: true, username: true, role: true, passwordHash: true }
    });
    
    if (existingUser) {
      // 如果已存在，但密码哈希不是 bcrypt（历史脚本写入的 scrypt 形式，如包含冒号）则进行一次性修复
      const hash = existingUser.passwordHash || '';
      const isBcrypt = hash.startsWith('$2');
      const looksLikeScrypt = hash.includes(':');

      if (!isBcrypt && looksLikeScrypt) {
        const newPassword = providedPassword || randomBytes(16).toString('hex');
        const newHash = hashPassword(newPassword);
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { passwordHash: newHash },
        });
        console.log(`!!! 检测到旧格式(非 bcrypt)密码哈希，已为用户 "${adminUsername}" 重置密码`);
        console.log(`    新密码: ${newPassword}`);
        console.log('    请使用上述新密码登录并尽快修改');
      } else {
        console.log(`!!! 用户 "${adminUsername}" 已存在，跳过创建`);
        console.log(`    用户ID: ${existingUser.id}`);
        console.log(`    角色: ${existingUser.role}`);
      }
    } else {
      // 生成随机密码
      const adminPassword = providedPassword || randomBytes(16).toString('hex');
      const passwordHash = hashPassword(adminPassword);
      
      const admin = await prisma.user.create({
        data: {
          username: adminUsername,
          email: null,
          passwordHash,
          role: 'admin',
          isActive: 1,
        },
      });
      
      console.log('✓ 管理员账号创建成功！');
      console.log(`  用户名: ${admin.username}`);
      console.log(`  密码: ${adminPassword}`);
      console.log(`  用户ID: ${admin.id}`);
      console.log('！请妥善保管密码，它不会再次显示！\n');
    }
    
    // 3. 显示摘要
    console.log('═══════════════════════════════════════');
    console.log('生产环境初始化完成！');
    console.log('═══════════════════════════════════════');
    console.log('✓ AUTH_SECRET 已配置');
    console.log('✓ 管理员账号已就绪');
    console.log('\n 下一步操作：');
    console.log('1. 访问 /login 页面登录');
    console.log(`2. 使用用户名 "${adminUsername}" 和上方显示的密码登录`);
    console.log('3. 登录后建议修改密码');
    console.log('═══════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ 初始化失败:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 执行初始化
initProduction();
