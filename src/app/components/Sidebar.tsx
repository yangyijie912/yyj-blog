'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AiFillHome } from 'react-icons/ai';
import { BiBook } from 'react-icons/bi';
import { RiProjectorLine } from 'react-icons/ri';
import { IoPersonCircleSharp } from 'react-icons/io5';
import { HiOutlineMenu, HiX } from 'react-icons/hi';
import { type ElementType } from 'react';
import classnames from 'classnames';

interface NavItem {
  href: string;
  labelKey: string;
  icon: ElementType;
  extraKey: string;
}

const navItems: NavItem[] = [
  { href: '/', labelKey: 'nav.home.label', icon: AiFillHome, extraKey: 'nav.home.extra' },
  { href: '/blog', labelKey: 'nav.blog.label', icon: BiBook, extraKey: 'nav.blog.extra' },
  { href: '/project', labelKey: 'nav.project.label', icon: RiProjectorLine, extraKey: 'nav.project.extra' },
  { href: '/about', labelKey: 'nav.about.label', icon: IoPersonCircleSharp, extraKey: 'nav.about.extra' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations();

  const [open, setOpen] = useState(false);

  // 如果是当前导航项，则返回true，用来控制样式和显示额外信息
  const isActive = (path: string) => {
    if (!pathname) return false;
    if (path === '/') return pathname === '/';
    if (path === '/blog') return pathname === '/blog' || pathname.startsWith('/blog/');
    return pathname === path;
  };

  // 在 blogManage 路由下不显示 Sidebar（PC端和移动端都不显示）
  const isBlogManagePath =
    pathname?.includes('/blog-list') ||
    pathname?.includes('/categories') ||
    pathname?.includes('/dashboard') ||
    pathname?.includes('/login') ||
    pathname?.includes('/project-list') ||
    pathname?.includes('/projects') ||
    pathname?.includes('/users') ||
    pathname?.includes('/writing');

  if (isBlogManagePath) {
    return null;
  }

  return (
    <>
      {/* 移动端菜单按钮（仅在小屏显示） */}
      <button
        aria-label={t('sidebar.toggle.open')}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded bg-white/6 text-white backdrop-blur"
        onClick={() => setOpen(true)}
      >
        <HiOutlineMenu className="w-6 h-6" />
      </button>

      {/* overlay（仅在抽屉打开时显示） */}
      {open && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setOpen(false)} aria-hidden />}

      <aside
        className={classnames(
          'sidebar fixed left-0 top-0 bottom-0 bg-linear-to-b from-[#071129] to-[#0b1220] text-white flex flex-col justify-center items-stretch p-6 transition-transform transform',
          {
            '-translate-x-full': !open,
            'translate-x-0': open,
          },
          'sm:translate-x-0 z-50 w-(--sidebar-width)'
        )}
        aria-label={t('sidebar.aria.label')}
      >
        {/* 小屏关闭按钮 */}
        <div className="flex items-center justify-between md:hidden mb-3">
          <h2 className="text-lg font-semibold">{t('sidebar.toggle.title')}</h2>
          <button aria-label={t('sidebar.toggle.close')} className="p-2" onClick={() => setOpen(false)}>
            <HiX className="w-6 h-6 text-white" />
          </button>
        </div>
        <div className="flex flex-col gap-14">
          <div className="text-center intro">
            <h1 className="text-4xl m-0 mb-8 tracking-wider max-sm:text-xl">YYJ</h1>

            <div className="flex items-center justify-center my-4" aria-hidden>
              <Image
                src="/profile.jpg"
                alt="yyj"
                width={200}
                height={200}
                className="w-[200px] h-[200px] object-cover rounded-full block"
                priority
              />
            </div>

            <div className="mt-8 text-lg leading-8 text-white/95 intro-desc">
              <p>{t('sidebar.intro.line1')}</p>
              <p>{t('sidebar.intro.line2')}</p>
              <p>{t('sidebar.intro.line3')}</p>
              <p>{t('sidebar.intro.line4')}</p>
              <p>{t('sidebar.intro.line5')}</p>
              <p>{t('sidebar.intro.line6')}</p>
            </div>
          </div>

          <div className="h-0.5 bg-[#FFD700]/50" />

          <div>
            <nav aria-label="主导航">
              <ul className="list-none m-0 p-0 flex flex-col gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={classnames(
                          'flex items-center gap-3.5 text-white/95 no-underline px-3.5 py-2.5 rounded-[10px] text-xl font-semibold hover:bg-white/4 transition-colors',
                          {
                            'bg-linear-to-r from-white/6 to-white/2 shadow-[inset_4px_0_0_0_#60a5fa]': active,
                          }
                        )}
                        onClick={() => setOpen(false)}
                      >
                        <Icon className="text-[1.35rem] text-slate-300 inline-flex items-center" />
                        <span className="inline-flex items-center">{t(item.labelKey)}</span>
                        <span
                          className={classnames(
                            'ml-auto inline-flex items-center text-white/70 text-sm self-end max-sm:hidden',
                            {
                              'opacity-100 animate-[navExtraIn_320ms_cubic-bezier(.2,.9,.2,1)_both]': active,
                              'opacity-0': !active,
                            }
                          )}
                        >
                          {t(item.extraKey)}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
}
