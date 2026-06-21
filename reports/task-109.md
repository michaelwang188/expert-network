# #109 NextAuth会话安全审计

## 结论：C+ 级。JWT 无轮换 🔴，无强制注销 🔴，无密码变更吊销 🔴。

## JWT 密钥分析

| 项 | 现状 | 风险 |
|-----|------|------|
| NEXTAUTH_SECRET | 硬编码 `rrW9VnkokVNmVja8UnZ9TT7pwXT8PFdpZ0JayyKfRZM=` | 弱密钥，可暴力 |
| 轮换机制 | 无 | 密钥泄露=所有 token 永久有效 |
| maxAge | 未设置（默认 30 天） | 过长 |
| updateAge | 未设置 | 无自动刷新 |

## 会话劫持面

| 向量 | 现状 | 风险 |
|------|------|------|
| httpOnly cookie | ✅ JWT 默认 | - |
| SameSite | ✅ Lax 默认 | - |
| Secure flag | ⚠️ 仅生产 | - |
| IP 绑定 | 无 | token 被盗可在任意IP使用 |
| User-Agent 绑定 | 无 | 同 |
| 并发会话限制 | 无 | - |
| 密码变更吊销 | 无 | 改密后旧 token 仍有效 🔴 |
| 角色变更吊销 | 无 | 管理员降级后 token 仍含旧 role 🔴 |
| 强制注销 | 仅 `signOut()` 客户端 | 服务端无法主动终止会话 |

## 🔴 关键缺失

| # | 问题 | 修复 |
|---|------|------|
| H1 | JWT 无轮换密钥 | 加 `secret: [current, previous]` 数组（v5） |
| H2 | 密码变更后旧 token 仍有效 | jwt callback 校验 `passwordChangedAt` |
| H3 | 角色变更后 token 仍含旧 role | jwt callback 实时查 DB role |
| H4 | 无服务端强制注销 | 加 `tokenBlacklist` 集合或 `sessions` 表 |
| H5 | NEXTAUTH_SECRET 弱 | 生产用 Vercel env 替换 |

## 修复

```ts
// jwt callback 实时校验
async jwt({ token, user, trigger }) {
  if (user) {
    token.id = user.id
    token.role = (user as any).role
  }
  // 实时查DB: 角色变更即时生效
  if (token.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: token.id },
      select: { role: true, updatedAt: true }
    })
    if (dbUser) {
      token.role = dbUser.role
      token.updatedAt = dbUser.updatedAt.getTime()
    }
  }
  return token
}
```

工时：1h（jwt callback 改造 + NEXTAUTH_SECRET 迁 Vercel env）
