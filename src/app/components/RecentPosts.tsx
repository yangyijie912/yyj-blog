import Link from 'next/link';
import { prisma } from '@/db';
import { getTranslations } from 'next-intl/server';

export default async function RecentPostsDB({
  take = 6,
  showAllLink = true,
}: {
  take?: number;
  showAllLink?: boolean;
}) {
  const t = await getTranslations();
  const posts = await prisma.post.findMany({
    orderBy: [{ featured: 'desc' }, { updatedAt: 'desc' }],
    select: { id: true, title: true, intro: true, createdAt: true, updatedAt: true, tags: true },
    take,
  });

  return (
    <section className="w-full bg-slate-950 text-slate-100">
      <div className="px-6 md:px-10 lg:px-14 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-semibold flex items-center gap-2">
          <span className="inline-block w-2 h-6 bg-emerald-400 rounded-sm" />
          {t('recentPosts.title')}
        </h2>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {posts.map((p: { id: string; title: string; intro: string | null; createdAt: Date; tags: unknown }) => (
            <Link
              key={p.id}
              href={`/blog/${p.id}`}
              className="group relative rounded-xl border border-slate-800/80 bg-slate-900/60 hover:border-emerald-500/50 transition overflow-hidden"
            >
              <div className="absolute inset-0 bg-linear-to-br from-emerald-400/5 via-transparent to-cyan-400/5 opacity-0 group-hover:opacity-100 transition" />
              <div className="relative p-5">
                <div className="text-xs text-slate-400">
                  {new Intl.DateTimeFormat('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  }).format(new Date(p.createdAt))}
                </div>
                <h3 className="mt-2 text-lg font-semibold group-hover:text-emerald-300 transition line-clamp-1">
                  {p.title}
                </h3>
                {p.intro && <p className="mt-2 text-sm text-slate-300/90 line-clamp-2">{p.intro}</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                  {Array.isArray(p.tags) &&
                    (p.tags as string[]).map((t: string) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 text-xs rounded-full bg-slate-800/80 border border-slate-700/60"
                      >
                        #{t}
                      </span>
                    ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {showAllLink && (
          <div className="mt-8 flex justify-center">
            <Link
              href="/blog"
              className="px-5 py-2.5 rounded-lg border border-slate-700/60 text-slate-100 text-sm font-medium hover:border-cyan-400/60 hover:text-cyan-200 transition"
            >
              {t('recentPosts.viewAll')}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
