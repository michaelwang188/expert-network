# 🔴 铁律手册 — 三个 AI 共同遵守

> **违反铁律 = 项目受损或 AI 协作崩溃。三条 AI 入职必读，每次操作前自查。**
>
> 版本：v2.0 | 2026-06-20 | 维护者：WorkBuddy AI | **39条**铁律覆盖 **10** 大类 🆕 +数据安全 🆕 +任务锁

---

## 🔴 铁律 0：不犯低级事实错误

- ❌ 不凭记忆推算时间 — 用 `date` 或 `stat -f "%Sm"` 取值
- ❌ 不凭感觉判断文件多久没更新 — 用 mtime 差值计算
- ❌ 不说"几个小时前"除非真的算过

**问时间必须取值，问状态必须查证。一次猜错 = 全部可信度归零。**

---



## 🔒 数据安全铁律（4 条 · 2026-06-20新增）

> 背景：2026-06-20 23:20 GitHub仓库已完成全量零个人信息清理。
> 以下规则为团队最高级别安全规范，违者需立即修复。

### 铁律 36：GitHub 零个人信息

**绝对禁止推送到 GitHub：**
- API Key / Token / AccessKey
- 密码 / Secret / 环境变量值
- 邮箱 / 手机号 / 真实姓名
- macOS 绝对用户路径（`/Users/<name>/...`）
- `.env` `.env.local` `.backups/` `.workbuddy/` 目录
- `*.plist` 文件（含 API Key）
- `tsconfig.tsbuildinfo` 构建缓存

### 铁律 37：推送前自检

每次 `git push` 前必须执行：
```bash
git diff --cached --name-only | xargs grep -l 'sk-\|LTAI\|vcp_\|Bearer\|ANTHROPIC_API_KEY' 2>/dev/null && echo "❌ 停止推送" || echo "✅ 安全"
```

### 铁律 38：敏感信息本机隔离

所有密钥/密码/Token 只允许存储在：
- 本机环境变量（如 `.env.local`——已在 `.gitignore`）
- launchd plist 的 `EnvironmentVariables`（本机，不推 git）
- macOS Keychain（优先方案）

### 铁律 39：误推立即回滚

发现误推 → `git reset --soft HEAD~1` → 删除敏感内容 → 重新 commit → 通知 2号AI

---

## 📌 铁律总览（35 条）

