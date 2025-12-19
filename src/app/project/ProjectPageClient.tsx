'use client';
import React, { useState, useRef, useEffect } from 'react';
import { FaExternalLinkAlt, FaAlignRight } from 'react-icons/fa';
import { MdViewList } from 'react-icons/md';
import { getIconComponent, DefaultIcon } from '@/lib/icon';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import classnames from 'classnames';

type Project = {
  id: string;
  name: string;
  description: string | null;
  url: string | null;
  linkName: string | null;
  tags: string[];
  featured: boolean;
};

type Category = {
  id: string;
  name: string;
  icon: string | null;
  order: number;
  projects: Project[];
};

// 使用共享的图标解析器：按保存的图标名解析组件

// 项目卡片组件
const ProjectCard = ({ project }: { project: Project }) => {
  const t = useTranslations();
  return (
    <div className="group relative rounded-xl border border-slate-800/80 bg-slate-900/60 hover:border-cyan-400/50 transition overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-cyan-400/5 via-transparent to-emerald-400/5 opacity-0 group-hover:opacity-100 transition" />
      <div className="relative p-5 flex flex-col h-full">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold group-hover:text-cyan-300 transition">{project.name}</h3>
          {/* 精选标签，暂且隐藏 */}
          {/* {project.featured && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
              {t('project.featured')}
            </span>
          )} */}
        </div>
        {project.description && <p className="mt-2 text-sm text-slate-300/90 line-clamp-3">{project.description}</p>}
        {project.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {project.tags.map((tag, idx) => (
              <span key={idx} className="px-2 py-0.5 text-xs rounded-full bg-slate-800/80 border border-slate-700/60">
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="mt-5 flex gap-3">
          <Link
            href={`/project/${project.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-700/60 text-xs hover:border-emerald-400/60 hover:text-emerald-200 transition"
          >
            <FaAlignRight /> {t('project.detail')}
          </Link>
          {project.url && (
            <Link
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-700/60 text-xs hover:border-emerald-400/60 hover:text-emerald-200 transition"
            >
              <FaExternalLinkAlt /> {project.linkName || t('project.link')}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ProjectPageClient({ categories }: { categories: Category[] }) {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<string>('all');
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const scrollToSection = (categoryId: string) => {
    if (categoryId === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const section = sectionRefs.current[categoryId];
      if (section) {
        const offset = 100;
        const top = section.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
    setActiveTab(categoryId);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;

      for (const cat of categories) {
        const section = sectionRefs.current[cat.id];
        if (section) {
          const rect = section.getBoundingClientRect();
          const sectionTop = rect.top + window.scrollY;
          const sectionBottom = sectionTop + rect.height;

          if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            setActiveTab(cat.id);
            return;
          }
        }
      }

      if (scrollPosition < 300) {
        setActiveTab('all');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [categories]);

  const totalProjects = categories.reduce((sum, cat) => sum + cat.projects.length, 0);

  return (
    <div className="w-full min-h-[60vh] bg-[#0B1220] text-slate-100 pt-6 sm:pt-0">
      <div className="px-6 md:px-10 lg:px-14 py-12 md:py-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 flex items-center gap-3">
            <span className="inline-block w-2 h-8 bg-cyan-400 rounded-sm" />
            <span>{t('project.page.title')}</span>
          </h1>
          <p className="text-slate-300/90 md:text-lg max-w-3xl font-mono text-sm">
            <span className="text-emerald-400">&gt;</span> {t('project.page.subtitle', { count: totalProjects })}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-12 sticky top-0 z-20 bg-[#0B1220]/95 backdrop-blur-sm py-4 -mx-6 px-6 md:-mx-10 md:px-10 lg:-mx-14 lg:px-14">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            <button
              onClick={() => scrollToSection('all')}
              className={classnames(
                'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition flex items-center gap-2',
                {
                  'bg-cyan-400/20 text-cyan-300 border border-cyan-400/50': activeTab === 'all',
                  'bg-slate-800/60 text-slate-300 border border-slate-700/60 hover:border-slate-600':
                    activeTab !== 'all',
                }
              )}
            >
              <MdViewList className="text-base" /> {t('project.all.label')}
            </button>
            {categories.map((cat: Category) => {
              const Icon = getIconComponent(cat.icon) || DefaultIcon;
              return (
                <button
                  key={cat.id}
                  onClick={() => scrollToSection(cat.id)}
                  className={classnames(
                    'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition flex items-center gap-2',
                    {
                      'bg-cyan-400/20 text-cyan-300 border border-cyan-400/50': activeTab === cat.id,
                      'bg-slate-800/60 text-slate-300 border border-slate-700/60 hover:border-slate-600':
                        activeTab !== cat.id,
                    }
                  )}
                >
                  <Icon className="text-base" /> {cat.name} ({cat.projects.length})
                </button>
              );
            })}
          </div>
        </div>

        {/* Projects by Category */}
        {categories.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-lg">{t('project.empty')}</p>
          </div>
        ) : (
          <div className="space-y-16">
            {categories.map((cat: Category) => {
              const Icon = getIconComponent(cat.icon) || DefaultIcon;

              if (cat.projects.length === 0) return null;

              return (
                <section
                  key={cat.id}
                  ref={(el) => {
                    sectionRefs.current[cat.id] = el;
                  }}
                >
                  <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 border-b border-slate-800/60 pb-3">
                    <Icon className="text-2xl" />
                    <span className="font-mono">{cat.name}</span>
                    <span className="ml-auto text-sm text-slate-500 font-normal">
                      {t('project.count', { count: cat.projects.length })}
                    </span>
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {cat.projects.map((project: Project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
