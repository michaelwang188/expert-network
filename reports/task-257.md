# #257 API限速审计
## 结论：C+ 级。3独立实现，2缺口

| 端点 | 键 | 窗口 | 上限 |
|------|-----|------|------|
| register POST | IP | 10s | 3 |
| orders PATCH | IP | 10s | 5 |
| login | email | 15s | 5 |
| requests POST | ❌ | - | - |
| experts/me PATCH | ❌ | - | - |

修复：统一src/lib/rate-limit.ts + 补2缺口