import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Next 官方推荐基础规则
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  // 全局忽略
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
  },
  // 仅对 TS/TSX 启用需要类型信息的规则，避免对 JS/配置文件报错
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        // 启用类型感知规则（ESLint v9 + typescript-eslint 支持）
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      // 与 Vercel 构建严格度对齐
      '@typescript-eslint/no-explicit-any': 'error',
      // 这些为类型感知规则，可发现潜在的隐患
      // 对于已添加注释说明的 any 使用，允许通过 eslint-disable 抑制警告
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
    },
  },
  // 对 i18n config 特殊处理（next-intl 的 API 返回类型为 any）
  {
    files: ['src/i18n/config.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
];

export default eslintConfig;
