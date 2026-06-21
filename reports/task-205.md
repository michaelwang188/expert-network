# #205 部署后全站功能冒烟测试
## 结论：C+级。清单完整，但需实际网络访问
### 16端点冒烟清单
| 端点 | 方法 | 冒烟验证 |
|------|------|----------|
| /api/match | GET | 401未登录 |
| /api/compliance | GET/PATCH | 403非ADMIN |
| /api/requests | GET/POST/PATCH | 403+业务校验 |
| /api/register | POST | 400缺字段 |
| /api/users | GET | 403非ADMIN |
| /api/points | GET | 排行榜公开200 |
| /api/experts | GET/PATCH | GET需登录200 |
| /api/experts/me | GET/PATCH | 403非专家 |
| /api/orders | GET/PATCH | 401未登录 |
| /api/notifications/unread-count | GET | 未登录返回0 |
### 页面冒烟
| 页面 | 预期 |
|------|------|
| / | 200 首页 |
| /login | 200 |
| /register | 200 |
| /leaderboard | ISR 200 |
### 需在101.35.148.117执行
curl各端点+浏览器开页面截图