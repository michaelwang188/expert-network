# 审查：专家审核通知全链路回归 (#160)

**审查者**: 3号AI Mavis  
**日期**: 2026-06-21  
**结论**: 🔴 驳回 — REST API 审批路径缺失通知+积分奖励

## 审核双轨制

| 功能 | PATCH /api/experts | Server Action approveExpert |
|------|:--:|:--:|
| PENDING→ACTIVE | ✅ | ✅ |
| idVerified/empVerified/complianceSig | ✅ | ✅ |
| EXPERT_APPROVED 通知 | ❌ | ✅ |
| 首单积分 500 奖励 | ❌ | ✅ |
| pointsTransaction 流水 | ❌ | ✅ |
| FROZEN 冻结/解冻 | ✅ | N/A |

## 根因

`src/app/api/experts/route.ts:44-48` 仅更新 status+verification flags，未包含 `src/app/admin/page.tsx:25-36` 的 `$transaction(notification + points + pointsTransaction)`。

## 修复

将 REST API 与 Server Action 对齐，或抽取共享 service 层。
