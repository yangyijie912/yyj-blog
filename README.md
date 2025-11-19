## 开始

### 本地开发环境设置

#### 1. 启动数据库 (PostgreSQL)

**使用 Docker:**

```bash
npm run db:start
```

**或手动安装 PostgreSQL:**

- 安装 PostgreSQL 16+
- 创建数据库: `CREATE DATABASE yyj_blog;`
- 更新 `.env` 中的 `DATABASE_URL`

#### 2. 运行数据库迁移

```bash
npm run db:migrate
```

#### 3. 初始化数据 (可选)

```bash
npm run db:seed
```

#### 4. 启动开发服务器

```bash
npm run dev
```

访问: http://localhost:3000

### 数据库管理命令

```bash
npm run db:start   # 启动 PostgreSQL (Docker)
npm run db:stop    # 停止 PostgreSQL
npm run db:migrate # 运行数据库迁移
npm run db:seed    # 初始化测试数据
npm run db:studio  # 打开 Prisma Studio
```

### 构建和生产

```bash
npm run build && npm start
```

### 2. 环境变量配置

在 Vercel 项目设置中添加以下环境变量：

```bash
# 数据库连接 (必需)
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
```

### 3. 初始化用户

部署后运行初始化脚本创建管理员账户：

```bash
node scripts/init-production.mjs
```

## 介绍

我的个人博客