| # | 类别 | 铁律 | 违反后果 |
|---|------|------|---------|
| 1 | 🎯 需求 | REQUIREMENTS.md 是最高准则，一切代码/审查以此为准 | 偏离需求，推倒重来 |
| 2 | 🎯 需求 | 业务合规红线不可碰（内幕信息、荐股、绕平台交易） | 法律风险 |
| 3 | 🔒 领地 | 只在自己的消息区写，不改别人的消息区 | AI 互相覆盖，信息丢失 |
| 4 | 🔒 领地 | 不跨角色派任务（质检员不指挥执行架构师，反之亦然） | 角色混乱，责任不清 |
| 5 | 🔒 领地 | 不改不属于自己的代码（执行架构师不改 Schema，质检员不改代码） | 架构崩溃 |
| 6 | 🔄 协作 | git push 前必须先 git pull — 防止覆盖他人更新 | 信息丢失，冲突 |
| 7 | 🔄 协作 | 总架构师拥有最终决策权 — 争议时以总架构师裁定为准 | 无限争论，无人拍板 |
| 8 | 🔒 任务锁 | **派任务必须带 `[状态: ⬜待认领]`，接任务后改 `[🔧执行中 @ 时间]`**，有主不抢 | 重复劳动，互相覆盖 |
| 9 | 🔒 任务锁 | **执行架构师接任务后 5 分钟无 git push → 超时失效**，总架构师方可接管 | 永久卡死 |
| 10 | 🔒 任务锁 | **总架构师禁止跳过任务锁直接抢活** — 只能派任务或超时后接管 | 角色混乱，1号包揽一切 |
| 11 | 🔍 质检 | 零信任原则 — 不信任执行架构师和总架构师的自述，必须独立验证 | 质检形同虚设 |
| 12 | 🔍 质检 | 审查结论必须三选一且明确：🟢通过 / 🟡有条件通过 / 🔴驳回 | 含混不清，无人知道能不能继续 |
| 13 | 🔍 质检 | 用「需求文档第 X 章要求 Y，实际 Z」格式，不写「我觉得」 | 主观判断，无依据 |
| 14 | 💾 备份 | 每次重大变更前后必须备份到 `.backups/` | 项目被毁无法重建 |
| 15 | 💾 备份 | 敏感信息（Token/Key/密码）不入 Git，只存脱敏模板 | 安全漏洞 |
| 16 | 🗄️ 数据库 | 生产数据库操作前必须确认连接的是 production 环境 | 误操作 production 数据 |
| 17 | 🗄️ 数据库 | Schema 变更只由总架构师决策，执行架构师执行 | 数据库结构失控 |
| 18 | 🚀 部署 | Build Command 必须包含 `prisma generate` — 缺则 Prisma Client 不生成 | 部署失败 |
| 19 | 🚀 部署 | 部署后必须验证：URL 可访问 + 登录可用 + API 返回正常 | 上线即挂 |
| 20 | 📝 消息板 | 消息写完后立即 git push — 不 push 别人看不到 | 协作中断 |
| 21 | 📝 消息板 | 读消息前先 git pull — 不 pull 不知道别人发了什么 | 重复工作，漏掉任务 |
| 22 | 🤖 轮询 | 执行架构师（WorkBuddy）每分钟 Cron 自动扫描 | 无需手动触发 |
| 23 | 🤖 轮询 | 总架构师和质检员每次会话开始必须 git pull | 看不到最新消息板 |
| 24 | 🌐 网络 | 代理架构不可改：Hiddify→127.0.0.1:12334（国际），国内金融API 直连 | 所有 API 不通 |
| 25 | 🌐 网络 | 国内金融 API（东财/腾讯/新浪/雪球）必须绕过代理 | TLS 不兼容，行情全部挂 |
| 26 | 🌐 网络 | `curl` 测试代理状态：直接失败≠代理失败，用 `--noproxy '*'` 对比 | 误判网络故障 |
| 27 | 🌐 网络 | 遇到网络问题先搜已有方案，不自创：`find ~/.hermes ~/.claude -name "*.py" | xargs grep -l "关键词"` | 重复踩坑 |
| 28 | 🔐 微信DB | 所有 sqlcipher 调用必须加 `PRAGMA query_only=ON` | DB 损坏，微信消息中断 |
| 29 | 🔐 微信DB | kdf_iter = 2（不是 64000），错了解密全失败 | 全部解密失败 |
| 30 | 🔐 微信DB | 禁止 INSERT/UPDATE/DELETE/REINDEX/VACUUM 微信原始 DB | 不可逆损坏 |
| 31 | 🔐 微信DB | 禁止 `PRAGMA journal_mode=WAL` | 与微信 WAL 管理冲突 |
| 32 | 🔐 微信DB | 禁止假设分片编号 — `glob("message_*.db")` 动态发现，不硬编码 | 查到旧数据 |
| 33 | 🔐 微信DB | 多分片查询 — 永远遍历所有 message_N.db，不靠单分片 | 遗漏消息 |
| 34 | 🔐 微信DB | 修改任何 DB 脚本后必须先跑 `python3 ~/.claude/wechat/scripts/boot_check.py` | 带着 bug 上线 |
| 35 | 🔐 微信DB | DB 相关问题调用 `/wechat-decrypt` skill，禁止从零摸索 | 浪费时间，重复踩坑 |

---

## 🎯 需求铁律（3 条 · 最高优先级）

### 铁律 1：REQUIREMENTS.md 是最高准则

**所有代码实现、部署配置、质检审查必须以 `REQUIREMENTS.md` 为唯一标准。**

- ✅ "需求文档第三章要求三级标签体系，当前 Schema 的 Expert 模型只有单级标签"
- ❌ "我觉得应该加个标签字段"

### 铁律 2：合规红线不可碰

以下禁止行为来自 REQUIREMENTS.md 第一章，**任何人不得违反**：

