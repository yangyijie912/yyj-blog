/**
 * 统一的文件存储适配器
 * 支持本地存储（开发环境）和云存储（生产环境）
 */

import { put } from '@vercel/blob';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * 上传文件接口返回类型
 */
export interface UploadResult {
  url: string;
  filename: string;
}

/**
 * 生成唯一文件名
 */
function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const ext = originalName.split('.').pop() || 'jpg';
  return `${timestamp}-${randomStr}.${ext}`;
}

/**
 * 上传文件到本地存储（开发环境）
 */
async function uploadToLocal(file: File): Promise<UploadResult> {
  const filename = generateUniqueFilename(file.name);

  // 确保上传目录存在
  const uploadsDir = join(process.cwd(), 'public', 'uploads');
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }

  // 保存文件
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filepath = join(uploadsDir, filename);
  await writeFile(filepath, buffer);

  return {
    url: `/uploads/${filename}`,
    filename,
  };
}

/**
 * 上传文件到云存储（生产环境 - Vercel Blob）
 */
async function uploadToCloud(file: File): Promise<UploadResult> {
  const filename = generateUniqueFilename(file.name);

  // 上传到 Vercel Blob
  const blob = await put(filename, file, {
    access: 'public',
    addRandomSuffix: false,
  });

  return {
    url: blob.url,
    filename,
  };
}

/**
 * 统一的文件上传方法
 * 根据环境变量自动选择存储方式
 */
export async function uploadFile(file: File): Promise<UploadResult> {
  const useCloudStorage = process.env.USE_CLOUD_STORAGE === 'true';

  // 检查是否配置了 Vercel Blob
  const hasVercelBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

  if (useCloudStorage && hasVercelBlob) {
    return uploadToCloud(file);
  } else {
    return uploadToLocal(file);
  }
}

/**
 * 批量上传文件
 */
export async function uploadFiles(files: File[]): Promise<UploadResult[]> {
  const uploadPromises = files.map((file) => uploadFile(file));
  return Promise.all(uploadPromises);
}
