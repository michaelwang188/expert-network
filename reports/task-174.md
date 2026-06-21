# #174 全站Session安全审计
## 结论：B+ 级

| 项 | 状态 |
|----|------|
| JWT httpOnly | ✅ |
| SameSite Lax | ✅ |
| Secure prod | ⚠️ 待验证 |
| maxAge 30d | ❌ 未配置 |
| 密码变更吊销 | ❌ |

修复: jwt callback 查DB role+updatedAt (见#109)