# 🔴 REBUILD.md — 项目完全重建手册

> **用途**：项目被摧毁后，从头恢复到当前状态的全部信息。
> **维护者**：WorkBuddy AI
> **备份日期**：2026-06-19 16:30
> **原则**：本文件不含密码/Token（需从用户处获取），但含所有结构信息。

---

## 一、项目身份

| 项目名 | 值 |
|--------|-----|
| 项目名称 | 产研通 ProLink（产业专家对接平台） |
| GitHub 仓库 | `git@github.com:michaelwang188/expert-network.git` |
| HTTPS 地址 | `https://github.com/michaelwang188/expert-network` |
| 主分支 | `main` |
| 本地路径 | `/Users/michaelwang188/WorkBuddy/2026-06-19-11-15-05/expert-network/` |

---

## 二、技术栈（不可变更）

| 层面 | 技术 | 版本 |
|------|------|------|
| 框架 | Next.js (App Router) | 15.5.19 |
| 语言 | TypeScript | 5.x |
| 数据库 ORM | Prisma | 6.19.3 |
| 数据库 | PostgreSQL（Neon Serverless） | — |
| 认证 | NextAuth.js v4（Credentials Provider） | 4.24.0 |
| 密码哈希 | bcryptjs | 2.4.3 |
| CSS | Tailwind CSS | 3.4.19 |
| Node.js | v22.22.3 (nvm) | 22.x |
| 包管理 | npm | 10.9.8 |

---

## 三、部署平台

| 项目 | 值 |
|------|-----|
| 平台 | Vercel |
| 项目名 | `michael-expert/expert-network` |
| Project ID | `prj_hRHGvu2WWhUiNCdsh00Yx4Wwz5Ii` |
| 生产 URL | `https://expert-network-sooty.vercel.app` |
| 别名域名 | `expert-network-sooty.vercel.app` |
| Build Command | `npx prisma generate && npx prisma db push && npm run build` |
| Framework | `nextjs` |
| Node Version | `24.x` (Vercel default) |
| Vercel Token | 需用户提供 `vcp_...` |
| Vercel 账号 | `michaelwang189`（GitHub 登录） |

---

## 四、数据库

| 项目 | 值 |
|------|-----|
| 提供商 | Neon Serverless PostgreSQL |
| Neon 资源名 | `neon-copper-fountain` |
| Database Name | `neondb` |
| Schema | `public` |
| Region | `aws-us-east-1` |
| Host (pooler) | `ep-gentle-tree-at88yrab-pooler.c-9.us-east-1.aws.neon.tech` |
| Host (unpooled) | `ep-gentle-tree-at88yrab.c-9.us-east-1.aws.neon.tech` |
| Neon Project ID | 在 Vercel env 中（`NEON_PROJECT_ID`） |
| Connection string 格式 | `postgresql://neondb_owner:<PASSWORD>@ep-gentle-tree-at88yrab-pooler.c-9.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require` |

---

## 五、环境变量清单

| Key | 来源 | 说明 |
|-----|------|------|
| `DATABASE_URL` | Vercel → Neon 自动注入 | Pooled 连接（Serverless 用） |
| `DATABASE_URL_UNPOOLED` | Vercel → Neon 自动注入 | 直连（本地 CLI 用） |
| `NEXTAUTH_SECRET` | 手动设置 | 需用户提供 |
| `POSTGRES_URL` | Vercel → Neon 自动注入 | — |
| `POSTGRES_PRISMA_URL` | Vercel → Neon 自动注入 | Prisma 专用 |
| `POSTGRES_URL_NON_POOLING` | Vercel → Neon 自动注入 | — |
| `PGHOST` / `PGUSER` / `PGPASSWORD` / `PGDATABASE` | Vercel → Neon 自动注入 | — |

> 以上环境变量已在 Vercel `production`, `preview`, `development` 三个环境全部配置。

---

## 六、Prisma Schema（核心模型）

```
generator client → prisma-client-js
datasource db → provider: postgresql, url: env(DATABASE_URL)

模型（6张表）：
1. User        — 用户（RESEARCHER / EXPERT / ADMIN）
2. Expert      — 专家档案（1:1 User）
3. Request     — 调研需求
4. Order       — 订单（1:1 Request）
5. ComplianceLog — 合规记录
6. Account/Session/VerificationToken — NextAuth 自动管理

完整 Schema 见本备份目录 prisma/schema.prisma
```

---

## 七、API 路由

