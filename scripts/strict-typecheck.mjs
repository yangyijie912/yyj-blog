#!/usr/bin/env node

/**
 * 严格的 TypeScript 类型检查脚本
 * 模拟 Next.js 构建时的类型检查行为
 * 
 * 使用方法: node scripts/strict-typecheck.mjs
 */

import { execSync } from 'child_process';

console.log('🔍 运行严格的 TypeScript 类型检查...\n');

try {
  // 运行 Next.js 的类型检查（这会使用 Next.js 生成的类型文件）
  console.log('📝 步骤 1: 运行 Next.js 类型生成...');
  execSync('npx next build --no-lint', { 
    stdio: 'inherit',
    env: { ...process.env, SKIP_ENV_VALIDATION: '1' }
  });
  
  console.log('\n✅ 类型检查通过！');
  process.exit(0);
} catch {
  console.error('\n❌ 发现类型错误！');
  console.error('这些错误在 Vercel 构建时也会出现。\n');
  process.exit(1);
}
