import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { verifyAuthAndCsrf } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // 认证 + CSRF 校验
    const authResult = await verifyAuthAndCsrf(formData);
    if (!authResult.ok) {
      return NextResponse.json({ error: authResult.message || '未授权' }, { status: 401 });
    }

    const files = formData.getAll('file') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: '没有找到文件' }, { status: 400 });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      // 生成唯一文件名
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `${timestamp}-${randomStr}.${ext}`;

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

      // 返回可访问的URL
      uploadedUrls.push(`/uploads/${filename}`);
    }

    return NextResponse.json({ urls: uploadedUrls });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: '上传失败' }, { status: 500 });
  }
}
