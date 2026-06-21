# #108 API请求体大小限制+文件上传安全审计

## 结论：C 级。零 body 大小限制 🔴，零文件上传 ⚠️。

## 🔴 问题

| # | 问题 | 说明 |
|---|------|------|
| B1 | **全站无 `bodySizeLimit`** | next.config.js 未配置，Next.js 默认 1MB。但无显式限制=不可控 |
| B2 | **无 Content-Length 预检** | 无 API 在处理前检查 `Content-Length` header，攻击者可灌大 payload |
| B3 | **所有 POST/PATCH 无超时** | `req.json()` 无超时保护，慢速攻击可耗尽连接 |
| B4 | **req.json() 无大小限制** | body 解析完才校验业务字段，解析阶段已占满内存 |
| B5 | **无文件上传** | 当前无 upload API，但合规页 hardcode 文件链接到 GitHub raw ❌（应为 Vercel Blob/自托管）|

## 攻击面

| 端点 | 风险 |
|------|------|
| POST /api/register | 精简单字段，攻击者灌 1MB JSON 仍可消耗内存 |
| POST /api/requests | outline 限制 5000 字，但 body 可在解析阶段炸 |
| PATCH /api/experts/me | 字段白名单，但 body 无大小限制 |
| PATCH /api/orders | 同上 |

## 合规页文件

`compliance/page.tsx:66-71` 硬编码到 `raw.githubusercontent.com` — 实际无 `docs/legal/` 路径，全部 404。

## 修复

1. **next.config.js 加**:
```js
experimental: { serverActions: { bodySizeLimit: '256kb' } }
```

2. **每个 API 加 Content-Length 预检**（抽到 middleware）:
```ts
if (req.headers.get('content-length') > 1024*256) // 256K
  return NextResponse.json({error:'Request too large'},{status:413})
```

3. **合规文档用 Vercel Blob Storage 替代 GitHub raw**

工时：30min