- ❌ 不传递内幕信息、未公开财报、定增并购涉密数据
- ❌ 不荐股、不做投资收益承诺、不代客理财
- ❌ 专家不能是上市公司董监高、内幕知情人
- ❌ 不允许研究员私下加专家微信绕过平台交易

### 铁律 3：需求变更必须更新文档

REQUIREMENTS.md 不是只读的——总架构师可以修改它，但**修改后必须在消息板通知所有 AI**。

---

## 🔒 领地铁律（4 条 · 防止打架）

### 铁律 4：只在自己的消息区写

`AI_MESSAGE_BOARD.md` 消息区权限：

| 消息区 | 谁写 | 谁读 | 写错后果 |
|--------|------|------|---------|
| 📤 给执行架构师的消息 | **总架构师** | 所有人 | — |
| 📥 给总架构师的消息 | **执行架构师（WorkBuddy）** | 所有人 | — |
| 🔍 质检报告 | **质检员** | 所有人 | — |
| ✅ 已完成任务 | 执行架构师 | 所有人 | — |
| 其他区域 | 执行架构师 | 所有人 | — |

**任何人不得在别人的消息区写入内容。**

### 铁律 5：不跨角色派任务

```
质检员 → 不能直接派任务给执行架构师（只向总架构师报告）
执行架构师 → 不能直接指挥质检员（只通过总架构师分配）
总架构师 → 不能替代质检员自审自评
```

### 铁律 6：代码修改权限

| 改什么 | 谁决策 | 谁执行 |
|--------|--------|--------|
| Schema（数据库结构） | 总架构师 | 执行架构师 |
| API / 页面 | 总架构师 | 总架构师或执行架构师 |
| 部署配置 | 执行架构师 | 执行架构师 |
| 环境变量 | 执行架构师 | 执行架构师 |
| 质检员 | **不改任何代码** | — |

### 铁律 7：总架构师拥有最终决策权

三个 AI 出现争议时，**总架构师裁定，执行架构师执行，质检员验证**。不循环争论。

---

## 🔒 任务锁铁律（3 条 · 2026-06-20新增·防抢任务）

> **背景**：2026-06-20 发生严重协作事故 — 2号AI在等用户确认期间，1号AI等待5分钟后越过任务锁把剩余任务全干了，
> 导致 60 行 PointsTransaction 代码写了没 push，谁干了什么无法追溯。此三条铁律为堵死这个漏洞。

### 铁律 8：任务必须带状态锁

**总架构师派任务时**，每个任务必须标状态：

```
📤 任务 #N | [状态: ⬜待认领] | 内容描述 | 超时: 5min
📤 任务 #N | [状态: 🔧执行中 @ 2号AI 10:15] | 内容描述 | 超时: 10:20
📤 任务 #N | [状态: ✅已完成 @ 10:22] | 内容描述
```

**执行架构师接手时**，第一件事是把任务状态从 `⬜待认领` 改为 `🔧执行中`，然后 git push。**改了状态才算接了。**

**违反了会怎样**：1号AI 看到 `⬜待认领` 就以为没人做 → 自己做了 → 2号AI白干。今天已发生。

### 铁律 9：5分钟超时接管

执行架构师接任务后 **5分钟** 没有 git push → 任务超时失效 → 总架构师可以：
1. 重新分配给下一次会话的2号AI
2. 或自己执行

**如何判断超时**：看 `[🔧执行中 @ 10:15]` 的时间戳，如果当前时间 - 接任务时间 > 5分钟 且 无 git push，算超时。

**注意**：超时看的是 git push 时间，不是消息板写入时间。2号AI可能在本地写了消息板但还没 push（比如在等用户批测试工具），此时 `git log --since="5 minutes ago"` 能看到有没有新 commit。

**1号AI 接管前必须先查**：
```bash
git log --since="5 minutes ago" --author="2号AI\|WorkBuddy\|michaelwang" --oneline
# 有输出 → 2号AI还在干，别动
# 无输出 → 超时了，可以接管
```

### 铁律 10：总架构师禁止跳过任务锁

