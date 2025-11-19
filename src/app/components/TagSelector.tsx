'use client';

import React, { useEffect, useMemo, useRef, useState, KeyboardEvent } from 'react';
import { TAG_OPTIONS } from '@/lib/tagOptions';

export interface TagSelectorProps {
  value: string[];
  onChange: (next: string[]) => void;
  options?: string[];
  placeholder?: string;
}

export default function TagSelector({ value, onChange, options = TAG_OPTIONS, placeholder }: TagSelectorProps) {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const addTag = (raw: string) => {
    const t = raw.trim();
    if (!t) return;
    const next = Array.from(new Set([...value, t]));
    onChange(next);
    setInput('');
    setOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const removeTag = (t: string) => onChange(value.filter((x) => x !== t));

  // 处理键盘事件
  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && value.length) {
      e.preventDefault();
      removeTag(value[value.length - 1]!);
    }
  };

  // 过滤重复选项，包括已选标签
  const filteredOptions = useMemo(
    () =>
      options.filter((opt) => opt.toLowerCase().includes(input.toLowerCase())).filter((opt) => !value.includes(opt)),
    [options, input, value]
  );

  // 点击组件外部时关闭下拉
  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, []);

  return (
    <div className="relative" ref={boxRef}>
      <div
        className="flex flex-wrap items-center gap-2 border-2 rounded-lg px-3 py-2.5 min-h-12 cursor-text focus-within:ring-2 border-gray-300 hover:border-gray-400 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all bg-white shadow-sm"
        onClick={() => {
          setOpen(true);
          inputRef.current?.focus();
        }}
      >
        {value.map((t) => (
          <span
            key={t}
            className="group inline-flex items-center gap-1.5 bg-linear-to-r from-blue-100 to-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full hover:from-blue-200 hover:to-blue-100 transition-all shadow-sm"
          >
            {t}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(t);
              }}
              className="text-blue-500 hover:text-red-500 focus:outline-none cursor-pointer"
              aria-label={`移除 ${t}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOpen(true);
          }}
          onKeyDown={handleKey}
          placeholder={value.length ? '' : placeholder || '输入或选择标签，Enter 确认'}
          className="flex-1 min-w-[140px] border-none focus:outline-none text-sm py-1 px-1 bg-transparent"
        />
      </div>
      {open && (
        <ul className="absolute z-10 mt-1 max-h-48 overflow-auto w-full bg-white border border-blue-500 rounded shadow-sm text-sm divide-y">
          {filteredOptions.length === 0 && input && (
            <li>
              <button
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-blue-50 cursor-pointer text-[#444]"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addTag(input);
                }}
              >
                使用新标签：{input}
              </button>
            </li>
          )}
          {filteredOptions.map((opt) => (
            <li key={opt} className="border-gray-300">
              <button
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center justify-between cursor-pointer text-[#666]"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addTag(opt);
                }}
              >
                <span>{opt}</span>
                {value.includes(opt) && <span className="text-xs text-blue-600">已选</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
