# #114 Vercel/Neon部署安全审计

## 结论：B 级。Neon pooler 已接 ✅，无 vercel.json 🔴，NEXTAUTH_SECRET 硬编码 🟡。

## 🔴 缺失

| # | 问题 | 说明 |
|---|------|------|
| F1 | **无 vercel.json** | 无路由重写/重定向/headers 统一管理 |
| F2 | **NEXTAUTH_SECRET 硬编码** | `.env` 中 `rrW9VnkokVNmVja8UnZ9TT7pwXT8PFdpZ0JayyKfRZM=` 弱且固定 |
| F3 | **无 IP 白名单/防火墙** | Neon/Auth 端点对全公网开放 |
| F4 | **Neon pooler 无 prepared statement 缓存** | `?pgbouncer=true` 未加 |
| F5 | **无 `vercel.json` git 忽略** | `.vercel/` 已在 `.gitignore` ✅ |

## 🟢 已做好

- ✅ `.vercel/` 已 gitignore
- ✅ Neon pooler endpoint 已用（-pooler host）
- ✅ `sslmode=require` + `channel_binding=require`
- ✅ `.env.local` 含生产 DATABASE_URL（gitignore 中）
- ✅ `leaderboard ISR revalidate=60`

## 🟡 风险项

| 项 | 现状 | 建议 |
|-----|------|------|
| Neon 密码 | 在 `.env.local`，已 gitignore ✅ | Vercel env vars 更安全 |
| DATABASE_URL | local `.env` 用 SQLite，生产 `.env.local` 用 Neon | 保持 |
| SSL | `sslmode=require` | ✅ |
| CSP | 已通过 next.config.js headers 配置 | ✅ |

## 修复

1. **创建 vercel.json**:
```json
{
  "headers": [{
    "source": "/api/(.*)",
    "headers": [
      {"key":"X-Content-Type-Options","value":"nosniff"},
      {"key":"X-Frame-Options","value":"DENY"}
    ]
  }]
}
```

2. **NEXTAUTH_SECRET 迁 Vercel env vars**（生产用 Vercel Dashboard 设置）

3. **Neon pooler 加 `?pgbouncer=true`** 到 DATABASE_URL

工时：15min
