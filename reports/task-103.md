# #103 Cookie/Storage安全策略审计

## 结论：B+ 级。NextAuth 默认安全 ✅，无客户端存储滥用 ✅。

## Cookie 配置分析

| 属性 | 值 | 来源 |
|------|-----|------|
| httpOnly | ✅ true | NextAuth JWT 默认 |
| sameSite | ✅ Lax | NextAuth 默认 |
| secure | ⚠️ 取决于 NEXTAUTH_URL | 生产应 https |
| path | `/` | 默认 |
| name | `next-auth.session-token` | 默认 |
| strategy | JWT | 显式配置 |

## 🟢 已做好

- ✅ 无 `localStorage`/`sessionStorage` 使用
- ✅ 无 `document.cookie` 手动操作
- ✅ JWT token 存在 httpOnly cookie，JS 不可读
- ✅ `SessionProvider` 仅客户端 React Context，不持久化
- ✅ 登录限速：同邮箱 15s 内 5 次静默拒绝

## 🔴 缺失

| # | 问题 | 修复 |
|---|------|------|
| C1 | `authOptions` 无显式 `cookies` 配置 | 显式声明，确保生产 `secure: true` |
| C2 | 无 `session.maxAge` | 加 `maxAge: 30 * 24 * 60 * 60` (30天) |
| C3 | 登出后无 cookie 清理验证 | 依赖 NextAuth 默认 signOut |

## 修复

```ts
// src/lib/auth.ts 加:
cookies: {
  sessionToken: {
    name: '__Secure-next-auth.session-token',
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    },
  },
},
session: {
  strategy: 'jwt',
  maxAge: 30 * 24 * 60 * 60, // 30天
},
```

工时：5分钟
