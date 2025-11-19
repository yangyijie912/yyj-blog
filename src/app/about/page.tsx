'use client';

import Image from 'next/image';
import React from 'react';
import MatrixRain from '@/app/components/MatrixRain';
import Link from 'next/link';
import { emit as showToast } from '@/lib/toastBus';
import { useTranslations } from 'next-intl';

const badges = ['React', 'Next.js', 'TypeScript', 'Node.js', 'Vue', 'CSS', 'Perf', 'Engineering'];

export default function About() {
  const t = useTranslations();
  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast({ message: t('about.contact.copySuccess'), type: 'success' });
    } catch {
      // ignore clipboard errors silently
    }
  };
  return (
    <div className="relative min-h-screen isolate">
      {/* 背景动画 */}
      <MatrixRain className="opacity-70" />
      <div className="absolute inset-0 bg-linear-to-b from-slate-900 via-slate-900/80 to-slate-950" />
      {/* Content */}
      <section className="relative w-full px-6 md:px-8 lg:px-12 py-20 text-slate-200">
        {/* Hero */}
        <div className="text-center flex flex-col items-center">
          <div className="relative group">
            <Image
              src="/profile.jpg"
              alt="Profile"
              width={128}
              height={128}
              className="rounded-full shadow-[0_0_0_4px_rgba(255,255,255,0.12)] ring-2 ring-emerald-500/40 group-hover:ring-emerald-400/70 transition-all duration-300"
              priority
            />
            <div className="absolute -inset-1 rounded-full bg-emerald-500/10 blur-xl opacity-0 group-hover:opacity-100 transition" />
          </div>
          <h1 className="mt-8 text-4xl font-bold tracking-tight bg-linear-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            {t('about.hero.title')}
          </h1>
          <p className="mt-4 text-lg text-slate-300/90">{t('about.hero.subtitle')}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 max-w-xl">
            {badges.map((b) => (
              <span
                key={b}
                className="px-4 py-1 rounded-full text-sm bg-slate-800/80 backdrop-blur border border-slate-700/60 hover:border-emerald-500/70 hover:text-emerald-300 transition-colors cursor-default select-none shadow-sm"
              >
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* About me */}
        <div className="mt-20 space-y-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <span className="inline-block w-2 h-6 bg-emerald-400 rounded-sm animate-pulse" />
            {t('about.aboutMe.title')}
          </h2>
          <p className="leading-relaxed text-[1.05rem] text-slate-300/90">{t('about.aboutMe.body')}</p>
        </div>

        {/* Tech stack */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <span className="inline-block w-2 h-6 bg-cyan-400 rounded-sm" />
            {t('about.stack.title')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="group p-4 rounded-xl bg-slate-800/70 backdrop-blur border border-slate-700/60 hover:border-emerald-400/60 transition relative overflow-hidden shadow-sm"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-linear-to-br from-emerald-400/10 via-transparent to-cyan-400/10 transition" />
                <span className="relative block text-sm text-slate-200 group-hover:text-emerald-200">
                  {t(`about.stack.items.${i + 1}`)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Philosophy */}
        <div className="mt-20 space-y-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <span className="inline-block w-2 h-6 bg-emerald-400 rounded-sm" />
            {t('about.philosophy.title')}
          </h2>
          <ul className="space-y-2 text-slate-300/90 text-[1.05rem]">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1 size-2 rounded-full bg-emerald-400/80 shadow" />
                {t(`about.philosophy.items.${i + 1}`)}
              </li>
            ))}
          </ul>
        </div>

        {/* Life */}
        <div className="mt-20 space-y-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <span className="inline-block w-2 h-6 bg-cyan-400 rounded-sm" />
            {t('about.life.title')}
          </h2>
          <p className="leading-relaxed text-[1.05rem] text-slate-300/90">{t('about.life.body')}</p>
        </div>

        {/* Why site */}
        <div className="mt-20 space-y-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <span className="inline-block w-2 h-6 bg-emerald-400 rounded-sm" />
            {t('about.why.title')}
          </h2>
          <ul className="space-y-2 text-slate-300/90 text-[1.05rem] list-disc list-inside">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i}>{t(`about.why.items.${i + 1}`)}</li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="mt-24 text-center">
          <h2 className="text-xl font-semibold mb-6 tracking-wide text-emerald-300">{t('about.contact.title')}</h2>
          <div className="flex justify-center gap-4 flex-wrap">
            {[
              { label: 'Email', href: 'mailto:yangyijie912@163.com' },
              { label: 'GitHub', href: 'https://github.com/yangyijie912' },
            ].map((a) => {
              const copyValue = a.label === 'Email' ? 'yangyijie912@163.com' : 'https://github.com/yangyijie912';
              return (
                <div key={a.label} className="relative group">
                  <Link
                    href={a.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative px-5 py-2 rounded-lg bg-slate-800/80 border border-slate-700/60 backdrop-blur text-slate-200 text-sm font-medium overflow-hidden group-hover:border-emerald-400/60 transition flex items-center gap-2"
                  >
                    <span className="absolute inset-0 bg-linear-to-r from-emerald-400/0 via-emerald-400/10 to-cyan-400/0 translate-x-[-60%] group-hover:translate-x-[40%] transition-transform duration-700" />
                    <span className="relative flex items-center gap-2">
                      {a.label}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        className="size-4 opacity-70 group-hover:opacity-100 group-hover:text-emerald-300 transition"
                      >
                        <path d="M5 12h14" />
                        <path d="M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </Link>

                  <button
                    onClick={() => copyText(copyValue)}
                    className="absolute -right-3 top-1/2 transform -translate-y-1/2 px-2 py-1 rounded bg-slate-800/80 text-xs opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200"
                    aria-label={`复制 ${a.label}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      className="w-4 h-4"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
          <p className="mt-8 text-xs text-slate-500">{t('about.contact.footer')}</p>
        </div>
      </section>
    </div>
  );
}
