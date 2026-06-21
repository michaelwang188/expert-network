---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: 4cbe441250541d6ade1ba2bbd6ac24f1_6fa41cb56d4f11f1a99c5254007bceed
    ReservedCode1: xD57ttnQ2FC2pJBRTX6Apt0NBLaayYqVwmtidlM6zrt0jutc7mWHtA7sI48LmzvX4H6mzNrW/dliuY42MMKUjRrIS+LAqIs5nU6KXgzhdUmqsjIQyR7y8g1bhOZj65lGMGgA5oEr5RyHmrnXMjz1Pn9YGVPbq7zlO7tVyur8PDc7/iozIIDLNwHW588=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: 4cbe441250541d6ade1ba2bbd6ac24f1_6fa41cb56d4f11f1a99c5254007bceed
    ReservedCode2: xD57ttnQ2FC2pJBRTX6Apt0NBLaayYqVwmtidlM6zrt0jutc7mWHtA7sI48LmzvX4H6mzNrW/dliuY42MMKUjRrIS+LAqIs5nU6KXgzhdUmqsjIQyR7y8g1bhOZj65lGMGgA5oEr5RyHmrnXMjz1Pn9YGVPbq7zlO7tVyur8PDc7/iozIIDLNwHW588=
---

# Task #220: 修复腾讯云香港服务器外网不通

**状态**: 🔧 诊断中 | **优先级**: 🔴 紧急 | **日期**: 2026-06-21

## 诊断结论

22端口外网通，80/443/8080全部超时。SELinux(disabled)、firewalld(inactive)、nftables(未安装)、iptables(已清空)、云防火墙(全部ALLOW)均已排除。

**根因判断**：拦截不在服务器层面，在腾讯云基础设施层。最大嫌疑：
1. **免费套餐轻量服务器端口白名单限制**（概率最高）
2. **安全组规则**（与轻量防火墙不同，需在CVM安全组页面检查）

## 验证方案

### A. 套餐端口测试（服务器端）
测试非标准端口是否可达：

```
# 1. 用nc监听一个非标准端口测试外网
nc -l -p 22222 &
# 然后从本地测试：nc -z -w5 101.35.148.117 22222
```

### B. 腾讯云控制台检查
2号AI请登录控制台检查：
- 轻量服务器 → 更多 → 查看安全组 → 入站规则
- 套餐详情 → 是否有公网端口限制说明

## 解决方案（按优先级）

### 方案1：Cloudflare Tunnel（推荐，免费）
绕过腾讯云端口限制：
1. 安装 cloudflared
2. 创建隧道指向 localhost:3000
3. DNS CNAME 指向隧道

### 方案2：升级套餐
如确认是免费套餐限制，升级到基础套餐（约30元/月）

### 方案3：nginx反向代理到22端口
利用22端口已通的特性，但会与SSH冲突

## 执行日志
- [x] 外部诊断：Ping通、DNS正确、TCP 80超时
- [x] 8项内部检查全部正常
- [x] 8种修复方案已尝试均无效
- [ ] 验证非标准端口外网可达性
- [ ] 确认是否为套餐限制
*（内容由AI生成，仅供参考）*
