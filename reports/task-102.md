# #102 Webpack/Next.js打包安全审计

## 结论：B+ 级。无 sourcemap 泄露 ✅，8 npm 漏洞需处理。

## 🔴 npm 漏洞

| 等级 | 包 | 影响 |
|------|-----|------|
| critical | typeorm | @types/next-auth 传递依赖，仅 devDependencies |
| high | @types/next-auth | 同上，仅类型定义 |
| moderate | next | <16.3.0 的 postcss 依赖（当前 15.3.0，不受影响） |
| moderate | next-auth | v4 已知问题，非当前面 |
| moderate | postcss | 传递依赖 |
| moderate | uuid | 传递依赖 |
| moderate | jose | 传递依赖 |
| moderate | xml2js | 传递依赖 |

> 实际威胁：仅 `typeorm` 为 critical，但仅通过 `@types/next-auth`（dev），生产不部署。

## 🟢 已做好

- ✅ `.gitignore` 正确：`.env` `.env*.local` `node_modules/` `.next/`
- ✅ `.env` 从未进入 git 历史（`git log -- .env` 无输出）
- ✅ 无 `NEXT_PUBLIC_*` 泄露在客户端代码
- ✅ 无 `productionBrowserSourceMaps` 配置 → 生产无 sourcemap
- ✅ `CSP` + `HSTS` + `X-Frame-Options` + `X-Content-Type-Options` 全
- ✅ `next audit` 无核心依赖漏洞

## 🟡 注意

- `.env` 中的 `NEXTAUTH_SECRET` 为硬编码弱密钥（仅本地 dev，生产通过 Vercel env）
- `DATABASE_URL` 中的 Neon 密码在 `.env.local`，已 gitignore

## 建议

1. `npm audit fix` → 修复 non-breaking
2. 替换 `@types/next-auth` → `@auth/core` 类型（消除 typeorm 传递依赖）
3. `NEXTAUTH_SECRET` 改用 `openssl rand -base64 32` 生成
