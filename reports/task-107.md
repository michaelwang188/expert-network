# #107 全站Rate Limiting策略一致性审计

## 结论：C+ 级。3 个独立限流实现，2 个写端点裸奔。

## 限流矩阵

| 端点 | 键 | 窗口 | 上限 | 响应 | 状态 |
|------|-----|------|------|------|------|
| POST /api/register | IP | 10s | 3 | 429 | ✅ |
| PATCH /api/orders | IP | 10s | 5 | 429 | ✅ |
| POST /api/auth (login) | **email** | 15s | 5 | **null静默** | 🔴 |
| POST /api/requests | - | - | - | - | 🔴 |
| PATCH /api/experts/me | - | - | - | - | 🔴 |

## 🔴 问题

| # | 问题 | 位置 | 影响 |
|---|------|------|------|
| L1 | 登录限流用 email 非 IP | auth.ts L7 | 多账号注册可绕过 |
| L2 | 登录限流静默返回 null | auth.ts L30 | 用户不知被限流，反复尝试 |
| L3 | 无 unified rate limiter | 3 份重复代码 | 维护灾难，参数不一致 |
| L4 | requests POST 零限流 | requests/route.ts | 可脚本灌入垃圾调研 |
| L5 | experts/me PATCH 零限流 | experts/me/route.ts | 可恶意频繁更新档案 |
| L6 | 内存存储，重启清零 | 3 个 Map | 攻击者可趁重启窗口突击 |
| L7 | 无 X-RateLimit-Reset 头 | - | 客户端无法预知恢复时间 |
| L8 | 3 个独立 setInterval | - | 各 60s 清理周期，不一致 |

## 🟢 做得好的

- ✅ register 3/10s 合理（注册为低频操作）
- ✅ orders PATCH 5/10s 合理
- ✅ 均有 `setInterval` 清理防内存泄漏
- ✅ OrdersClient 对 429 有专门处理

## 修复建议

**1. 统一限流模块** (`src/lib/rate-limit.ts`):
- `rateLimit(key, max, windowMs)` → { success, reset }
- 单例管理，全局 60s 清理一个 timer

**2. 补齐缺失限流**:
- requests POST: IP, 5/60s
- experts/me PATCH: userId, 10/60s

**3. 登录限流改为 IP 键 + 返回 429**:
- `auth.ts` authorize 中限流改用 IP + 返回 `new Error('rate_limited')` 可触发 429

**4. 统一响应头**: `X-RateLimit-Reset`

工时：30min
