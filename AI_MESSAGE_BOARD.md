# AI 协作消息板
> 🟢 腾讯云香港 101.35.148.117 · Mavis #220接管

## 🚨 铁律
- 1/3/4号：只改 reports + 本板(⬜🔧✅) | 禁止改代码
- 2号：辅助执行 | 新域名→先加白名单

## 🔴 Mavis #220 — 服务器外网不通·全面接管

### 背景
阿里云域名 516380.com 指向腾讯云香港轻量服务器 101.35.148.117。
今天从 Vercel 迁移过来后，服务器 localhost 能跑但外网完全打不开（手机流量也不行）。
用户授权 YOU 来指导，2号AI辅助在服务器窗口执行命令。所有前置上下文如下。

### 服务器环境
- IP: 101.35.148.117 | 系统: OpenCloudOS 9 (RHEL系)
- 登录: 腾讯云控制台 → 轻量应用服务器 → 远程连接 → **一键登录**（免密直进root）
- 控制台: https://console.cloud.tencent.com/lighthouse/instance/index?rid=5
- 代码: /opt/prolink (git clone from github.com/michaelwang188/expert-network)
- Node: v22.12.0 | PM2: 已安装 | nginx: 已安装（现已mask）

### ✅ 已确认正常
| 检查项 | 状态 | 命令 |
|--------|------|------|
| PM2 prolink | online | pm2 status |
| localhost:3000 | 200 | curl http://localhost:3000 |
| 云防火墙 | 80/443/22/8080 ALLOW | 控制台防火墙页 |
| 服务器接外网 | 正常 | curl baidu.com → 200 |
| DNS | 516380.com → 101.35.148.117 | nslookup/dig |
| SELinux | disabled | getenforce |
| firewalld | inactive | systemctl status firewalld |
| nftables | 未安装 | nft 不可用 |
| 22端口外网 | ✅通 | nc -z 101.35.148.117 22 |
| 80端口外网 | ❌不通 | 超时10秒 |
| Ping | ✅通 13ms | ping 101.35.148.117 |

### ❌ 核心故障
80/443/8080端口外网全部超时。22端口外网通。服务器内部一切正常。
这意味着网络层在传输层对HTTP端口做了过滤。

### 🔧 已尝试的修复（均无效）
1. iptables -F YJ-FIREWALL-INPUT — 清空腾讯云安骑士规则
2. systemctl stop firewalld — 系统防火墙
3. 重启服务器 — 刷新网络栈
4. 换8080端口 — 同样超时
5. 云防火墙删了80规则重加 — 无效
6. 把nginx mask掉、用myapp（腾讯云预装Node.js守护）做80→3000反向代理 — myapp能启动但外网仍不通
7. 用Next.js直接监80端口 — 内部200·外网超时
8. Hiddify代理加直连规则 — 手机流量也不行·证明非代理问题

### 🎯 关键线索
- **22通80不通** = HTTP端口被专门过滤
- 腾讯云轻量服务器有两个东西抢80端口: nginx + myapp（预装Node演示App）
- nginx已mask。myapp已stop但会自愈
- 之前`systemctl restart myapp`后外网无效果
- 服务器是**免费套餐**香港轻量·可能有公网端口限制

### 🔥 目前状态
- PM2运行 ecosystem.config.js → 8080端口
- myapp(预装App)已停止
- 80端口被一个旧进程占用 (可能是重启复活)
- Next.js 3000端口可用

### 📝 你的任务
1. 分析根因。给出明确诊断。
2. 告诉用户在服务器窗口执行什么命令（精确、一行一行）。
3. 目标: 手机能打开 http://516380.com。
4. 成功后写 reports/task-220.md。

### 其他任务池
📤 #217 | 🔧 | 中英双语官网文案 · 🚫仅限1号AI
📤 #223 | 🔧 | PM2进程守护配置审计 · 🚫仅限4号AI
---
✅ #58-#215 | 🟢 本地 localhost:3000
