# 🔴 踩坑记录 — 专家库项目 2026-06-19

> **读这个=省10小时。每条坑都实打实踩过，修复过，验证过。**

---

## 坑 1 · Vercel 域名国内被墙

**现象**: `expert-network-sooty.vercel.app` 本地正常，其他电脑 `ERR_CONNECTION_TIMED_OUT`

**根因**: `*.vercel.app` 在国内 DNS 污染/GFW 阻断

**解决**: 
- 本地机器用 Hiddify 代理 → `127.0.0.1:12334`
- 分享给他人需对方也走代理，或绑定自定义域名

**铁律**: Vercel 部署的项目默认域名国内不可达。发布给他人必须绑自定义域名或让对方挂代理。

---

## 坑 2 · curl 代理参数与环境变量

**现象**: `curl --proxy http://127.0.0.1:12334` 超时，`https_proxy=...` 正常

**根因**: curl 的 `--proxy` 参数与环境变量 `https_proxy` 行为不同（`--proxy` 更保守的 TLS 协商）

**解决**: 统一用环境变量方式：`https_proxy=http://127.0.0.1:12334 http_proxy=http://127.0.0.1:12334 curl ...`

**铁律**: 所有 curl 调用统一走环境变量，不用 `--proxy` 参数。

---

## 坑 3 · Neon Postgres 池化连接 vs 直连

**现象**: Prisma Client 本地连 pooler URL 正常，`npx tsx` 独立脚本连 pooler 报 URL validation error

**根因**: Pooler URL `ep-xxx-pooler.c-9.us-east-1.aws.neon.tech` 和直连 URL `ep-xxx.c-9.us-east-1.aws.neon.tech` 不同。某些客户端对 pooler 的 `channel_binding=require` 参数不兼容

**解决**:
- Vercel Serverless → 用 `DATABASE_URL`（pooler）
- 本地 CLI 脚本 → 用 `DATABASE_URL_UNPOOLED`（直连）
- seed 脚本需要 `export $(grep -v '^#' .env.local | xargs)` 确保环境变量导出

**铁律**: 本地直接操作 DB 用 unpooled 连接，Vercel 部署用 pooled。seed 前先 `export` 环境变量。

---

## 坑 4 · `source .env.local` 不导出变量

**现象**: `source .env.local && npm run db:seed` 报 DATABASE_URL not set

**根因**: `source` 加载的是带引号的 shell 变量格式（`KEY="value"`），子进程 npm 拿不到

**解决**: `export $(grep -v '^#' .env.local | xargs) && npm run db:seed`

**铁律**: 操作数据库前用 `export $(grep -v '^#' .env.local | xargs)`，不用 `source`。

---

## 坑 5 · AI 协作：GitHub 中转 vs 本地文件直读

**现象**: 花了几小时让 1号AI 和质检员通过 GitHub push/pull 同步，但他们都推不了

**根因**: 三个 AI 在同一台 Mac 上，消息板是本地文件。GitHub 中转完全多余——1号AI 和质检员没有 write 权限，永远推不了

**解决**: 直接监控本地文件 mtime（Monitor 10 秒 + Cron 1 分钟）。AI 修改文件保存即生效，不需要 push/pull

**铁律**: 同机多 AI 协作 → 本地文件监测。不同机 → GitHub 中转。不要混用。

---

## 坑 6 · 1号AI 的权限限制

**现象**: 1号AI 反复读文件，永远不写，2 小时无进展

**根因**: 他只有 Read/Bash(grep) 工具，没有 Edit/Write 权限。读完不知道下一步——因为文件里缺少「读完做什么」的即时指令

**教训**:
- 如果 AI 只有 Read 权限，必须在文件里显式写「读完后做什么」
- 如果 AI 没有 Edit 权限，签字流程形同虚设
- 不能假设对方有什么工具

**铁律**: 新 AI 入职前先确认可用工具。无 Edit 权限的只做质检员（只读），不做任何需要写操作的。

---

## 坑 7 · NEXTAUTH_SECRET 为空

**现象**: 种子账号登录返回 `CredentialsSignin`，但新注册账号可登录。密码 hash 验证正确，数据库连接正常

**根因**: Vercel 环境变量 `NEXTAUTH_SECRET` 值为空字符串！NextAuth 没有 secret 就无法签发 JWT — 但新注册的账号因为浏览器的 session 还没过期所以能登

**解决**: `vercel env rm NEXTAUTH_SECRET production --yes` → `vercel env add NEXTAUTH_SECRET production` 重新设值 → 重新部署

**检测方法**: `curl /api/auth/csrf` 返回 400 说明 NEXTAUTH_SECRET 缺失

**铁律**: 部署后验证 NEXTAUTH_SECRET 不为空。`vercel env pull` 后检查 `grep NEXTAUTH_SECRET .env.local` 是否空值。

---

## 坑 8 · 订单重复提交

**现象**: 研究员提交一次需求，订单列表出现 3 条相同记录

**根因**: 前端未做防重复提交，用户快速点击 3 次 = 3 个请求。服务端也未做去重

**修复**:
- 前端：`submitted` 状态锁 + `loading` 加到 `disabled` 条件
- 服务端：2 分钟内同研究员+同标题 = 返回 409

**铁律**: 所有创建类操作（提交/支付/注册）必须前端+后端双重防重复。

---

## 坑 9 · seq.purge_all() 失效

**现象**: linter 提示 `sed: command not found` 在某些目录不适用

**根因**: working directory 切换导致 sed 找不到目标文件

**铁律**: sed 操作始终用绝对路径。`git -C` 同理始终用绝对路径。

---

## 坑 10 · 敏感词检测被绕过

**现象**: 含"定增""内幕交易"的提纲提交后显示"✅ 合规通过"

**根因**: 前端检测到敏感词后只是 `setSensitiveFound()` 设置状态，`handleSubmit` 仍然继续提交。服务端也是只记录日志不拦截

**修复**: 
- 前端：`checkSensitive` 命中 → 直接 return，不调用 fetch
- 服务端：检测到敏感词 → 返回 400 + `{error: "提纲含敏感词"}`
- 词库扩展：从 16 个扩展到 40+ 个

**铁律**: 合规检测必须**阻断**而非**提示**。前端+服务端双重拦截，命中敏感词直接拒绝请求。

---

## 修复优先级速查

| 坑 | 检测 | 修复难度 | 致命性 |
|----|------|---------|--------|
| Vercel 域名被墙 | 外部访问超时 | 低（绑域名） | 🔴 |
| NEXTAUTH_SECRET 空 | csrf 接口 400 | 低 | 🔴 |
| 敏感词绕过 | 提交含敏感词通过 | 中 | 🔴 |
| 重复提交 | 订单表同标题多行 | 低 | 🟡 |
| curl --proxy 超时 | 改用环境变量 | 低 | 🟡 |
| source env 不导出 | export xargs | 低 | 🟡 |
