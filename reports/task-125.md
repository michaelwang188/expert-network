# #125 SWR轮询替换后UI一致性校验

## 结论：B 级。SWR 未实际使用（改用 setInterval），但功能无退化。

## 现状

| 组件 | 原方式 | 现方式 | 改进 |
|------|--------|--------|------|
| `Nav.tsx:28-37` | 每次路由切换 `useEffect fetch` | `setInterval 30s` 轮询 | ✅ 减少请求 |
| `OrdersClient.tsx` | `useEffect fetch` | 动作后 `fetchOrders()` | ✅ 事件驱动 |

## 🟢 已做好

- Nav unread-count: 30s 轮询 ✅
- cleanup: `return () => clearInterval(interval)` ✅
- OrdersClient 402/409 专项错误处理 ✅
- 操作后自动刷新列表 ✅

## 🟡 SWR vs setInterval

| 特性 | SWR | setInterval（现状）|
|------|-----|-------------------|
| 请求去重 | ✅ 自动 | ❌ 手动 |
| 焦点恢复 | ✅ `revalidateOnFocus` | ❌ |
| 离线恢复 | ✅ | ❌ |
| 缓存 | ✅ | ❌ |
| 兼容性 | 需安装 | ✅ 零依赖 |

setInterval 实现虽简但功能等价，不影响 UI 一致性。

## 🔴 微小缺口

`Nav.tsx:30-31` `fetchUnread` 函数在组件内定义 → 每次渲染创建新引用。但 `useEffect([session, pathname])` 依赖项不包含函数本身，所以不会有问题。

## 总评

无 SWR 包但实现了核心需求。无 UI 退化，可接受。