**总架构师（1号AI）只能做两件事：**
- ✅ 派任务到 `📤` 区（标记 `⬜待认领`）
- ✅ 超时 5 分钟后接管（改标记为 `🔧执行中 @ 1号AI`）

**总架构师禁止做：**
- ❌ 派任务后不等2号AI，立刻自己做了
- ❌ 看到 `🔧执行中`（未超时）就抢走任务
- ❌ 以"不知道2号AI会不会做"为由提前接管

**违反了会怎样**：1号AI一个人包揽所有角色，整个三角色架构崩溃回退到单AI模式。2026-06-20 已发生。

---

## 🔄 协作铁律（3 条 · 防止信息丢失）

### 铁律 11：git push 前先 git pull

```
git pull origin main  ← 先拉
# 编辑消息板
git add AI_MESSAGE_BOARD.md
git commit -m "描述清楚做了什么"
git push origin main  ← 再推
```

**不 pull 就 push 会导致冲突或覆盖他人的更新。**

### 铁律 12：写消息后立即 push

消息板是本地的，不 push 别人永看看不到。写完必须 push。

### 铁律 13：读消息前先 pull

总架构师和质检员**每次会话开始必须 git pull**，否则看到的是旧版本。

---

## 🔍 质检铁律（3 条 · 质量生命线）

### 铁律 14：零信任审查

质检员**不相信**总架构师和执行架构师的任何自述。所有结论必须独立验证。

- ❌ "执行架构师说登录修好了，那我就标记通过"
- ✅ "我打开 https://expert-network-sooty.vercel.app，用 researcher@demo.com / 123456 登录，确认跳转到 /dashboard"

### 铁律 15：审查结论必须明确

每轮审查给出三选一结论，不允许含糊：

- 🟢 **通过**：全部完成，无问题 → 总架构师分配下一任务
- 🟡 **有条件通过**：主体完成，有 ⚠️ 项需跟进 → 记录问题，不阻塞进度
- 🔴 **驳回返工**：有 ❌ 项 → 总架构师要求执行架构师修复

### 铁律 16：审查报告用事实说话

- ✅ "需求文档第 3.2 章要求三级审核（基础/专业/合规），当前代码只有登录，专家审核模块未实现"
- ❌ "我觉得专家审核做得不够好"

---

## 💾 备份铁律（3 条 · 防止不可逆损坏）

### 铁律 17：重大变更前后必须备份

以下情况必须备份到 `.backups/<日期>/`：

| 触发条件 | 备份内容 |
|---------|---------|
| Schema 变更前后 | 全量：源码 + prisma + 文档 + 配置 |
| 数据库结构变更 | DB 快照 + ENV keys 清单 |
| 部署配置变更 | .vercel/ + Build Command + ENV keys |
| 大规模代码重构 | 源码 + package.json + package-lock.json |

### 铁律 18：敏感信息不入 Git

Token、密码、API Key **永远不写入 Git 跟踪的文件**。只存脱敏模板（如 `.env.template`）。

### 铁律 19：备份存两份

- `.backups/` → 随 Git 推送，多端可恢复
- `~/.claude/expert-network-backup-<date>/` → 独立于项目目录，项目被删也能存活

---

## 🗄️ 数据库铁律（2 条）

### 铁律 20：操作前确认环境

```bash
# 任何数据库操作前，确认 DATABASE_URL 指向正确环境
echo $DATABASE_URL | grep -o "ep-[a-z-]*"
```

**误在 production 执行测试数据写入 = 生产数据污染。**

### 铁律 21：Schema 变更由总架构师决策

执行架构师可以建议 Schema 变更，但只有总架构师确认后才能执行 `prisma db push`。

---

## 🚀 部署铁律（2 条）

### 铁律 22：Build Command 必须含 Prisma

Vercel Build Command 固定为：

```
npx prisma generate && npx prisma db push && npm run build
```

**缺少 `prisma generate` = Prisma Client 未生成 = 应用启动即崩溃。**

### 铁律 23：部署后三步验证

每次部署后必须验证：

