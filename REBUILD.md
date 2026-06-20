# 🔴 项目完全重建手册 v2.0

> 备份日期：2026-06-19 22:52
> 18 页面 + 9 API + 6 文档 + 3 轮审计闭环
> 维护者：WorkBuddy AI

---

## 一、项目身份

| 项目 | 值 |
|------|-----|
| 名称 | 产研通 ProLink（产业专家对接平台） |
| GitHub | `git@github.com:michaelwang188/expert-network.git` |
| Branch | `main` |
| 本地路径 | `<project-root>/` |

---

## 二、技术栈

| 层 | 技术 | 版本 |
|----|------|------|
| 框架 | Next.js 15 (App Router) | 15.5.19 |
| 语言 | TypeScript | 5.x |
| ORM | Prisma | 6.19.3 |
| 数据库 | Neon Serverless PostgreSQL | — |
| 认证 | NextAuth.js v4 (Credentials) | 4.24.0 |
| 密码 | bcryptjs | 2.4.3 |
| CSS | Tailwind CSS | 3.4.19 |
| Node | nvm v22.22.3 | 22.x |

---

## 三、部署平台

| 项目 | 值 |
|------|-----|
| 平台 | Vercel |
| 项目 | `michael-expert/expert-network` |
| Project ID | `prj_hRHGvu2WWhUiNCdsh00Yx4Wwz5Ii` |
| URL | `https://expert-network-sooty.vercel.app` |
| Build | `npx prisma generate && npx prisma db push && npm run build` |
| Framework | `nextjs` |
| Vercel Token | `vcp_...`（需用户提供） |

---

## 四、数据库

| 项目 | 值 |
|------|-----|
| 提供商 | Neon Serverless PostgreSQL |
| Database | `neondb` |
| Pooler Host | `ep-gentle-tree-at88yrab-pooler.c-9.us-east-1.aws.neon.tech` |
| Unpooled Host | `ep-gentle-tree-at88yrab.c-9.us-east-1.aws.neon.tech` |
| 连接格式 | `postgresql://neondb_owner:<PWD>@<HOST>/neondb?...` |

---

## 五、环境变量

| Key | 来源 |
|-----|------|
| `DATABASE_URL` | Vercel → Neon 自动注入（pooler） |
| `DATABASE_URL_UNPOOLED` | Vercel → Neon 自动注入（直连） |
| `NEXTAUTH_SECRET` | 手动设置 |
| `POSTGRES_*` 系列 | Vercel → Neon 自动注入 |

---

## 六、数据库模型（6 表 + 积分）

```
User (points, role) → Expert (ratePoints) → Request → Order (amount/expertFee/platformFee)
                                                   → PointsTransaction
                                                   → ComplianceLog
```

---

## 七、18 页面路由

`/ /login /register /dashboard /experts /experts/[id] /experts/edit /request /orders /profile /leaderboard /admin /admin/experts /admin/orders /admin/users /admin/review /admin/audit /compliance`

## 八、9 个 API

`/api/auth/[...nextauth] /api/register /api/experts /api/experts/me /api/orders /api/requests /api/points /api/users /api/compliance`

---

## 九、测试账号（14人）

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 研究员 | researcher@demo.com | 123456 |
| 专家 | expert@demo.com | 123456 |
| 管理员 | admin@demo.com | 123456 |
| 其他研究员 | liwei/wangfang/zhaolei/sunyue@demo.com | 123456 |
| 其他专家 | zhangwei/lifang/wangqiang/zhaomin/chenjie/huangli/zhouming/wujing@demo.com | 123456 |

---

## 十、快速重建（完整项目被毁）

```bash
# 1. Clone
git clone git@github.com:michaelwang188/expert-network.git
cd expert-network

# 2. Install
npm install

# 3. 从 Vercel 拉环境变量
vercel link
vercel env pull --environment production

# 4. 生成 Prisma Client
npx prisma generate

# 5. 启动
npm run dev
```

## 十一、从备份目录重建（GitHub 也没了）

```bash
# 备份目录
BAK=<claude-root>/expert-network-backup-2026-06-19
# 或
BAK=<project-root>/.backups/2026-06-19-final

# 恢复
mkdir expert-network && cd expert-network
cp -r $BAK/* .
npm install
npx prisma generate
# 重建 GitHub repo + Vercel 导入
```

---

## 十二、完整文档清单

| 文档 | 用途 |
|------|------|
| [REQUIREMENTS.md](REQUIREMENTS.md) | 需求总纲（8章含积分体系） |
| [IRON_RULES.md](IRON_RULES.md) | 33条铁律（协作+部署+微信DB+网络） |
| [BUSINESS_FLOW.md](BUSINESS_FLOW.md) | 订单业务流程图 |
| [PITFALLS.md](PITFALLS.md) | 10个踩坑记录 |
| [QA_ONBOARDING.md](QA_ONBOARDING.md) | 质检员手册 |
| [AI_MESSAGE_BOARD.md](AI_MESSAGE_BOARD.md) | AI协作消息板 |
| [REBUILD.md](REBUILD.md) | 本文件 |
