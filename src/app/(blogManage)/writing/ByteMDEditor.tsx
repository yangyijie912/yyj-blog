'use client';
import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { EditorProps as BytemdEditorProps } from '@bytemd/react';
import { appendCsrfToken } from '@/lib/csrf';
import { useTranslations } from 'next-intl';
// 样式（仅保留 Bytemd 与代码高亮）
import 'bytemd/dist/index.css';
import 'highlight.js/styles/github.css';

// 插件
import gfm from '@bytemd/plugin-gfm';
import breaks from '@bytemd/plugin-breaks';
import highlight from '@bytemd/plugin-highlight';

// 动态加载官方 React 封装组件
const DynamicByteEditor = dynamic(
  async () => {
    const mod = await import('@bytemd/react');
    return mod.Editor as React.ComponentType<BytemdEditorProps>;
  },
  { ssr: false }
);

export interface ByteMDEditorProps {
  value: string;
  onChange: (v: string) => void;
  /** 如果传入高度则使用固定高度；否则占满父容器剩余空间 */
  height?: number;
}

const ByteMDEditor: React.FC<ByteMDEditorProps> = ({ value, onChange, height }) => {
  const plugins = useMemo(() => [gfm(), breaks(), highlight()], []);

  // 上传图片到服务器
  const handleUploadImages = async (files: File[]): Promise<{ url: string }[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('file', file);
    });
    // 添加 CSRF token
    appendCsrfToken(formData);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('上传失败');
      }

      const data = await response.json();
      return data.urls.map((url: string) => ({ url }));
    } catch (error) {
      console.error('上传图片失败:', error);
      // 如果上传失败，降级使用本地预览
      return files.map((f) => ({ url: URL.createObjectURL(f) }));
    }
  };

  const t = useTranslations();
  return (
    <div className="byte-md-editor">
      <DynamicByteEditor
        value={value}
        plugins={plugins}
        onChange={(v: string) => onChange(v)}
        uploadImages={handleUploadImages}
        placeholder={t('md.placeholder')}
      />
      <style jsx global>{`
        .byte-md-editor,
        .byte-md-editor .bytemd {
          ${height ? `height:${height}px;` : 'height:100%;'}
          display: flex;
          flex-direction: column;
        }
        .byte-md-editor .bytemd {
          border: none;
        }
        .byte-md-editor .bytemd-toolbar {
          height: 44px;
          flex-shrink: 0;
        }
        .byte-md-editor .bytemd-body {
          flex: 1;
          min-height: 0;
          overflow: auto;
          align-items: stretch;
        }

        /* 扩展编辑内容宽度（覆盖默认 800px 限制），适用于所有模式，包括只写模式 */
        .byte-md-editor .bytemd-editor .CodeMirror-lines {
          max-width: 100% !important;
        }
        /* 预览区也去掉 800px 限制（避免全屏仍显得窄）*/
        .byte-md-editor .bytemd-preview .markdown-body {
          max-width: 100% !important;
        }
        /* 放大编辑器字体与行高 */
        .byte-md-editor .bytemd-editor .CodeMirror {
          font-size: 20px !important;
          line-height: 1.7 !important;
        }
      `}</style>
    </div>
  );
};

export default ByteMDEditor;
