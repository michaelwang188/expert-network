# 专家库项目 — 全量经验总结（2026-06-19）

> 本次总结覆盖全天工作：项目搭建、Vercel部署、三AI协作、轮询机制、踩坑记录。
> 下次继续此项目时，先读本文档，避免踩同样的坑。

---

## 一、项目架构总览

```
expert-network/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── (auth)/login/       # 登录页
│   │   ├── (dashboard)/         # 各角色 Dashboard
│   │   │   ├── researcher/      # 研究员端（experts/request/orders）
│   │   │   ├── expert/          # 专家端（dashboard/edit）
│   │   │   └── admin/           # 管理员端（dashboard/experts/orders/users/review/audit）
│   │   └── api/                # API 路由
│   │       ├── auth/           # NextAuth 认证
│   │       ├── experts/        # 专家 CRUD + 审核
│   │       ├── orders/         # 订单管理
│   │       ├── requests/       # 调研申请
│   │       ├── users/          # 用户管理
│   │       └── compliance/     # 合规日志
│   ├── components/             # React 组件
│   │   ├── AuthGuard.tsx       # 登录鉴权守卫
│   │   └── AdminSidebar.tsx    # 管理员侧边栏
│   └── lib/
│       ├── auth.ts             # NextAuth 配置
│       ├── db.ts               # Prisma 客户端
│       └── compliance.ts       # 合规检测工具
├── prisma/
│   ├── schema.prisma           # 数据库模型
│   └── seed.ts                 # 演示数据种子
├── AI_MESSAGE_BOARD.md         # 三AI协作消息板
├── IRON_RULES.md               # 32条铁律
├── REQUIREMENTS.md             # 需求总纲（8章）
├── QA_ONBOARDING.md            # 质检员入职手册
├── COLLABORATION_HANDOFF.md    # 项目架构交接文档
├── DEPLOYMENT_GUIDE.md         # 部署全流程
└── .workbuddy/
    └── message-board-poller.py # 消息板轮询器
```

---

## 二、部署与基础设施

### 技术栈
| 层 | 技术 | 详情 |
|---|------|------|
| 框架 | Next.js 15 (App Router) | TypeScript |
| 样式 | Tailwind CSS v3 | — |
| 认证 | NextAuth.js | Credentials Provider + JWT |
| 数据库 | PostgreSQL | Neon Serverless |
| ORM | Prisma | 7个模型 |
| 部署 | Vercel | 免费 Hobby 计划 |

### Vercel 部署关键配置
```
Build Command: npx prisma generate && npx prisma db push && npm run build
Output Dir: （留空）
Install Command: npm install
Root Dir: expert-network/
```

### 环境变量（.env.local）
```
DATABASE_URL=postgresql://...（Neon直连）
DIRECT_URL=postgresql://...（Prisma迁移用）
NEXTAUTH_SECRET=<随机生成32位>
NEXTAUTH_URL=https://expert-network-sooty.vercel.app
```

### 部署验证三步
```bash
# 1. 首页
curl -sI https://expert-network-sooty.vercel.app

# 2. 登录
curl -s -X POST https://expert-network-sooty.vercel.app/api/auth/callback/credentials \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=researcher@demo.com&password=123456"

# 3. API
curl -s https://expert-network-sooty.vercel.app/api/experts
```

### 测试账号
| 角色 | 邮箱 | 密码 |
|------|------|------|
| 研究员 | researcher@demo.com | 123456 |
| 专家 | expert@demo.com | 123456 |
| 管理员 | admin@demo.com | 123456 |

---

## 三、踩过的坑（⚠️ 关键，下次别再犯）

### 坑1：Vercel Build Command 缺少 prisma generate
- **现象**：部署后应用崩溃，503错误
- **原因**：Build Command 里没加 `prisma generate`，Prisma Client 未生成
- **正解**：固定为 `prisma generate && prisma db push && npm run build`
- **铁律 #19** 已记录

### 坑2：NEXTAUTH_SECRET 缺失
- **现象**：登录成功但 session 丢失
- **原因**：新建 Vercel 项目时忘记设置 NEXTAUTH_SECRET
- **正解**：生成随机字符串并添加到 Vercel 环境变量

### 坑3：macOS 通知不弹出
- **现象**：`osascript display notification` 无反应
- **原因**：Terminal.app 不在 macOS 通知权限列表（从未请求过权限）
- **解决**：用 `say` 命令播放语音代替
- **文件**：已在 `.workbuddy/message-board-poller.py` 中处理

### 坑4：沙盒环境无法运行持久进程
- **现象**：`nohup xxx &` 命令执行后进程立即被杀死
- **原因**：WorkBuddy 沙盒环境，命令执行完即清理
- **解决**：轮询器脚本需要用户在**自己的终端**里手动运行

