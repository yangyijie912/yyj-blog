'use client';
import React, { useCallback, useMemo, useEffect, useRef, useState } from 'react';
import { appendCsrfToken } from '@/lib/csrf';
import { useTranslations } from 'next-intl';

interface SimpleMarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  /**
   * 指定固定高度（像素）。若不传，则自动计算占满剩余空间。
   */
  height?: number;
}

// 一个简化版 Markdown 编辑器：纯 textarea + 基础 toolbar（粗体/斜体/删除线/链接/图片/列表/标题/代码块）
// 目的：用来备用，防止第三方markdown编辑器出现问题，保持完全可控。
const SimpleMarkdownEditor: React.FC<SimpleMarkdownEditorProps> = ({ value, onChange, height }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [autoHeight, setAutoHeight] = useState<number | undefined>(undefined);

  // 自动高度：未提供 height 时，根据窗口高度与容器顶部位置计算剩余空间
  useEffect(() => {
    if (height) return; // 用户传入高度则不自动计算
    function calc() {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // 预留底部 16px 余量，避免贴边；也可根据具体页面调整
      const available = window.innerHeight - rect.top - 16;
      if (available > 240) {
        setAutoHeight(available);
      } else {
        // 兜底最小高度
        setAutoHeight(240);
      }
    }
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, [height]);
  const insert = useCallback(
    (snippet: string, cursorOffset: number = 0) => {
      const ta = document.getElementById('simple-md-editor-ta') as HTMLTextAreaElement | null;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const before = value.slice(0, start);
      const after = value.slice(end);
      const newVal = before + snippet + after;
      onChange(newVal);
      requestAnimationFrame(() => {
        ta.focus();
        const pos = start + snippet.length + cursorOffset;
        ta.selectionStart = ta.selectionEnd = pos < 0 ? start + snippet.length : pos;
      });
    },
    [value, onChange]
  );

  const t = useTranslations();

  const handleImageUpload = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;

      const formData = new FormData();
      Array.from(files).forEach((file) => {
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
          throw new Error(t('writing.uploadFailed'));
        }

        const data = await response.json();
        const urls = data.urls as string[];

        // 插入所有图片的 markdown 语法
        const imageMarkdown = urls.map((url) => `![image](${url})`).join('\n');
        insert(`\n${imageMarkdown}\n`, 0);
      } catch (error) {
        console.error(t('writing.uploadImageFailed'), error);
        alert(t('writing.uploadImageFailedAlert'));
      }
    };
    input.click();
  }, [insert, t]);

  const wrapSelection = useCallback(
    (wrapperLeft: string, wrapperRight: string, placeholder: string = '') => {
      const ta = document.getElementById('simple-md-editor-ta') as HTMLTextAreaElement | null;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const sel = value.slice(start, end) || placeholder;
      const before = value.slice(0, start);
      const after = value.slice(end);
      const newVal = before + wrapperLeft + sel + wrapperRight + after;
      onChange(newVal);
      requestAnimationFrame(() => {
        ta.focus();
        const newStart = start + wrapperLeft.length;
        const newEnd = newStart + sel.length;
        ta.selectionStart = newStart;
        ta.selectionEnd = newEnd;
      });
    },
    [value, onChange]
  );

  const actions = useMemo(
    () => [
      { label: 'B', title: t('md.bold'), onClick: () => wrapSelection('**', '**', t('md.bold')) },
      { label: 'I', title: t('md.italic'), onClick: () => wrapSelection('_', '_', t('md.italic')) },
      { label: 'S', title: t('md.strike'), onClick: () => wrapSelection('~~', '~~', t('md.strike')) },
      { label: 'Link', title: t('md.link'), onClick: () => wrapSelection('[', '](https://example.com)', t('md.link')) },
      { label: 'Upload Image', title: t('md.uploadImage'), onClick: handleImageUpload },
      { label: 'H1', title: t('md.h1'), onClick: () => insert(`\n# ${t('md.h1')}\n`, 0) },
      { label: 'H2', title: t('md.h2'), onClick: () => insert(`\n## ${t('md.h2')}\n`, 0) },
      { label: 'UL', title: t('md.ul'), onClick: () => insert(`\n- ${t('md.ul')}\n- ${t('md.ul')}\n`, 0) },
      { label: 'OL', title: t('md.ol'), onClick: () => insert(`\n1. ${t('md.ol')}\n2. ${t('md.ol')}\n`, 0) },
      { label: 'Code', title: t('md.codeInline'), onClick: () => wrapSelection('`', '`', 'code') },
      {
        label: 'Block',
        title: t('md.codeBlock'),
        onClick: () => insert(`\n\n\`\`\`js\nconsole.log("hello")\n\`\`\`\n`, 0),
      },
      { label: 'Quote', title: t('md.quote'), onClick: () => insert(`\n> ${t('md.quote')}\n`, 0) },
      { label: 'Hr', title: t('md.hr'), onClick: () => insert('\n---\n', 0) },
    ],
    [insert, wrapSelection, handleImageUpload, t]
  );

  const finalHeight = height ?? autoHeight ?? 600;

  return (
    <div ref={containerRef} className="simple-md-editor flex flex-col min-h-0">
      <div className="toolbar flex flex-wrap gap-2 px-3 py-2 border-b bg-gray-50 sticky top-0 z-5">
        {actions.map((a) => (
          <button
            key={a.label}
            type="button"
            className="px-2 py-1 text-xs font-medium rounded border border-gray-300 bg-white hover:bg-gray-100 active:bg-gray-200 transition cursor-pointer"
            title={a.title}
            onClick={a.onClick}
          >
            {a.label}
          </button>
        ))}
      </div>
      <textarea
        id="simple-md-editor-ta"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ height: finalHeight }}
        spellCheck={false}
        className="w-full p-3 font-mono text-base resize-none outline-none border-0 focus:ring-0 leading-7 bg-white text-gray-800 tracking-wide overflow-auto"
        placeholder={t('md.placeholder')}
      />
      <style jsx>{`
        .simple-md-editor textarea {
          tab-size: 2;
          font-size: 18px;
          line-height: 1.75;
        }
        .simple-md-editor textarea::-webkit-scrollbar {
          width: 10px;
        }
        .simple-md-editor textarea::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .simple-md-editor textarea::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 8px;
        }
        .simple-md-editor textarea::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default SimpleMarkdownEditor;
