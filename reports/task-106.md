# #106 Next.js middleware安全链审计

## 结论：C+ 级。零 middleware 🔴，认证散落各处。

## 现状

**`src/middleware.ts` 不存在**。认证链完全分散在：
- 每个 API route 手动 `getServerSession` + 角色检查
- `admin/layout.tsx` 独立 ADMIN 检查
- `AuthGuard` 客户端组件兜底未登录重定向

## 🔴 问题

| # | 问题 | 后果 |
|---|------|------|
| M1 | 无 middleware.ts | 路由保护靠"事后检查"，攻击者可提前访问页面骨架 |
| M2 | API 认证检查重复 10+ 次 | 新增 API 易遗漏权限检查 |
| M3 | 无统一日志/审计记录 | 无请求级跟踪 |
| M4 | 无统一限流层 | 限流散落在 register/orders 各自实现 |
| M5 | 无 CORS 统一配置 | 依赖 Vercel 默认 |

## 🟢 做得好的

- ✅ `admin/layout.tsx` 用 RSC 检查，性能最优
- ✅ `AuthGuard` 客户端保底
- ✅ 每个 API route 独立权限检查（冗余但安全）
- ✅ layout RSC 不泄漏任何数据

## 建议 middleware 架构

```ts
// src/middleware.ts
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // 日志: req.url + timestamp
    // ADMIN 路由保护
    if (req.nextUrl.pathname.startsWith('/admin')) {
      if (req.nextauth.token?.role !== 'ADMIN') {
        return NextResponse.redirect('/dashboard')
      }
    }
    return NextResponse.next()
  },
  {
    callbacks: { authorized: ({ token }) => !!token },
    pages: { signIn: '/login' },
  }
)

export const config = {
  matcher: ['/dashboard/:path*','/admin/:path*','/profile/:path*',
            '/orders/:path*','/experts/:path*','/request/:path*',
            '/api/orders/:path*','/api/experts/:path*','/api/requests/:path*']
}
```

**收益**: 路由保护前置 + API 认证可逐步移除冗余检查 + 统一限流可插

工时：1h
