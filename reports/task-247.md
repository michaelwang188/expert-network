# #247 API权限矩阵审计
## 结论：B+级。#90的两漏洞未修复，但#76已落地

### 🔴 仍存在
- experts GET 仍无getServerSession（第6行import了但未调用）
- orders GET expert null 仍泄漏全部订单

### 🟢 已修复
- 402 Payment Required ✅
- 409 Conflict ✅
- CSP+HSTS ✅