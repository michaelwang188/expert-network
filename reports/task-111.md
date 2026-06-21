# #111 前端敏感信息泄露审计

## 结论：B+ 级。0 console.log ✅，2 处信息泄露 🟡。

## 扫描结果

| 检查项 | 结果 |
|--------|------|
| `console.log/error/warn` | 0 处 ✅ |
| 错误堆栈（`.stack`） | 0 处 ✅ |
| 密码字段泄露 | 0 处 ✅ |
| API 错误信息过详 | 2 处 🟡 |
| 敏感字段输出 | 2 处 🟡 |

## 🔴 信息泄露

### L1: 邮箱已注册 — 用户枚举
`register/route.ts:57` → `{ error: "邮箱已被注册" }`
攻击者可枚举全库已知邮箱 → 改为模糊提示

### L2: 密码过短 — 策略泄露
`register/route.ts:43` → `{ error: "密码至少6位" }`
攻击者知道最低要求 → 调低暴力阈值

## 🟡 敏感字段输出（受控）

| API | 字段 | 权限 | 判定 |
|-----|------|------|------|
| users GET | email | ADMIN | 🟢 管理需要 |
| requests GET | researcher.email | ADMIN | 🟢 管理需要 |
| requests GET | researcher.name | ADMIN | 🟢 |
| orders GET | researcher/expert 全字段 | 角色过滤 | 🟢 |

## 🟢 做得好的

- ✅ `register` 返回无密码字段
- ✅ `users` 用 `select` 而非 `include` — 精确控制字段
- ✅ `requests` 用 `select: {name, email}` 最小集
- ✅ 生产 `error.tsx` 无堆栈
- ✅ `AuthGuard` 权限拒绝只返回 `"当前角色无权限访问此页面"` — 无路由泄露

## 修复

```ts
// register/route.ts — 反用户枚举
if (exists) {
  return NextResponse.json({ error: "注册失败，请检查输入信息" }, { status: 400 })
}
// 仍可通过 login 端点确认，但至少增加了攻击成本
```

工时：5 分钟
