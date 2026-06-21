# #134 全站API端点错误注入测试

## 结论：C+ 级。7/11 API 零 try/catch 🔴

## try/catch 覆盖率

| API | try/catch | 风险 |
|-----|-----------|------|
| register | ✅ (req.json+prisma) | 唯一完善 |
| requests | ❌ | Prisma 异常 → 500 |
| orders | ❌ | 事务异常 → 500 |
| compliance | ❌ | 无保护 |
| experts | ❌ GET零 | 死库连接 → 500 |
| experts/me | ❌ | 无保护 |
| points | ❌ | 排行榜公开面 |
| match | ❌ | 无保护 |
| users | ❌ | 管理面 |
| notifications | ❌ | 前端轮询30s |
| auth | N/A | NextAuth内置 |

## 注入场景

| 场景 | 表现 | 影响 |
|------|------|------|
| DB连接断开 | Prisma抛异常 → Next.js默认500页 | 全站不可用 |
| 超时查询 | Prisma默认无超时 → 请求挂起 | Serverless函数超时($) |
| 大结果集 | 无分页 → 内存爆 | OOM |
| 并发突增 | 无连接池配置(已审#78) | 连接耗尽 |

## 修复

- API层加全局error boundary
- Prisma查询超时: query_timeout
- 跟#78合并修

工时：1h
