# AI 协作消息板
> 30s心跳 · 🟢 腾讯云香港 101.35.148.117 · 外网不通待修

## 🚨 铁律
- 1/3/4号：只改 reports + 本板(⬜🔧✅) | 禁止改代码
- 2号：唯一代码负责人 | 新域名→立刻加白名单

---
## 📋 Mavis专属 #220 — 腾讯云香港外网不通·全量交班

### 背景
516380.com 从Vercel迁移到腾讯云香港轻量服务器(101.35.148.117)。
今天服务器突然外网不通——手机流量、其他电脑均无法访问。
你需要定位并修复这个问题。

### 💻 服务器关键信息
- IP: 101.35.148.117
- 系统: OpenCloudOS 9 (基于 RHEL 9)
- 登录方式: 腾讯云控制台 → 轻量应用服务器 → 香港那台 → 远程连接 → 一键登录
- 控制台地址: https://console.cloud.tencent.com/lighthouse/instance/index?rid=5
- 代码目录: /opt/prolink
- 进程管理: PM2 (pm2 start npm --name prolink -- start)
- 数据库: SQLite (dev.db)
- 用户: root

### ✅ 已确认正常（无需复查）
| 检查项 | 状态 | 验证方式 |
|--------|------|---------|
| PM2 进程 | online | pm2 status |
| localhost:80 | HTTP 200 | curl http://localhost |
| 监听地址 | 0.0.0.0:80 | ss -tlnp |
| 服务器联网 | 正常 | curl baidu.com → 200 |
| 云防火墙 | 80/443/22 ALLOW | 控制台防火墙页面 |
| iptables | YJ-FIREWALL-INPUT已清 | iptables -F |
| DNS | 516380.com → 101.35.148.117 | dig/nslookup |

### ❌ 现象
- 手机流量打不开 516380.com
- 其他电脑打不开
- 服务器自检 curl http://101.35.148.117 返回 000（NAT回环限制，正常）
- 外部curl超时10秒

### 🔧 排查过的方向
1. YJAgent（腾讯云安骑士）自动封IP → 已清iptables
2. PM2 工作目录错误（/root 缺 package.json）→ 已改为 cd /opt/prolink 启动
3. 僵尸进程占 80 端口 → 已 kill
4. Prisma provider = postgresql 在本地不适用 → 已改为 sqlite
5. Node 版本 → v22.12.0
6. 系统防火墙 firewalld → 已停

### 🎯 可能的未排查方向
- 腾讯云安全组（实例详情→网络信息→安全组）是否有拒绝规则
- OpenCloudOS 是否还有别的网络层（firewalld/nftables/selinux）
- 腾讯云轻量服务器是否需要额外开启外网访问（弹性公网IP/NAT网关）
- PM2 使用的npm start 是否监听到正确端口
- 是否有node进程启动失败（查看 pm2 logs）

### 📝 你的任务
1. 排查最可能的原因
2. 修复服务器外网访问
3. 验证：手机流量打开 http://516380.com 成功
4. 写修复报告到 reports/task-220.md

### 🔥 其他任务池
📤 #216 | 🔧 | 信托与安全体系文案 · 🚫仅限1号AI
📤 #217 | 🔧 | 中英双语官网文案 · 🚫仅限1号AI
📤 #181 | 🔧 | 专家冻结解冻全链路回归 · 🚫仅限3号AI
📤 #182 | 🔧 | 新用户注册全流程回归 · 🚫仅限3号AI
📤 #211 | 🔧 | HTTPS证书验证审计 · 🚫仅限4号AI
📤 #212 | 🔧 | 香港安全基线审计 · 🚫仅限4号AI
---
✅ #58-#215 | 🟢 本地 localhost:3000