### 坑5：角色混淆导致协作中断
- **现象**：混淆了"WorkBuddy=总架构师"还是"WorkBuddy=执行架构师"
- **原因**：消息板写作时角色定义与用户口头分配不一致
- **解决**：先与用户确认角色，再操作。消息板顶部有签字表确认
- **教训**：所有角色分工必须双方书面确认，不要凭记忆

### 坑6：消息板不 push 别人看不到
- **现象**：编辑了消息板但其他 AI 看不到
- **原因**：只保存了本地文件，忘了 git push
- **解决**：写消息后立即 `git add + commit + push`
- **铁律 #17** 已记录

### 坑7：git pull 前编辑导致冲突
- **现象**：编辑消息板保存后发现别人已修改
- **原因**：没先 pull 就编辑
- **解决**：遵循铁律 #8：push 前先 pull

### 坑8：/orders 页面未登录崩溃
- **现象**：未登录访问 /orders 显示 Application Error
- **原因**：getServerSession 返回 null 时组件直接访问嵌套属性
- **解决**：添加 AuthGuard + 空值保护 + `(session?.user && ...)`

### 坑9：数据库 seed 数据需要 bcrypt
- **现象**：seed 脚本创建用户后无法登录
- **原因**：密码存储为明文，不是 bcrypt hash
- **解决**：`import bcrypt from 'bcrypt'; password: await bcrypt.hash('123456', 10)`

---

## 四、三AI协作机制（核心工作流）

### 角色定义（⚠️ 每次会话开始必须确认）
| AI | 角色 | 产品 | 职责 |
|----|------|------|------|
| AI #1 | 总架构师（不一定存在） | — | 需求理解、架构决策、任务分配 |
| AI #2 | **我（WorkBuddy）** | WorkBuddy | 代码实现、部署、数据库、Bug修复 |
| AI #3 | 质检员（未激活） | — | 独立审查、需求对齐检查 |

### 消息板区域权限
| 区域 | 谁写 | 谁读 |
|------|------|------|
| 📤 给执行架构师的消息 | 总架构师 | 所有人 |
| 📥 给总架构师的消息 | 我（WorkBuddy） | 所有人 |
| 🔍 质检报告 | 质检员 | 所有人 |
| ✅ 已完成任务 | 我（WorkBuddy） | 所有人 |

### 协作规则（铁律核心）
1. **写消息后必须 git push**
2. **读消息前先 git pull**
3. **只在自己的消息区写，不改别人的区**
4. **REQUIREMENTS.md 是最高准则**
5. **总架构师有最终决策权**

---

## 五、轮询机制（已实现但需手动运行）

### 脚本位置
```
.workbuddy/message-board-poller.py
```

### 运行方式
```bash
cd /Users/michaelwang188/WorkBuddy/2026-06-19-11-15-05/expert-network
python3 .workbuddy/message-board-poller.py
```

### 工作原理
1. 每 30 秒 `git pull`
2. 比较 AI_MESSAGE_BOARD.md 的 MD5 哈希
3. 检测到变化 → 播放语音提醒（`say` 命令）
4. 终端窗口输出：`🔔 检测到消息板更新！`

### 注意事项
- 必须用户自己在终端运行（沙盒不能持久）
- 保持终端窗口打开（最小化即可）
- 语音提醒需要 macOS 音量开启

---

## 六、关键决策记录

1. **数据库选型**：SQLite → PostgreSQL (Neon) — 因为需要多人协作
2. **认证方案**：NextAuth Credentials — 简单、免费、无第三方依赖
3. **部署平台**：Vercel — 免费、自动集成 GitHub、零配置
4. **敏感词检测**：用本地关键词匹配而非 AI API — 保障隐私、零成本
5. **种子数据**：5位专家含三级标签 + 报价 + 档期

---

## 七、下次继续时的检查清单

```
□ 终端运行轮询器了吗？（python3 .workbuddy/message-board-poller.py）
□ git pull 了吗？
□ 读 AI_MESSAGE_BOARD.md 了吗？
□ 确认角色：我是 WorkBuddy = 执行架构师
□ 消息板有未完成的任务吗？
□ 如果有新任务，先理解需求再执行
□ 写消息后 git push 了吗？
```

---

## 八、GitHub 仓库信息

- **仓库**: github.com/michaelwang188/expert-network
- **分支**: main
- **Vercel**: https://expert-network-sooty.vercel.app
- **数据库**: Neon PostgreSQL

---

**备份时间**: 2026-06-19 22:55
**备份内容**: src/ prisma/ .workbuddy/ .vercel/ AI_MESSAGE_BOARD.md IRON_RULES.md REQUIREMENTS.md QA_ONBOARDING.md 等全部关键文件
**备份位置**: .backups/2026-06-19-2255-all/
