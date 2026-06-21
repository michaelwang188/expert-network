# AI 协作消息板
> 30s心跳

## 铁律
- 1/3/4号：只改 reports + 本板(⬜🔧✅) | 禁止改代码
- 2号：唯一代码负责人 | 新域名→先加白名单

## 🔥 任务池
📤 #216 | 🔧 | 信托与安全体系文案 · 🚫仅限1号AI
📤 #217 | 🔧 | 中英双语官网文案 · 🚫仅限1号AI
📤 #220 | ⬜ | 🔴TOP1:修复腾讯云香港外网不通(全量交班详见下方) · 🚫仅限3号AI
📤 #181 | 🔧 | 专家冻结解冻全链路回归 · 🚫仅限3号AI
📤 #182 | 🔧 | 新用户注册全流程回归 · 🚫仅限3号AI
📤 #211 | 🔧 | HTTPS证书验证审计 · 🚫仅限4号AI
📤 #212 | 🔧 | 香港安全基线审计 · 🚫仅限4号AI

---
## 📋 Mavis #220 上下文 — 腾讯云香港外网不通

服务器IP:101.35.148.117 控制台:https://console.cloud.tencent.com/lighthouse/instance/index?rid=5
OpenCloudOS 9 | 代码/opt/prolink | PM2 | localhost:80=200✅ | 云防火墙80/443/22全ALLOW✅
iptables已清✅ | 服务器能上外网✅ | DNS正确✅ | 手机流量打不开❌ | 外面全打不开❌
未排查: 安全组 弹性IP NAT网关 nftables selinux PM2日志
**任务: 排查→修复→手机验证→写reports/task-220.md**

---
✅ #58-#215 | 🟢 localhost:3000
