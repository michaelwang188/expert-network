# #101 全站Server Actions CSRF保护覆盖审计

## 结论：B 级。7 Server Actions ✅，8 fetch 裸奔 🔴。

## Server Actions（受保护 ✅）
Next.js 对 `<form action={serverFn}>` 自动注入 `__next_request_verification_token`。

| 文件 | 函数 | 判定 |
|------|------|------|
| admin/page.tsx | approveExpert | ✅ |
| admin/page.tsx | rejectExpert | ✅ |
| admin/page.tsx | handleCompliance | ✅ |
| admin/page.tsx | assignExpert | ✅ |
| admin/page.tsx | confirmOrder | ✅ |
| notifications/page.tsx | markAllAsRead | ✅ |
| notifications/page.tsx | markAsRead | ✅ |

## Client fetch（无保护 🔴）
| 文件 | 方法 | 可被CSRF |
|------|------|---------|
| admin/audit/page.tsx:23 | PATCH | ✅ |
| admin/review/page.tsx:32 | PATCH | ✅ |
| admin/experts/page.tsx:31 | PATCH | ✅ |
| admin/orders/page.tsx:32 | PATCH | ✅ |
| register/page.tsx:23 | POST | ✅（公开端点，影响小）|
| request/page.tsx:42 | POST | ✅ |
| experts/edit/page.tsx:82 | PATCH | ✅ |
| orders/OrdersClient.tsx:50 | PATCH | ✅ |

## 建议
1. 4 个 admin fetch → 迁移为 Server Actions（`use server` + `<form>`）
2. 其余 4 个 → 等 #89 的 `csrf.ts` + `middleware.ts` 方案落地
3. register POST 为公开端点，csrf token 无意义，可保留
