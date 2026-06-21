# #89 CSRF Token中间件审计


## 审计结论
**🔴 严重：8 个写操作无 CSRF 保护**

## 攻击面
| 文件 | 方法 | 权限 |
|------|------|------|
| admin/audit/page.tsx | PATCH | ADMIN |
| admin/review/page.tsx | PATCH | ADMIN |
| admin/experts/page.tsx | PATCH | ADMIN |
| admin/orders/page.tsx | PATCH | ADMIN |
| register/page.tsx | POST | 公开 |
| request/page.tsx | POST | RESEARCHER |
| experts/edit/page.tsx | PATCH | EXPERT |
| orders/OrdersClient.tsx | PATCH | 全员 |

## 安全模型分析
- NextAuth JWT → session token 存储在 cookie (SameSite=Lax 默认)
- Lax 在 `<a>` 和 `<form method="GET">` 导航时发 cookie
- 但 POST 从跨站提交不会发 cookie（Lax 保护）
- ✅ Server Actions (`<form action={fn}>`) 自带 Next.js CSRF
- 🔴 8 处 `fetch()` 无额外 CSRF header

## 修复方案（最小可行）
### 1. `src/lib/csrf.ts`
- SHA256(cookie-token + secret) 生成csrf token
- `generateCsrfToken()` / `validateCsrfToken(token)` 两个函数

### 2. `src/middleware.ts`
- GET 请求设置 `csrf-token` cookie
- 非 GET 请求校验 header `X-CSRF-Token` === cookie `csrf-token`

### 3. 前端 `src/lib/api.ts`
- 封装 `fetch()` 自动从 cookie 读 token 加到 `X-CSRF-Token` header
- 替换 8 处裸 fetch

## 工时 1.5h
