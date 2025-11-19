'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

const Footer = () => {
  const pathname = usePathname();
  // 在 blogManage 路由下不显示 Footer
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
  return <footer className="footer">© {new Date().getFullYear()} yyj • All rights reserved</footer>;
};

export default Footer;
