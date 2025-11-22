import Hero from './components/Hero';
import RecentPosts from './components/RecentPosts';
import FeaturedProjects from './components/FeaturedProjects';
import Now from './components/Now';
import Skills from './components/Skills';
import { prisma } from '../db';

export default async function Home() {
  // 查询最新三个精选项目（featured = true），按创建时间倒序
  const featuredProjectsRaw = await prisma.project.findMany({
    where: { featured: true },
    orderBy: [{ featured: 'desc' }, { updatedAt: 'desc' }],
    take: 3,
  });

  // 将 Prisma 数据映射到 FeaturedProjects 组件期望的结构
  const featuredProjects = featuredProjectsRaw.map((p: (typeof featuredProjectsRaw)[0]) => {
    const tags = Array.isArray(p.tags) ? (p.tags as string[]) : [];
    return {
      id: p.id,
      name: p.name,
      description: p.description || '',
      tags,
      url: p.url || '',
      linkName: p.linkName || '',
    };
  });

  const skills = [
    { name: 'HTML5 & CSS3', value: 95, image: '/skill/html5css3.png' },
    { name: 'JavaScript', value: 90, image: '/skill/js.png' },
    { name: 'React', value: 85, image: '/skill/react.png' },
    { name: 'TypeScript', value: 88, image: '/skill/ts.png' },
    { name: 'Next', value: 75, image: '/skill/next.png' },
    { name: 'Vue.js', value: 60, image: '/skill/vue.png' },
    { name: 'Node.js', value: 80, image: '/skill/node.png' },
  ];

  return (
    <div>
      <Hero />
      <RecentPosts take={3} showAllLink={false} />
      <FeaturedProjects projects={featuredProjects} />
      <Now />
      <Skills skills={skills} />
    </div>
  );
}
