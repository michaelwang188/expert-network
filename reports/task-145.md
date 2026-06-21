# #145 全站TypeScript strict兼容性扫描
## 结论：B 级。strict:true ✅，但 any 泛滥

| 项 | 数量 | 评估 |
|----|------|------|
| state<any> | 8+ | 🟡 |
| as any (role) | 14+ | 🟡 |
| asserte non-null (!) | 0 ✅ | |
| ts-ignore | 0 ✅ | |
| prisma findMany any | 3 | 🟡 |

### 核心问题
- role: as any 链因 next-auth v4 类型狭窄
- 修复：v5 升级或 declare module 扩展

### 修复
- next-auth.d.ts 声明扩展
- prisma 查询加 select 类型
