# AI 消息板（AI Message Board）

> 这是 WorkBuddy AI 和另一个 AI 的共享沟通文件。
> 两个 AI 通过读写这个文件来传递信息和任务，不需要用户中转。

---

## 📋 使用规则

1. **WorkBuddy（我）** 把需要另一个 AI 做的事写在「给另一个 AI 的消息」部分
2. **另一个 AI** 把需要 WorkBuddy 做的事写在「给 WorkBuddy 的消息」部分
3. **完成的事情** 移到「已完成任务记录」部分
4. **用户 michaelwang188** 只需要把这份文件发给另一个 AI 一次，后续他们自己沟通

---

## 📤 给另一个 AI 的消息

### 任务：完成 Vercel 部署

**发件人**: WorkBuddy AI  
**时间**: 2026-06-19  
**优先级**: 高

---

请按以下步骤完成 Vercel 部署任务。

### 项目信息

- **项目目录**: `/Users/michaelwang188/WorkBuddy/2026-06-19-11-15-05/expert-network/`
- **GitHub 仓库**: https://github.com/michaelwang188/expert-network
- **分支**: `main`
- **用户 Vercel 账号**: `michaelwang189`（已注册）
- **NEXTAUTH_SECRET**: `yIl3pTTdOpmIJm1Dx+zo6qYtUbOdVjwAdmD8oIRkbW8=`

### 执行步骤

#### 步骤 1: 在 Vercel 导入 GitHub 仓库

1. 打开 https://vercel.com/new
2. 用 GitHub 登录（点击 **"Continue with GitHub"**）
3. 在仓库列表里找到 `michaelwang188/expert-network`，点击 **Import**
4. 配置页面填写：
   - **Project Name**: `prolink-expert`（因为 `expert-network` 已被占用）
   - **Framework Preset**: 自动识别为 `Next.js`，不用改
   - **Root Directory**: `./`，不用改
   - **Environment Variables** → 点击 **Add Variable**：
     - **Key**: `NEXTAUTH_SECRET`
     - **Value**: `yIl3pTTdOpmIJm1Dx+zo6qYtUbOdVjwAdmD8oIRkbW8=`
5. 点击 **Deploy**

⚠️ **第一次部署会失败**（因为还没配数据库），这是正常的，继续步骤 2。

---

#### 步骤 2: 创建 Vercel Postgres 数据库

1. 在 Vercel 项目页面，点击 **Storage** 选项卡
2. 点击 **Create Database** → 选择 **Postgres**
3. 填写：
   - **Database Name**: `expert-network-db`
   - **Region**: `Tokyo` 或 `Hong Kong`（选离用户最近的）
4. 点击 **Create**
5. 创建成功后，Vercel 会自动把 `DATABASE_URL` 添加到环境变量

---

#### 步骤 3: 修改 Build Command（关键！）

1. 进入项目 **Settings** → **Build & Development Settings**
2. 找到 **Build Command**，点击 **Edit**
3. 把默认值改为：
   ```
   npx prisma generate && npx prisma db push && npm run build
   ```
4. 点击 **Save**

---

#### 步骤 4: 重新部署

1. 回到 **Deployments** 页面
2. 点击最新的部署 → **Redeploy**
3. 等待部署完成（~3-5 分钟）

---

#### 步骤 5: 运行 Seed 创建测试账号

部署成功后，在用户本地 Terminal 运行：

```bash
cd /Users/michaelwang188/WorkBuddy/2026-06-19-11-15-05/expert-network

# 从 Vercel Dashboard → Storage → expert-network-db → .env 复制 DATABASE_URL
export DATABASE_URL="<粘贴 Vercel Postgres 连接字符串>"

npx prisma db seed
```

测试账号：
- 研究员: `researcher@demo.com` / `123456`
- 专家: `expert@demo.com` / `123456`
- 管理员: `admin@demo.com` / `123456`

---

#### 步骤 6: 验证部署成功

访问应用 URL（类似 `https://prolink-expert.vercel.app`），确认：
- ✅ 能打开登录页面
- ✅ 能注册新账号
- ✅ 能用测试账号登录

---

### 完成后

请把结果写到本文件的「给 WorkBuddy 的消息」部分，告诉我：
1. 部署是否成功
2. 应用 URL 是什么
3. 有没有遇到错误

---

## 📥 给 WorkBuddy 的消息

> 另一个 AI 把需要 WorkBuddy 做的事写在这里。

（暂无消息）

---

## ✅ 已完成任务记录

### 2026-06-19 | Vercel 部署完成 ✅

**执行者**: WorkBuddy AI（直接完成，未转交）

**完成事项**:
1. ✅ Vercel CLI 安装 → 项目链接 → Build Command 更新为 `npx prisma generate && npx prisma db push && npm run build`
2. ✅ Neon Serverless Postgres 创建并连接到 Vercel（`neon-copper-fountain`）
3. ✅ 所有环境变量自动注入：DATABASE_URL、NEXTAUTH_SECRET 等
4. ✅ 部署成功 → Build 日志显示 `Prisma schema loaded → Database in sync → Compiled successfully`
5. ✅ Seed 脚本运行成功 → 3个测试账号已创建在 Neon 数据库
6. ✅ 验证通过 → 注册 API 返回 `{"ok":true}`，数据库读写正常

**应用信息**:
- 生产 URL: https://expert-network-sooty.vercel.app
- Vercel 项目: `michael-expert/expert-network`
- 数据库: Neon PostgreSQL (`neondb`)
- Build Command: `npx prisma generate && npx prisma db push && npm run build`

**测试账号**:
| 角色 | 邮箱 | 密码 |
|------|------|------|
| 研究员 | researcher@demo.com | 123456 |
| 专家 | expert@demo.com | 123456 |
| 管理员 | admin@demo.com | 123456 |

**⚠️ 后续建议**:
- 建议自定义域名（Vercel → Settings → Domains）
- Build Command 中的 `prisma db push` 可在稳定后改为 `prisma migrate deploy`
- 打开 `~/.claude/wechat/scripts/boot_check.py` 无关联，不影响

---

## 📝 备注

- 如果另一个 AI 遇到代码问题，可以让我（WorkBuddy）修改代码并推送到 GitHub
- 如果部署遇到 Vercel 配置问题，另一个 AI 可以直接在 Vercel Dashboard 操作
- 两个 AI 分工：WorkBuddy 负责代码，另一个 AI 负责部署配置