```bash
# 1. 首页能访问
curl -sI https://expert-network-sooty.vercel.app | grep "HTTP/2 307"

# 2. 注册 API 正常
curl -s -X POST https://expert-network-sooty.vercel.app/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"health-check-<timestamp>@test.com","password":"test123","name":"健康检查"}'

# 3. 登录可用
# （用测试账号在浏览器验证）
```

---

## 🌐 网络代理铁律（4 条 · 本机基础设施）

> 本机网络架构任何人不得擅自修改。代理断 = 所有 API 全挂。

### 网络拓扑（硬背）

```
Hiddify.app（sing-box内核）→ 127.0.0.1:12334
├── 浏览器/git/brew/Docker/npm → 系统代理（国际流量）
├── 国内金融API（东财/腾讯/新浪/雪球/同花顺/百度）→ 直连（NO_PROXY）
├── 通达信TDX → raw TCP（天然不受HTTP代理影响）
├── DeepSeek API → 直连（/etc/hosts: 127.0.0.1 api.deepseek.com）
└── GitHub/PyPI → 走代理加速
```

### 铁律 24：代理架构不可改

**127.0.0.1:12334 是唯一代理端口。不新增、不改动、不关闭。**

系统代理配置（macOS 网络设置 → Wi-Fi → 代理）：
- HTTP 代理：127.0.0.1:12334 ✅
- HTTPS 代理：127.0.0.1:12334 ✅

### 铁律 25：国内金融 API 必须直连

**东财/腾讯/新浪/雪球/同花顺/百度 必须绕过代理。** 代理下的 TLS 握手与这些 CDN 不兼容。

**NO_PROXY 域名清单（不可删减）**：
```
eastmoney.com, sina.com.cn, gtimg.cn, qq.com, xueqiu.com, 
10jqka.com.cn, baidu.com, tencent.com, aliyun.com, weixin.qq.com,
pypi.org, python.org, tsinghua.edu.cn, ustc.edu.cn
```

**所有脚本启动时必须加载**：`source ~/.hermes/scripts/env-proxy.sh`

### 铁律 26：网络故障诊断三步

```
# 1. 代理通不通？
curl -o /dev/null -w "proxy: %{http_code} %{time_total}s\n" -s --max-time 5 --proxy http://127.0.0.1:12334 https://httpbin.org/ip

# 2. 直连通不通？
curl -o /dev/null -w "direct: %{http_code} %{time_total}s\n" -s --max-time 5 --noproxy '*' https://www.baidu.com

# 3. DeepSeek API 通不通？
grep deepseek /etc/hosts  # 应有 127.0.0.1 api.deepseek.com
```

**铁律**：任何请求不试一次就报错。四阶重试：Round1 默认 → Round2 反其道（代理↔直连） → Round3 镜像源（清华 pip） → Round4 搜索替代。

### 铁律 27：先搜后做

**遇到任何技术问题，第一步不是自己想方案，而是搜索已有资源：**

1. `find ~/.hermes ~/.claude -name "*.py" | xargs grep -l "关键词"`
2. `WebSearch "github python <任务描述>"`
3. 查 memory 和 skill：`ls ~/.claude/skills/`

**正确流程**：WebSearch → find 本地 → 查 memory → 复用成熟方案 → 不自己发明。

---

## 🔐 微信数据库铁律（8 条 · 最高安全级别）

> 微信 DB 是用户的核心资产。一次违规写入 = 消息记录永久损坏。

### 技术背景

- 微信使用 sqlcipher 加密 SQLite 数据库
- DB 文件路径：`~/Library/Containers/com.tencent.xinWeChat/.../Message/`
- 密钥通过 lldb 内存扫描提取（HMAC 验证）
- 消息分片：`message_0.db`, `message_1.db`, ... 动态编号
- 联系人映射：`db_records.db` → `Contact` 表

### 铁律 28：sqlcipher 必须 query_only=ON

**所有 sqlcipher 连接必须加 `PRAGMA query_only=ON`，缺则禁止操作。**

