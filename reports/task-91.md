# #91 前后端数据序列化安全审计

## 结论：B+ 级。orders RSC 序列化规范 ✅，2 处小缺口。

## 🔴 序列化风险

| # | 位置 | 问题 |
|---|------|------|
| S1 | `orders/page.tsx:16-21` | 手动 `.toISOString()` 序列化 → 易遗漏新增字段 |
| S2 | `experts/me/route.ts:54-61` | `body.org \|\| ""` 无类型校验 → `{org: [1,2,3]}` 会直接入库 |

## 输入面审计

| API | body 校验 | 结论 |
|-----|----------|------|
| register | String()+replace+slice ✅ | 🟢 |
| register | 邮箱正则 ✅ | 🟢 |
| register | safeRole 白名单 ✅ | 🟢 |
| experts/me PATCH | 字段白名单 ✅ | 🟢 |
| requests POST | outline fingerprint ✅ | 🟢 |
| requests POST | 敏感词 74 词库 ✅ | 🟢 |
| orders PATCH | status 白名单 (switch) ✅ | 🟢 |
| compliance PATCH | handled boolean ✅ | 🟢 |

## 🔴 修复

### S1: 用 superjson 替代手动序列化
- `orders/page.tsx` 的 6行 `.toISOString()` 可用 `superjson` 单行替代
- 自动 Date/Map/Set/BigInt 序列化

### S2: experts/me PATCH 加类型校验
- `typeof body.years === 'number'` 校验
- `typeof body.org === 'string'` 校验

## 🟢 非问题
- Prisma 自带 SQL 注入防护 ✅
- React JSX 自动实体转义 ✅
- `req.json()` 返回 POJO，无 `__proto__` 污染风险 ✅
