'use client';
import MatrixRain from '@/app/components/MatrixRain';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Hero() {
  const t = useTranslations();
  return (
    <section className="relative w-full min-h-[56vh] md:min-h-[64vh] overflow-hidden text-slate-200">
      {/* 背景动画 */}
      <MatrixRain className="opacity-70" />
      <div className="absolute inset-0 bg-linear-to-b from-slate-900 via-slate-900/80 to-slate-950" />

      {/* Content */}
      <div className="relative z-10 px-6 md:px-10 lg:px-14 py-16 md:py-24">
        <p className="text-emerald-300/90 text-sm md:text-base tracking-widest uppercase">
          Frontend · Next.js · TypeScript
        </p>
        <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight bg-linear-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
          {t('hero.title')}
        </h1>
        <p className="mt-4 max-w-3xl text-slate-300/90 text-base md:text-lg">{t('hero.desc')}</p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/project"
            className="relative px-5 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 backdrop-blur text-slate-100 text-sm font-medium overflow-hidden group hover:border-emerald-400/70 transition"
          >
            <span className="absolute inset-0 bg-linear-to-r from-emerald-400/0 via-emerald-400/10 to-cyan-400/0 translate-x-[-60%] group-hover:translate-x-[40%] transition-transform duration-700" />
            <span className="relative inline-flex items-center gap-2">
              {t('hero.viewProjects')}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="size-4 opacity-80"
              >
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </span>
          </Link>
          <Link
            href="/blog"
            className="px-5 py-2.5 rounded-lg border border-slate-700/60 text-slate-100 text-sm font-medium hover:border-cyan-400/60 hover:text-cyan-200 transition"
          >
            {t('hero.readBlog')}
          </Link>
        </div>
      </div>
    </section>
  );
}
