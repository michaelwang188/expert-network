# 🔴 部署交办：产业专家对接平台 → Vercel

> **接收方 AI 请完整阅读后执行，不要跳过任何步骤。**

---

## 📦 背景

| 项目 | 值 |
|------|-----|
| 项目名称 | 产研通 ProLink（产业专家对接平台） |
| 技术栈 | Next.js 15 + Prisma + NextAuth.js v4 + bcryptjs |
| 数据库 | PostgreSQL（schema 已就绪，provider=postgresql） |
| GitHub | `git@github.com:michaelwang188/expert-network.git`（main 分支） |
| 用户 Vercel 账号 | michaelwang189（GitHub 登录） |
| SSH Key | `~/.ssh/id_ed25519`（已配好 GitHub） |

---

## ⚡ 快速验证（30 秒）

先确认环境正常：

```bash
# 1. Git 状态（应显示 up-to-date with origin/main）
git -C <project-root> status

# 2. Prisma schema 是否是 PostgreSQL
grep provider <project-root>/prisma/schema.prisma

# 3. SSH 到 GitHub（应显示 Hi michaelwang188!）
ssh -T git@github.com
```

---

## 🚀 第一步：Vercel 导入项目

**用户浏览器打开这个链接即可：** https://vercel.com/new

### 操作引导（用户需要做的事）

1. 用 GitHub 登录（Continue with GitHub），找到 `michaelwang188/expert-network`，点 **Import**
2. 配置页面填写：

| 配置项 | 值 | 说明 |
|--------|-----|------|
| **Project Name** | `prolink-expert` | expert-network 已被占用，必须改名 |
| **Framework Preset** | Next.js | 自动识别，不用改 |
| **Root Directory** | `./` | 不改 |

3. 展开 **Environment Variables**，添加：

| Key | Value |
|-----|-------|
| `NEXTAUTH_SECRET` | `yIl3pTTdOpmIJm1Dx+zo6qYtUbOdVjwAdmD8oIRkbW8=` |

4. 点 **Deploy**（第一次会失败——正常，因为还没有数据库）

---

## 🗄️ 第二步：创建 Vercel Postgres

部署后应用 500 报错是预期的。

1. 在 Vercel 项目页面 → **Storage** 选项卡
2. **Create Database** → 选择 **Postgres**
3. 配置：

| 配置项 | 值 |
|--------|-----|
| Database Name | `expert-network-db` |
| Region | **Tokyo** 或 **Hong Kong** |

4. 点击 **Create** → Vercel 自动注入 `DATABASE_URL` 环境变量

---

## 🔧 第三步：修改 Build Command（推送 Prisma Schema）

进入项目 **Settings** → **Build & Development Settings**，把 **Build Command** 改为：

```
npx prisma generate && npx prisma db push && npm run build
```

保存后，回到 **Deployments** → 点最新的部署 → **Redeploy**。

这次部署成功后，数据库表就建好了。

---

## 🌱 第四步：Seeding 测试账号

部署成功后，用 Vercel CLI 跑 seed：

```bash
cd <project-root>

# 安装 Vercel CLI（如果没有）
npm i -g vercel

# 链接到 Vercel 项目
vercel link

# 拉取环境变量并运行 seed
vercel env pull .env.production.local
source .env.production.local
npx prisma db seed
```

### 测试账号（seed 后可用）

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 研究员 | researcher@demo.com | 123456 |
| 专家 | expert@demo.com | 123456 |
| 管理员 | admin@demo.com | 123456 |

> Seed 脚本路径：`prisma/seed.ts`（用 bcryptjs hash 密码，upsert 防重复）

---

## 📋 完整环境变量清单

| Key | Value | 来源 |
|-----|-------|------|
| `DATABASE_URL` | Postgres 连接字符串 | Vercel Postgres 自动注入 |
| `NEXTAUTH_SECRET` | `yIl3pTTdOpmIJm1Dx+zo6qYtUbOdVjwAdmD8oIRkbW8=` | 手动添加 |
| `NEXTAUTH_URL` | `https://prolink-expert.vercel.app` | 部署后手动添加 |

> ⚠️ `NEXTAUTH_URL` 是在 **第二步之后**、拿到实际域名再添加

---

## 🩺 故障排查

| 症状 | 原因 | 解决 |
|------|------|------|
| **部署页 404 / project not found** | 项目名冲突 | 用 `prolink-expert`，不用 `expert-network` |
| **Application error: 500** | 缺数据库 | 执行第二步创建 Postgres |
| **PrismaClientInitializationError** | Prisma Client 未生成 | 检查 Build Command 是否含 `prisma generate` |
| **登录失败 / 无响应** | NEXTAUTH_SECRET 未设 | 检查 Settings → Environment Variables |
| **注册后数据库无记录** | 数据库未连接 | 检查 DATABASE_URL 是否存在 |
| **seed 报错 DATABASE_URL** | env 未加载 | 用 `vercel env pull` 拉取 |

---

## 🎯 成功标准

部署完成后确认以下 3 点：

- [ ] 访问 `https://prolink-expert.vercel.app` 能看到登录页
- [ ] 用 `researcher@demo.com / 123456` 能成功登录
- [ ] 注册新账号后刷新页面，新账号仍然存在（证明数据库读写正常）

---

## 🧠 关键架构细节

### 认证流程
```
用户输入邮箱密码 → CredentialsProvider.authorize() →
prisma.user.findUnique → bcrypt.compare →
返回 { id, email, name, role } → JWT session
```

### 角色枚举
```
Role: RESEARCHER | EXPERT | ADMIN
ExpertStatus: PENDING | ACTIVE | FROZEN | INACTIVE
RequestStatus: SUBMITTED | COMPLIANCE_OK | MATCHING | CONFIRMED | COMPLETED | CANCELLED
OrderStatus: PENDING | ACTIVE | DONE | PAID | CANCELLED
```

### Prisma Client 模式
使用 globalThis 单例（见 `src/lib/prisma.ts`），避免 Next.js 热重载时创建多个实例。

---

## 📞 交接上下文

- **上一个 AI** 负责：SSH 配置 + 代码推送到 GitHub + filte-branch 清理大文件历史
- **本次 AI（你）** 负责：Vercel 部署 + PostgreSQL + 环境变量 + 验证
- **本次 AI 完成后** 直接告诉用户结果即可，不需要再交班
