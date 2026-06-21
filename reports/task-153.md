# #153 环境变量安全性审计

## 结论：B- 级。gitignore正确✅，但硬编码弱密钥和Vercel OIDC Token🔴

## 审计矩阵

| 文件 | 状态 | 变量数 | 敏感度 |
|------|------|--------|--------|
| .env | 开发配置 | 3 | 🟡 NEXTAUTH_SECRET硬编码 |
| .env.example | 模板 | 5 | 🟢 已脱敏 |
| .env.local | 生产配置 | 19 | 🔴 VERCEL_OIDC_TOKEN明文 |
| .env.production | 不存在 | 0 | 🟢 |

## 🔴 致命问题

| # | 问题 | 位置 | 风险 |
|---|------|------|------|
| P1 | VERCEL_OIDC_TOKEN | .env.local | 完整JWT含project_id+env+owner_info，虽24h过期但泄露即全权访问Vercel |
| P2 | Neon数据库密码 | .env.local PGPASSWORD | 明文postgres密码 |
| P3 | NEXTAUTH_SECRET弱 | .env | base64('rrW9VnkokVNmVja8UnZ9TT7pwXT8PFdpZ0JayyKfRZM=')可暴力 |
| P4 | 19个环境变量冗余 | .env.local | POSTGRES_URL×4重复，NEON_PROJECT_ID泄露架构信息 |

## 🟢 良好实践

- ✅ .env .env.local 已gitignore，git历史无追踪
- ✅ .env.example有脱敏模板
- ✅ 无NEXT_PUBLIC_*暴露客户端
- ✅ DATABASE_URL双环境分离（dev=SQLite，prod=Neon）

## 修复建议

1. P1：删除VERCEL_OIDC_TOKEN → Vercel通过Dashboard注入
2. P3：NEXTAUTH_SECRET=88tvSPE9EDMiBdm4NwnQGK5oZN+oGW1IkDZAd0dOHNo=生成
3. 清理冗余：保留DATABASE_URL+DATABASE_URL_UNPOOLED+NEXTAUTH_SECRET三变量即可

工时：10min
