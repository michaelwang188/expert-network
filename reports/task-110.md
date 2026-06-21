# #110 Prisma查询注入风险全站扫描

## 结论：A- 级。零 raw SQL ✅，Prisma 参数化全面覆盖。

## 扫描结果

| 检查项 | 结果 |
|--------|------|
| `$queryRaw` | 未使用 ✅ |
| `$executeRaw` | 未使用 ✅ |
| `$queryRawUnsafe` | 未使用 ✅ |
| 字符串拼接 SQL | 无 ✅ |
| 动态 `where` 构建 | `where: any` 弱类型但安全 ✅ |

## 动态 where 审计

| 文件 | 构建方式 | 风险 |
|------|---------|------|
| `experts/route.ts:18-25` | `where.OR = [{title:{contains:search}}]` | 🟢 Prisma 参数化 |
| `experts/route.ts:16-21` | `where.industry1 = industry` | 🟢 等值匹配 |
| `orders/route.ts:13-18` | `where.researcherId = userId` | 🟢 自身上下限 |
| `requests/route.ts:57` | `startsWith: outlineFingerprint` | 🟢 防重复指纹 |

## 🟢 良好实践

- ✅ `$transaction` 仅用于原子操作（orders PATCH + admin assign），非查询
- ✅ `contains`/`startsWith` 由 Prisma 转换为 `LIKE` + 参数绑定
- ✅ `req.json()` 后字段逐一到 `where` — 无直接拼接
- ✅ 无 `ORDER BY` 来自用户输入（全部硬编码）
- ✅ 无 `LIMIT`/`OFFSET` SQL 注入风险（page/limit 先 parseInt）

## 🟡 小问题

- `where: any` 类型应改为严格类型，但非安全风险

## 修复：无
