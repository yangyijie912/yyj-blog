import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthAndCsrf } from '@/lib/auth';
import { uploadFiles } from '@/lib/storage';

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

    // 使用统一的存储适配器上传文件
    const results = await uploadFiles(files);
    const uploadedUrls = results.map((result) => result.url);

    return NextResponse.json({ urls: uploadedUrls });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: '上传失败' }, { status: 500 });
  }
}
