# #248 DB N+1扫描
## 结论：B级。register通知循环未修复

### 🔴 register/route.ts L93-103
for (const admin of admins) { await prisma.notification.create(...) }
仍为N+1。修复：createMany替代for循环。