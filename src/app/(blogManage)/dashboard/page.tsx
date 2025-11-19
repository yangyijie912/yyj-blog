import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/db';
import { BiBook } from 'react-icons/bi';
import { RiProjectorLine } from 'react-icons/ri';
import { AiOutlineTags } from 'react-icons/ai';
import { FiList, FiLogOut, FiUsers } from 'react-icons/fi';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const authUser = await requireAuth();
  const t = await getTranslations();

  const [postCount, categoryCount, projectCount] = await Promise.all([
    prisma.post.count(),
    prisma.category.count(),
    prisma.project.count(),
  ]);

  return (
    <div className="dashboard-page">
      {/* 顶部栏 */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200/70 bg-white/85 backdrop-blur supports-backdrop-filter:bg-white/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-slate-900 to-slate-700 text-white flex items-center justify-center font-bold">
            BM
          </div>
          <div>
            <h1 className="m-0 text-xl font-semibold text-slate-900">{t('dashboard.title')}</h1>
            <p className="m-0 text-xs text-slate-500">{t('dashboard.subtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/login/logout"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <FiLogOut className="text-base" />
            {t('dashboard.logout')}
          </Link>
        </div>
      </header>

      {/* 内容区域 */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-auto px-6 py-6">
          {/* 统计卡片 */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatCard label={t('dashboard.stat.posts.label')} value={postCount} hint={t('dashboard.stat.posts.hint')} />
            <StatCard
              label={t('dashboard.stat.categories.label')}
              value={categoryCount}
              hint={t('dashboard.stat.categories.hint')}
            />
            <StatCard
              label={t('dashboard.stat.projects.label')}
              value={projectCount}
              hint={t('dashboard.stat.projects.hint')}
            />
          </section>

          {/* 管理入口 */}
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            <NavCard
              href="/"
              title={t('dashboard.card.home.title')}
              desc={t('dashboard.card.home.desc')}
              icon={<BiBook className="text-2xl" />}
              action={t('dashboard.card.home.action')}
              accent="from-cyan-500 to-fuchsia-600"
            />
            <NavCard
              href="/writing"
              title={t('dashboard.card.write.title')}
              desc={t('dashboard.card.write.desc')}
              icon={<BiBook className="text-2xl" />}
              action={t('dashboard.card.write.action')}
              accent="from-blue-500 to-indigo-600"
            />
            <NavCard
              href="/projects"
              title={t('dashboard.card.projects.title')}
              desc={t('dashboard.card.projects.desc')}
              icon={<RiProjectorLine className="text-2xl" />}
              action={t('dashboard.card.projects.action')}
              accent="from-amber-500 to-orange-600"
            />
            <NavCard
              href="/blog-list"
              title={t('dashboard.card.blogList.title')}
              desc={t('dashboard.card.blogList.desc')}
              icon={<FiList className="text-2xl" />}
              action={t('dashboard.card.blogList.action')}
              accent="from-purple-500 to-violet-600"
            />
            <NavCard
              href="/project-list"
              title={t('dashboard.card.projectList.title')}
              desc={t('dashboard.card.projectList.desc')}
              icon={<FiList className="text-2xl" />}
              action={t('dashboard.card.projectList.action')}
              accent="from-fuchsia-500 to-pink-600"
            />
            <NavCard
              href="/categories"
              title={t('dashboard.card.categories.title')}
              desc={t('dashboard.card.categories.desc')}
              icon={<AiOutlineTags className="text-2xl" />}
              action={t('dashboard.card.categories.action')}
              accent="from-emerald-500 to-teal-600"
            />
            {authUser.role === 'admin' && (
              <NavCard
                href="/users"
                title={t('dashboard.card.users.title')}
                desc={t('dashboard.card.users.desc')}
                icon={<FiUsers className="text-2xl" />}
                action={t('dashboard.card.users.action')}
                accent="from-rose-500 to-red-600"
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="m-0 text-sm text-slate-500">{label}</p>
      <p className="m-0 mt-2 text-3xl font-bold text-slate-900">{value}</p>
      {hint ? <p className="m-0 mt-1 text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}

function NavCard({
  href,
  title,
  desc,
  icon,
  action,
  accent = 'from-slate-600 to-slate-900',
}: {
  href: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  action: string;
  accent?: string;
}) {
  return (
    <Link
      href={href}
      className="group relative block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm overflow-hidden focus:outline-none focus:ring-2 focus:ring-slate-400/50"
    >
      <div
        className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-linear-to-br ${accent} opacity-10 group-hover:opacity-20 transition-opacity`}
      />
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-slate-900/90 text-white flex items-center justify-center shadow-sm">
          {icon}
        </div>
        <div>
          <h3 className="m-0 text-base font-semibold text-slate-900">{title}</h3>
          <p className="m-0 mt-1 text-sm text-slate-600">{desc}</p>
        </div>
      </div>
      <div className="mt-4 text-sm font-medium text-slate-700 group-hover:text-slate-900">{action} →</div>
    </Link>
  );
}