正确模板（所有新脚本参考）：
```python
sql = (
    f'PRAGMA key = "x\'{key}\'";\n'
    f"PRAGMA cipher_page_size = 4096;\n"
    f"PRAGMA kdf_iter = 2;\n"         # WeChat 强制 2
    f"PRAGMA query_only=ON;\n"         # 必须！强制只读
    f"PRAGMA busy_timeout=3000;\n"
    f"{actual_query}"
)
```

### 铁律 29：kdf_iter = 2

WeChat 的 sqlcipher KDF 迭代次数是 **2**，不是 64000。错了解密全部失败。

### 铁律 30：禁止写操作

**永不执行 INSERT / UPDATE / DELETE / REINDEX / VACUUM** 在微信原始 DB 上。

### 铁律 31：禁止 journal_mode=WAL

**禁止 `PRAGMA journal_mode=WAL`** — 与微信自身的 WAL 管理冲突，导致 DB 损坏。

### 铁律 32：禁止假设分片编号

**`glob("message_*.db")` 动态发现当前分片，不硬编码 `message_16.db`。**

分片编号随使用增长变化，昨天的 16 可能是今天的 17。

### 铁律 33：多分片遍历

**查询消息时永远遍历所有 `message_N.db`，不靠 `find_active_shard()` 单分片。**

单分片假设 = 遗漏消息。

### 铁律 34：修改脚本后跑 boot_check

**修改任何 DB 脚本后必须先跑 `python3 ~/.claude/wechat/scripts/boot_check.py`，全绿才能操作。**

### 铁律 35：DB 问题走标准流程

**所有 DB 相关问题 → 调用 `/wechat-decrypt` skill**（标准化 2-3 分钟），禁止从零摸索。

skill 内含全部铁律、代码模板、路径速查。十年踩坑精华，一次学不会就复用。

### 关键路径速查

| 工具 | 路径 |
|------|------|
| 微信投资助手 | `~/.claude/wechat/scripts/wechat_investment_assistant.py` |
| 自检 | `~/.claude/wechat/scripts/boot_check.py` |
| 安全审计 | `~/.claude/wechat/scripts/db_safety_check.sh` |
| 密钥 | `~/.claude/wechat/keys/wechat_keys_main.json` |
| 密钥提取 | `~/.hermes/scripts/wechat-decrypt/find_key_memscan.py` |
| 铁律全文 | `~/.claude/WECHAT_DB_IRON_RULES.md` |
| V34 监控 | `~/.claude/wechat/scripts/wechat_monitor_v34.py` |

每个 AI 首次接触项目时，按顺序完成：

| 顺序 | 做什么 | 谁必须做 |
|------|--------|---------|
| 1 | 读 `IRON_RULES.md`（本文件） | 所有人 |
| 2 | 读 `REQUIREMENTS.md` | 所有人 |
| 3 | 读 `AI_MESSAGE_BOARD.md` | 所有人 |
| 4 | `git clone` + `npm install` | 总架构师、执行架构师 |
| 5 | 读 `QA_ONBOARDING.md` | 质检员 |
| 6 | 在消息板「📥 给总架构师的消息」回复"已入职" | 执行架构师 |
| 7 | 在消息板「📤 给执行架构师的消息」分配第一个任务（带 `[⬜待认领]` 状态锁） | 总架构师 |
| 8 | 在消息板「🔍 质检报告」执行首次基线审查 | 质检员 |

---

## ⚡ 快速自查（每次操作前 10 秒）

```
□ 我 git pull 了吗？
□ 我写的是我的消息区吗？
□ 任务有状态锁吗？⬜→🔧→✅
  - 1号AI：派任务必须标 [⬜待认领]，超时5min才接管
  - 2号AI：接任务先改 [🔧执行中 @ 时间] 再干活
  - 1号AI：看到 [🔧执行中] 未超时不抢
□ 我要做的是我的领地吗？
□ 结果对齐 REQUIREMENTS.md 了吗？
□ 改完 git push 了吗？
□ 网络：直连国内金融（NO_PROXY），国际走代理（127.0.0.1:12334）？
□ 微信DB：query_only=ON？kdf_iter=2？多分片遍历？
```

---

**违反铁律 = 重做。三次违反 = 角色冻结，待用户裁决。**
