#!/usr/bin/env node
import { execSync } from 'child_process';
import { readFileSync } from 'fs';

console.log('🔍 扫描可能的隐式 any 类型错误...\n');

const patterns = [
  {
    name: '回调函数参数未标注类型',
    regex: /\.(map|filter|forEach|reduce|find|some|every)\(\s*\((\w+)\)\s*=>/g,
    description: '例如: .map((item) => ...) 应该改为 .map((item: Type) => ...)',
  },
  {
    name: 'Object.entries 未标注类型',
    regex: /Object\.entries\([^)]+\)\.forEach\(\s*\[\s*(\w+)\s*,\s*(\w+)\s*\]\s*=>/g,
    description: '例如: Object.entries(obj).forEach(([k, v]) => ...) 应该标注类型',
  },
  {
    name: 'Array.from 回调未标注类型',
    regex: /Array\.from\([^)]+\)\.forEach\(\s*\((\w+)\)\s*=>/g,
    description: '例如: Array.from(files).forEach((file) => ...) 应该标注类型',
  },
];

let totalIssues = 0;
try {
  // 获取所有 TypeScript 文件
  const files = execSync('find src/app -type f \\( -name "*.ts" -o -name "*.tsx" \\)', {
    encoding: 'utf-8',
    cwd: process.cwd(),
  })
    .trim()
    .split('\n')
    .filter(Boolean);

  console.log(`📂 扫描 ${files.length} 个文件...\n`);

  for (const pattern of patterns) {
    console.log(`\n📌 ${pattern.name}`);
    console.log(`  ${pattern.description}\n`);
    let patternIssues = 0;
    for (const file of files) {
      try {
        const content = readFileSync(file, 'utf-8');
        const matches = [...content.matchAll(pattern.regex)];
        if (matches.length > 0) {
          patternIssues += matches.length;
          console.log(`  ⚠️  ${file}`);
          // 显示匹配的代码行
          const lines = content.split('\n');
          matches.forEach((match) => {
            const lineNum = content.substring(0, match.index).split('\n').length;
            const line = lines[lineNum - 1]?.trim();
            if (line) {
              console.log(`    第 ${lineNum} 行: ${line.substring(0, 80)}${line.length > 80 ? '...' : ''}`);
            }
          });
          console.log('');
        }
      } catch {
        // 忽略无法读取的文件
      }
    }

    if (patternIssues === 0) {
      console.log('  ✅ 未发现问题\n');
    } else {
      console.log(`  发现 ${patternIssues} 个潜在问题\n`);

      totalIssues += patternIssues;
    }
  }

  console.log('\n' + '='.repeat(60));

  if (totalIssues === 0) {
    console.log('✅ 没有发现隐式 any 类型问题。');
    console.log('\n💡 提示：仍然建议运行 npm run build 来确保万无一失。');
    process.exit(0);
  } else {
    console.log(`⚠️  共发现 ${totalIssues} 个潜在的隐式 any 类型问题。`);
    process.exit(1);
  }
} catch (error) {
  console.error('❌ 扫描过程中出现错误:', error.message);
  process.exit(1);
}
