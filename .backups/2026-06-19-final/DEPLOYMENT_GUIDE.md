# Vercel 部署指南 - 产业专家对接平台

## 准备工作

### 1. 确认代码已推送到 GitHub
- 仓库地址: <ADDRESS_REDACTED>
- 分支: `main`
- 状态: ✅ 已推送

### 2. 创建 Vercel Postgres 数据库

#### 步骤 1: 访问 Vercel Dashboard
1. 打开浏览器，访问: https://vercel.com/dashboard
2. 登录你的 Vercel 账号（如果没有，用 GitHub 账号注册）

#### 步骤 2: 创建新项目
1. 点击 **"Add New..."** → **"Project"**
2. 选择 **"Import Git Repository"**
3. 选择 `michaelwang188/expert-network` 仓库
4. 点击 **"Import"**

#### 步骤 3: 创建 Postgres 数据库
1. 在项目配置页面，找到 **"Storage"** 选项卡
2. 点击 **"Create Database"** → 选择 **"Postgres"**
3. 填写数据库信息:
   - **Name**: `expert-network-db`
   - **Region**: 选择离你最近的地区（如 `Tokyo` 或 `Hong Kong`）
4. 点击 **"Create"**
5. 创建成功后，Vercel 会自动生成 `DATABASE_URL` 环境变量

#### 步骤 4: 配置环境变量
在 Vercel 项目设置中，添加以下环境变量:

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DATABASE_URL` | (自动生成) | Vercel Postgres 连接字符串 |
| `NEXTAUTH_SECRET` | (见下方生成方法) | NextAuth.js 加密密钥 |
| `NEXTAUTH_URL` | `https://your-app-name.vercel.app` | 你的 Vercel 域名 |

**生成 NEXTAUTH_SECRET**:
```bash
# 在本地 Terminal 运行
openssl rand -base64 32
# 复制输出的字符串，作为 NEXTAUTH_SECRET 的值
```

### 3. 部署项目

#### 步骤 1: 点击 "Deploy"
- 在 Vercel 项目配置页面，滚动到最下方
- 点击 **"Deploy"** 按钮

#### 步骤 2: 等待部署完成
- Vercel 会自动:
  1. 安装依赖 (`npm install`)
  2. 构建项目 (`npm run build`)
  3. 部署到全球 CDN

- 部署时间: ~3-5 分钟

#### 步骤 3: 初始化数据库
部署成功后，需要初始化 PostgreSQL 数据库:

1. 在 Vercel 项目页面，点击 **"Deployments"** 选项卡
2. 找到最新的部署，点击右侧的 **"..."** → **"View Build Logs"**
3. 在本地 Terminal 运行:
   ```bash
   # 设置 DATABASE_URL 为 Vercel Postgres 的连接字符串
   export DATABASE_URL="<从 Vercel Dashboard 复制>"
   
   # 推送 Prisma schema 到数据库
   npx prisma db push
   
   # (可选) 运行 seed 脚本
   npx prisma db seed
   ```

**或者**，在 Vercel 中配置 Build Command:
1. 进入项目设置 → **"General"** → **"Build & Development Settings"**
2. 修改 **"Build Command"** 为:
   ```
   npx prisma generate && npx prisma db push && npm run build
   ```
3. 重新部署

### 4. 验证部署

#### 步骤 1: 访问你的应用
- 部署成功后，Vercel 会提供一个域名: `https://your-app-name.vercel.app`
- 点击该链接，访问你的应用

#### 步骤 2: 测试功能
1. **注册账号**: 点击 "注册"，创建一个研究员账号
2. **登录**: 使用注册的账号登录
3. **创建专家**: 注册一个专家账号，测试专家库功能
4. **发起申请**: 作为研究员，发起一个调研申请
5. **管理员后台**: 访问 `/admin`，测试管理员功能

---

## 常见问题

### 问题 1: `PrismaClientInitializationError`

**原因**: `DATABASE_URL` 未正确配置

**解决**:
1. 检查 Vercel 环境变量中 `DATABASE_URL` 是否正确
2. 确认 Vercel Postgres 数据库已创建且状态为 "Active"
3. 重新部署

---

### 问题 2: `npm run build` 失败

**原因**: Prisma Client 未生成

**解决**:
1. 修改 Vercel Build Command 为:
   ```
   npx prisma generate && npm run build
   ```
2. 重新部署

---

### 问题 3: 数据库迁移失败

**原因**: PostgreSQL 数据库为空，需要初始化

**解决**:
```bash
# 在本地 Terminal，使用 Vercel Postgres 的 DATABASE_URL
npx prisma db push
```

---

## 后续步骤

### 1. 配置自定义域名（可选）
1. 在 Vercel 项目设置 → **"Domains"**
2. 添加你的域名（如 `expert.yourcompany.com`）
3. 按照提示配置 DNS 记录

### 2. 设置 CI/CD（自动部署）
- Vercel 默认启用: 每次推送到 `main` 分支，自动部署
- 可以为 `staging` 分支设置预览部署

### 3. 监控与日志
- Vercel Dashboard → **"Deployments"** → 查看构建日志
- Vercel Dashboard → **"Analytics"** → 查看访问统计

---

## 技术细节

### Prisma Schema 变化
- **之前**: SQLite (`provider = "sqlite"`)
- **现在**: PostgreSQL (`provider = "postgresql"`)
- **兼容性**: 大部分语法兼容，已测试通过

### 环境变量
- `DATABASE_URL`: Vercel Postgres 自动注入
- `NEXTAUTH_SECRET`: 需要手动生成并配置
- `NEXTAUTH_URL`: 自动设置为 Vercel 域名

### Build 流程
1. `npx prisma generate` - 生成 Prisma Client
2. `npx prisma db push` - 推送 schema 到数据库
3. `npm run build` - 构建 Next.js 应用
4. 部署到 Vercel CDN

---

## 完成标志

✅ Vercel 项目创建成功  
✅ Postgres 数据库创建成功  
✅ 环境变量配置完成  
✅ 代码部署成功  
✅ 数据库初始化完成  
✅ 应用可以正常访问  

---

**文档结束** | 最后更新: 2026-06-19
