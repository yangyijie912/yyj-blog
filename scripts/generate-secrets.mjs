#!/usr/bin/env node
import { randomBytes } from 'crypto';
import fs from 'fs';
import path from 'path';

console.log('🔐 生成安全密钥...\n');

// 生成32字节的随机密钥(256位)
const authSecret = randomBytes(32).toString('hex');

console.log('✅ 已生成强随机密钥:\n');
console.log(`AUTH_SECRET=${authSecret}\n`);

// 检查.env文件
const envPath = path.resolve(process.cwd(), '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  
  // 检查是否已有AUTH_SECRET
  if (envContent.includes('AUTH_SECRET=')) {
    console.log('⚠️  警告: .env文件中已存在AUTH_SECRET');
    console.log('   如需更新,请手动替换为上述新密钥\n');
  } else {
    console.log('💡 提示: 请将上述密钥添加到 .env 文件中\n');
  }
} else {
  console.log('💡 提示: 请创建 .env 文件并添加上述密钥\n');
}