| 路由 | 方法 | 功能 |
|------|------|------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth 认证 |
| `/api/register` | POST | 用户注册 |
| `/api/experts` | GET/POST | 专家列表/创建 |
| `/api/orders` | GET/POST | 订单列表/创建 |
| `/api/requests` | GET/POST | 需求列表/创建 |

---

## 八、前端页面

| 路由 | 功能 |
|------|------|
| `/` | 首页 |
| `/login` | 登录 |
| `/register` | 注册 |
| `/dashboard` | 研究员仪表盘 |
| `/experts` | 专家检索 |
| `/experts/[id]` | 专家详情 |
| `/orders` | 订单管理 |
| `/compliance` | 合规管理 |
| `/admin` | 管理员后台 |
| `/request` | 发布需求 |

---

## 九、测试账号（生产数据库）

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 研究员 | researcher@demo.com | 123456 |
| 专家 | expert@demo.com | 123456 |
| 管理员 | admin@demo.com | 123456 |

---

## 十、Git 提交历史（最新 10 条）

从 `git-log.txt` 恢复。

---

## 十一、SSH 配置

- Key 路径：`~/.ssh/id_ed25519`
- 密钥类型：ed25519
- 关联邮箱：wangmich188@gmail.com
- 公钥：见 `ssh-public-key.txt`

---

## 十二、重建步骤

### 如果 GitHub 还在，本地全毁：

```bash
git clone git@github.com:michaelwang188/expert-network.git
cd expert-network
npm install
# 从 Vercel 拉生产环境变量
vercel env pull --environment production
# 重新生成 Prisma Client
npx prisma generate
# 启动开发服务器
npm run dev
```

### 如果 GitHub 也没了（本地有备份）：

```bash
# 1. 从备份目录恢复
cp -r .backups/2026-06-19-full/* /新项目目录/
# 2. 初始化 git
git init && git add -A && git commit -m "Restore from backup 2026-06-19"
# 3. 创建 GitHub 仓库并推送
git remote add origin git@github.com:michaelwang188/expert-network.git
git push -u origin main --force
# 4. 在 Vercel 重新导入 GitHub 仓库
# 5. 在 Vercel 创建 Neon Postgres
# 6. vercel env pull → npm install → npx prisma db push → npm run dev
```

### 如果全部被毁（需完整重建）：

1. 创建 GitHub 仓库 `michaelwang188/expert-network`
2. 配置 SSH Key（见本备份 `ssh-public-key.txt`）
3. 将本备份目录初始化为 git repo 并推送
4. 在 Vercel.com 导入 GitHub 仓库
5. 项目名随意（`expert-network` 或新名），Framework: Next.js
6. Build Command：`npx prisma generate && npx prisma db push && npm run build`
7. 添加 NEXTAUTH_SECRET 环境变量
8. 在 Vercel Storage → Create Neon Postgres
9. 部署 → 自动注入 DATABASE_URL → 自动 db push
10. 部署成功后 `npx prisma db seed` 创建测试账号

---

## 十三、备份内容清单

本备份目录包含：

```
.backups/2026-06-19-full/
├── REBUILD.md              ← 本文件（重建手册）
├── src/                     ← 全部源代码
├── prisma/                  ← Schema + Seed
├── package.json             ← 依赖清单
├── package-lock.json        ← 精确版本锁定
├── tsconfig.json            ← TS 配置
├── next.config.js           ← Next.js 配置
├── tailwind.config.js       ← Tailwind 配置
├── postcss.config.js        ← PostCSS 配置
├── next-env.d.ts           ← Next.js 类型
├── .gitignore              ← Git 忽略规则
├── .claude/                ← Claude 权限配置
├── .vercel/                ← Vercel 项目链接
├── *.md                    ← 全部文档（REQUIREMENTS, AI_MESSAGE_BOARD 等）
├── git-log.txt             ← Git 提交历史
├── git-full-log.txt        ← Git 完整日志
├── vercel-state.txt        ← Vercel 项目状态
├── vercel-env-keys.txt     ← 环境变量清单
├── node-version.txt        ← Node/npm 版本
├── ssh-public-key.txt      ← SSH 公钥
└── .env.template           ← 环境变量模板（脱敏）
```

---

**我能负责重建吗？能。** 只要本备份目录存在，我可以从零恢复整个项目——包括代码、数据库结构、部署配置、文档。唯一需要用户提供的是敏感凭证（Vercel Token、NEXTAUTH_SECRET、Neon Password）。
