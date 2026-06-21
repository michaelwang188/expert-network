# #92 Prisma N+1查询全站扫描

## 结论：B+ 级。1 处 N+1 🔴，其余优良。

## 🔴 N+1 漏洞

| # | 位置 | 问题 | 严重度 |
|---|------|------|--------|
| N1 | `register/route.ts:92-103` | `for (admin of admins) { await prisma.notification.create(...) }` — N个管理员=N次DB写入 | 🔴 中 |

```typescript
// 现状（N+1）
const admins = await prisma.user.findMany(...)
for (const admin of admins) {
  await prisma.notification.create({ data: { userId: admin.id, ... } })
}
// → 修复：notification.createMany
await prisma.notification.createMany({
  data: admins.map(a => ({ userId: a.id, type: "EXPERT_PENDING", ... }))
})
```

## 🟢 已优化

- orders PATCH `$transaction` + `updateMany` 原子扣分 ✅
- `notifications/page.tsx:31` `updateMany` 批量已读 ✅
- `admin/page.tsx` 5 个 `Promise.all` 并行查询 ✅
- 全站 `include`/`select` 已正确使用 ✅
- orders page RSC 单次 `findMany` + `include` ✅

## 🟡 审查项（无问题）

| 位置 | 操作 | 判定 |
|------|------|------|
| orders GET `include: {researcher, expert, request}` | 单次查询 | 🟢 |
| admin dashboard 5x Promise.all | 并行 | 🟢 |
| experts/me upsert | 单行操作 | 🟢 |
| points GET `select` | 按需字段 | 🟢 |
| users GET `select` | 按需字段 | 🟢 |
| requests GET `include researcher select` | 按需字段 | 🟢 |

## 修复

`register/route.ts` 第93-103行：`prisma.notification.createMany` 替代 `for...create`

工时：5分钟
