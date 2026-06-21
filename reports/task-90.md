# #90 API路由权限矩阵全量审计

## 结论：B- 级。2 个权限缺口需修复。

## 权限矩阵

| 路由 | GET | POST | PATCH |
|------|-----|------|-------|
| /api/compliance | ADMIN | - | ADMIN |
| /api/experts | ❌公开 | - | ADMIN |
| /api/experts/me | EXPERT | - | EXPERT |
| /api/match | RSRCH+ADMIN | - | - |
| /api/orders | 登录+角色过滤 | - | 登录+角色校验 |
| /api/points | 部分公开 | - | - |
| /api/register | - | 公开+限速 | - |
| /api/requests | ADMIN | RESEARCHER | ADMIN |
| /api/users | ADMIN | - | - |
| /api/notifications/unread-count | 登录 | - | - |

## 🔴 漏洞

### G1: experts GET 零认证
- `src/app/api/experts/route.ts:6` 无 `getServerSession`
- 任何人可 curl 获取全部专家数据（姓名/机构/费率）
- 修复：加 `getServerSession` → 未登录 401

### G2: orders GET 专家空档案泄漏
- 专家 role 但 `expert.findUnique` 返回 null 时，`where` 仍为 `{}`
- 返回全体订单（等于 ADMIN 视图）
- 修复：`if (!expert) return NextResponse.json([])`

## 🟢 已做好
- register safeRole 封堵 ADMIN ✅
- 所有 PATCH 有角色校验 ✅
- compliance/users 仅 ADMIN ✅
- match 仅 RESEARCHER+ADMIN ✅
- points transactions 仅本人或 ADMIN ✅
