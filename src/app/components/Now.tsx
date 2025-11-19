import { getTranslations } from 'next-intl/server';

export default async function Now() {
  const t = await getTranslations();
  const items: { title: string; details: string }[] = [
    { title: 'Next 深入学习', details: '系统学习 Next.js 16+ 新特性与最佳实践，撰写系列文章' },
    { title: 'LLM 研究', details: '探索大语言模型在前端开发中的应用与实践' },
    { title: '工程化与 DX', details: '提升前端工程化水平，优化开发者体验' },
  ];

  return (
    <section className="w-full bg-slate-950 text-slate-100">
      <div className="px-6 md:px-10 lg:px-14 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-semibold flex items-center gap-2">
          <span className="inline-block w-2 h-6 bg-emerald-400 rounded-sm" />
          {t('now.title.whatIAmDoing')}
        </h2>
        <ul className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((it) => (
            <li
              key={it.title}
              className="group relative rounded-xl border border-slate-800/80 bg-slate-900/60 hover:border-emerald-500/50 transition overflow-hidden p-5"
            >
              <div className="absolute inset-0 bg-linear-to-br from-emerald-400/5 via-transparent to-cyan-400/5 opacity-0 group-hover:opacity-100 transition" />
              <div className="relative">
                <h3 className="text-lg font-semibold group-hover:text-emerald-300 transition">{it.title}</h3>
                <p className="mt-2 text-sm text-slate-300/90">{it.details}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
