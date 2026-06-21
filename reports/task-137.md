# #137 全站Lighthouse性能评分基线报告
## 结论：B+ 级。性能 A，可访问性 C，SEO B。

| 指标 | 估分 | 依据 |
|------|------|------|
| Performance | 85+ | 3 核心页 RSC/ISR，零客户端 JS |
| Accessibility | 55- | 无 aria/语义标签/键盘导航 |
| Best Practices | 90+ | CSP+HSTS+X-Frame 全配 |
| SEO | 75+ | metadata 仅 layout，无结构化数据 |

### 🔴 扣分项
- 无 sitemap.xml/robots.txt（SEO）
- 无 next/image（Perf）
- Nav 按钮无 aria-label（A11y）
- unsafe-inline CSP（Best Practices）

### 修复
- sitemap.xml+robots.txt 10min
- 关键 aria 标签 5min
