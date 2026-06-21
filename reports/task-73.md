# 审查 #23: 订单状态流转全路径回归 (#73)

**审查者**: 3号AI Mavis  
**日期**: 2026-06-21  
**结论**: 🔴 驳回 — 管理员状态机存在反向跳转漏洞

---

## 测试方法

curl 模拟 admin / researcher / expert 三角色登录，对 PATCH `/api/orders` 进行状态转移测试。

---

## 状态机定义

| 当前状态 | 允许→ | 来源 |
|----------|-------|------|
| PENDING | ACTIVE, CANCELLED | 非管理员状态机 |
| ACTIVE | DONE, CANCELLED | 非管理员状态机 |
| DONE | (仅PAID) | 管理员状态机 |
| PAID | — | 终态 |
| CANCELLED | — | 终态 |

---

## 测试结果

### 合法流转 ✅

| 测试 | 路径 | HTTP | 结果 |
|------|------|------|------|
| T1-A | PENDING → ACTIVE (admin) | 200 | ✅ |
| T2-A | ACTIVE → DONE (admin) | 200 | ✅ |
| T3-A | DONE → PAID (admin) | 200 | ✅ |
| T4-A | PENDING → CANCELLED (admin) | 200 | ✅ |
| T1-E | Expert 确认 ACTIVE → DONE | 200 | ✅ |
| T5-R | Researcher 取消自己 PENDING | 200 | ✅ |

### 权限隔离 ✅

| 测试 | HTTP | 错误信息 |
|------|------|----------|
| Researcher cannot ACTIVE own order | 403 | 无权限执行此操作 |
| Expert cannot modify other expert order | 403 | 无权限操作此订单 |

### 终态保护 ✅

| 测试 | HTTP | 错误信息 |
|------|------|----------|
| PAID → ACTIVE | 409 | 已终结订单不可变更 |
| PAID → DONE | 409 | 已终结订单不可变更 |
| PAID → PENDING | 409 | 已终结订单不可变更 |
| CANCELLED → ACTIVE | 409 | 已终结订单不可变更 |
| PENDING → PAID (跳过) | 400 | 仅已完成订单可结算 |

---

## 漏洞发现 🔴

### 漏洞1: 管理员可执行 DONE → ACTIVE 回退

```
PATCH /api/orders {"orderId":"cmqlxgtkp...","status":"ACTIVE"}
HTTP 200 ← 应返回 400/409
```

**根因**: `src/app/api/orders/route.ts` 第 108-115 行管理员状态机仅拦截终态（PAID/CANCELLED）和 PAID 前置条件，未拦截 DONE → ACTIVE 这种非法回退。

### 漏洞2: 管理员可执行 ACTIVE → PENDING 回退

```
PATCH /api/orders {"orderId":"cmqms08wy...","status":"PENDING"}
HTTP 200 ← 应返回 400/409
```

**根因**: 同上，管理员状态机缺少正向流转约束。

---

## 修复建议

在管理员分支补充完整状态机：

```typescript
if (role === "ADMIN") {
    const terminalStates = ["PAID", "CANCELLED"];
    if (terminalStates.includes(existing.status)) {
      return NextResponse.json({ error: "已终结订单不可变更" }, { status: 409 });
    }
    // 🆕 管理员正向流转约束
    const adminAllowed: Record<string, string[]> = {
      PENDING: ["ACTIVE", "CANCELLED"],
      ACTIVE: ["DONE", "CANCELLED"],
      DONE: ["PAID"],
    };
    const allowed = adminAllowed[existing.status] || [];
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: `不允许从 ${existing.status} 直接变更为 ${status}` }, { status: 400 });
    }
}
```

---

## 覆盖情况

| 维度 | 测试数 | 覆盖 |
|------|--------|------|
| 管理员流转 | 9 | 全覆盖 |
| 研究员流转 | 2 | 覆盖 |
| 专家流转 | 3 | 覆盖 |
| 终态保护 | 5 | 全覆盖 |
| FROZEN 专家 | 0 | ⚠️ 无可冻结专家实例 |

---

**commit**: 待修复后提交
