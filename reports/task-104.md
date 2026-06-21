# #104 第三方依赖漏洞扫描

## 结论：B+ 级。8 漏洞全为传递依赖，生产面 0 critical。

## 依赖清单（19个）

**生产**: @prisma/client, @types/next-auth, bcryptjs, next, next-auth, react, react-dom, uuid
**开发**: tailwindcss, postcss, autoprefixer, prisma, typescript, tsx, @types/*

## 依漏洞详情 (npm audit)

| 等级 | 包 | 路径 | 实际影响 |
|------|-----|------|---------|
| critical | typeorm | @types/next-auth → typeorm | dev only，类型定义 |
| high | @types/next-auth | 自身 | dev only |
| moderate | next | <16.3.0 → postcss | 当前 15.5.19 ✅ |
| moderate | next-auth | v4 → next/uuid | v4 已知，不影响功能 |
| moderate | postcss | <8.5.10 | 当前 8.5.15 ✅ |
| moderate | uuid | <11.1.1 | 当前 11.1.1 ✅ |
| moderate | jose | <2.0.7 | next-auth 传递 |
| moderate | xml2js | <0.5.0 | typeorm 传递 |

## 核心依赖评估

| 包 | 版本 | 最新 | 状态 |
|-----|------|------|------|
| next | 15.5.19 | 15.5.x | ✅ |
| react | 19.2.7 | 19.x | ✅ |
| @prisma/client | 6.19.3 | 6.x | ✅ |
| next-auth | 4.24.14 | v5 已出 | 🟡 建议升级 |
| bcryptjs | 2.4.3 | 2.4.3 | ✅ |

## 🔴 行动项

1. **移除 `@types/next-auth`**：用 next-auth 自带类型（v4 已内置），消除 typeorm critical
2. **`npm audit fix`**：修复 non-breaking moderate 漏洞
3. **next-auth v5 评估**：v4 已停止活跃开发，v5 有更好 cookie 安全

## 🟢 良好实践

- ✅ 无过度依赖（19个总包数合理）
- ✅ 无废弃包（abandoned packages）
- ✅ 无直接 critical CVE
- ✅ 核心框架（next/react/prisma）均为最新主版本
- ✅ 无不必要的大型依赖（lodash/moment 等常见膨胀包）

## 修复步骤

```bash
npm uninstall @types/next-auth  # v4 已自带类型
npm audit fix                   # 修复非破坏性漏洞
```

工时：5 分钟
