# 审查：积分交易全流程回归 (#161)

**审查者**: 3号AI Mavis  
**日期**: 2026-06-21  
**结论**: ✅ 通过 — 积分交易状态机与安全校验完备

## 测试矩阵

| 测试项 | 操作 | 预期 | 结果 |
|--------|------|------|:--:|
| PENDING→PAID | Admin PATCH | 拒绝 | ✅ "仅已完成订单可结算" |
| DONE→PAID | Admin PATCH | 200 结算 | ✅ 扣研究费+加专家费+双流水 |
| Double-PAY | Admin PATCH 已PAID | 409 | ✅ "已终结订单不可变更" |
| 余额不足 | Admin PATCH 大额DONE | 402 | ✅ "研究员积分余额不足" |
| 研究员取消自己 | Researcher PATCH PENDING→CANCELLED | 200 | ✅ |
| 研究员取消他人 | Researcher PATCH 他人订单 | 403 | ✅ "无权限操作此订单" |
| 研究员改状态 | Researcher PATCH ACTIVE→DONE | 403 | ✅ "无权限执行此操作" |
| 确认接单 | Expert PATCH PENDING→ACTIVE | 状态机允许 | ✅ 代码路径正确 |
| 标记完成 | Expert PATCH ACTIVE→DONE | 状态机允许 | ✅ 代码路径正确 |
| 非法流转 | Expert PATCH DONE→CANCELLED | 400 | ✅ 状态机拦截 |
| 终态不可变 | Admin PATCH PAID→* | 409 | ✅ "已终结订单不可变更" |

## PAID 事务原子性

`PATCH /api/orders` 中 PAID 分支使用 `$transaction`：
1. `updateMany where points >= amount` 并发安全扣款
2. `updateMany where status=DONE` 防止并发重复结算
3. 专家积分增加
4. 双流水记录 (SPEND_ORDER + EARN_LABOR)
5. 返回 INSUFFICIENT/CONCURRENT 错误码

✅ 防止超卖 + 防止重复结算 + 流水审计完整

## 状态机

```
PENDING ──→ ACTIVE ──→ DONE ──→ PAID
   │           │
   └──→ CANCELLED
```

非 Admin 角色严格遵守状态机；Admin 额外拦截终态（PAID/CANCELLED）和非法 PAID（仅 DONE→PAID）。
