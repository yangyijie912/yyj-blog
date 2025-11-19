import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/db';
import UserManager from './UserManager';

interface PageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    pageSize?: string;
    sortBy?: string;
  }>;
}

export default async function UsersPage({ searchParams }: PageProps) {
  await requireAdmin();

  const params = await searchParams;
  const q = (params?.q ?? '').trim();
  const page = Math.max(1, parseInt(params?.page ?? '1', 10) || 1);
  const pageSize = Math.min(50, Math.max(5, parseInt(params?.pageSize ?? '10', 10) || 10));
  const sortBy = params?.sortBy ?? 'createdAt-desc';

  const where = q
    ? {
        OR: [{ username: { contains: q } }, { email: { contains: q } }],
      }
    : undefined;

  const total = await prisma.user.count({ where });

  const [sortField, sortOrder] = sortBy.split('-');
  const orderBy =
    sortField === 'updatedAt'
      ? { updatedAt: (sortOrder || 'desc') as 'asc' | 'desc' }
      : { createdAt: (sortOrder || 'desc') as 'asc' | 'desc' };

  const usersData = await prisma.user.findMany({
    where,
    orderBy,
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return (
    <div className="users-page">
      <UserManager users={usersData} total={total} page={page} pageSize={pageSize} q={q} sortBy={sortBy} />
    </div>
  );
}
