import Link from 'next/link';
import { FaExternalLinkAlt, FaAlignRight } from 'react-icons/fa';
import { getTranslations } from 'next-intl/server';

// 精简版项目类型，仅包含组件实际使用字段
interface FeaturedProject {
  id: string;
  name: string;
  description?: string | null;
  tags?: string[]; // Prisma 中为 JsonValue，这里只用到 string[]
  url?: string | null;
  linkName?: string | null;
}

const sampleProjects: FeaturedProject[] = [
  {
    id: '1',
    name: '内容平台 SSR/SSG 一体化改造',
    description: '以 Next.js 构建内容平台，动态路由 + 增量静态化，结合缓存与边缘渲染提升首屏与 SEO。',
    tags: ['Next.js', 'React', 'TypeScript', 'Edge Runtime', 'SEO'],
  },
  {
    id: '2',
    name: '组件库工程化与规范落地',
    description: '从零搭建组件库，Storybook 驱动、单元测试与语义化发布，配合 CI 提升交付质量。',
    tags: ['TypeScript', 'Storybook', 'Vitest', 'ESLint', 'CI'],
  },
  {
    id: '3',
    name: '前端性能治理与指标体系',
    description: '建立性能指标看板，面向 LCP/CLS/TTI 进行优化与追踪，形成可复用优化手册。',
    tags: ['Performance', 'Lighthouse', 'Web Vitals', '监控'],
  },
];

export default async function FeaturedProjects({ projects = sampleProjects }: { projects?: FeaturedProject[] }) {
  const t = await getTranslations();
  return (
    <section className="w-full bg-[#0B1220] text-slate-100">
      <div className="px-6 md:px-10 lg:px-14 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-semibold flex items-center gap-2">
          <span className="inline-block w-2 h-6 bg-cyan-400 rounded-sm" />
          {t('featured.title')}
        </h2>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {projects.map((p: FeaturedProject) => (
            <div
              key={p.id}
              className="group relative rounded-xl border border-slate-800/80 bg-slate-900/60 hover:border-cyan-400/50 transition overflow-hidden"
            >
              <div className="absolute inset-0 bg-linear-to-br from-cyan-400/5 via-transparent to-emerald-400/5 opacity-0 group-hover:opacity-100 transition" />
              <div className="relative p-5 flex flex-col h-full">
                <h3 className="text-lg font-semibold group-hover:text-cyan-300 transition">{p.name}</h3>
                <p title={p.description || undefined} className="mt-2 text-sm text-slate-300/90 line-clamp-3">
                  {p.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(Array.isArray(p.tags) ? p.tags : []).map((t: string) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 text-xs rounded-full bg-slate-800/80 border border-slate-700/60"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
                <div className="mt-5 flex gap-3">
                  <Link
                    href={`/project/${p.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-700/60 text-xs hover:border-emerald-400/60 hover:text-emerald-200 transition"
                  >
                    <FaAlignRight /> {t('featured.detail')}
                  </Link>
                  {p.url && (
                    <Link
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-700/60 text-xs hover:border-emerald-400/60 hover:text-emerald-200 transition"
                    >
                      <FaExternalLinkAlt /> {p.linkName || t('featured.link')}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
