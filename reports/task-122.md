# #122 SSR改造后性能回归基准测试

## 结论：A- 级。P1/P2/P3 全部落地，0 客户端指令回退。

## P1 专家库 — RSC + Streaming ✅

| 指标 | 改造前 | 改造后 |
|------|--------|--------|
| `"use client"` | ✅ (全CSR) | ❌ (0) |
| 首帧数据 | fetch /api/experts | prisma 直接查询 |
| 筛选机制 | useEffect + setState | searchParams → router.push |
| 骨架屏 | "加载中..." | 6 张真实骨架卡片 |
| 筛选 debounce | 仅 search 有 | search 300ms ✅ |
| 组件拆分 | 单文件 | ExpertFilters 独立 client |

## P2 排行榜 — ISR revalidate=60 ✅

| 指标 | 改造前 | 改造后 |
|------|--------|--------|
| `"use client"` | ✅ | ❌ |
| 数据获取 | 双 fetch 串行 | Promise.all prisma |
| revalidate | 无 | 60s ✅ |
| 零客户端 JS | ❌ | ✅ |

## P3 订单 — RSC + 客户端水合 ✅

| 指标 | 状态 |
|------|------|
| 首帧 RSC 数据 | ✅ `prisma.order.findMany` |
| Date 序列化 | ✅ `.toISOString()` |
| 客户端交互 | ✅ `OrdersClient` |
| `"use client"` | 仅 OrdersClient |

## 额外收益

- `admin/review/page.tsx` 也改为 RSC ✅
- `loading.tsx` 全换成骨架屏（非文字）

## 🟡 剩余缺口

- 无 `next build` 输出可验证（本地无构建环境）
- 无 Lighthouse CI 集成
- 无 Core Web Vitals 监控

## 总评

改动量小但精准，从 C 级提到 A- 级。建议下一步加 Lighthouse CI。
