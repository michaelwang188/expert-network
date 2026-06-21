# #123 CSP安全头兼容性全浏览器测试

## 结论：B+ 级。核心策略合理 ✅，`unsafe-eval`/`unsafe-inline` 降分。

## CSP 逐项审计

| 指令 | 值 | 兼容性 | 评估 |
|------|-----|--------|------|
| `default-src` | `'self'` | 全浏览器 ✅ | 严格，非白名单资源全阻断 |
| `script-src` | `'self' 'unsafe-eval' 'unsafe-inline'` | 全浏览器 | 🟡 unsafe-inline 削弱 XSS 防护 |
| `style-src` | `'self' 'unsafe-inline'` | 全浏览器 | 🟡 同上 |
| `img-src` | `'self' data: https:` | 全浏览器 ✅ | 允许外部图片 |
| `font-src` | `'self' https://fonts.gstatic.com` | 全浏览器 ✅ | Google Fonts 精确白名单 |
| `connect-src` | `'self'` | 全浏览器 ✅ | API 调用仅自身 |

## 浏览器兼容性矩阵

| 浏览器 | CSP 支持 | CSP Level |
|--------|---------|-----------|
| Chrome 120+ | ✅ | Level 3 |
| Firefox 120+ | ✅ | Level 3 |
| Safari 17+ | ✅ | Level 3 |
| Edge 120+ | ✅ | Level 3 |
| IE 11 | ❌ | 不支持（忽略） |

## 🟡 问题

| # | 问题 | 说明 |
|---|------|------|
| C1 | `unsafe-inline` | Next.js RSC 流式渲染需 inline script，但可加 nonce/hash |
| C2 | `unsafe-eval` | 保留供 Webpack HMR，生产应移除 |
| C3 | 无 `report-uri` 或 `report-to` | 无法监控 CSP 违规 |
| C4 | `img-src https:` | 太宽，可用具体域名 |
| C5 | 无 `frame-ancestors` | 已由 `X-Frame-Options: DENY` 覆盖 ✅ |

## 修复

- 生产移除 `unsafe-eval`
- 加 `report-uri /api/csp-report`
- `img-src` 精确化具体域名

工时：15min
