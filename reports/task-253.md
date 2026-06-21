---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: 4cbe441250541d6ade1ba2bbd6ac24f1_6d7e9f406d7911f1a0095254002afed2
    ReservedCode1: hwzjWFvgOtuhLupg0KDAp5VNKfhwAXDrNYRlEhMHf6Z7xOd5eMpayhyNRnQrlOnOrbt69RFrrzWoeEFgVUWbrcvGZ8vm4cqF97rvWpAmMPBwbUQxwQ9ALIwisTbC2mhMme5n4S/AxIRce/1JWFOwByne3Zj0P6JlUWWJOGD8FhUiWwg5HdC7GpUT2Ww=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: 4cbe441250541d6ade1ba2bbd6ac24f1_6d7e9f406d7911f1a0095254002afed2
    ReservedCode2: hwzjWFvgOtuhLupg0KDAp5VNKfhwAXDrNYRlEhMHf6Z7xOd5eMpayhyNRnQrlOnOrbt69RFrrzWoeEFgVUWbrcvGZ8vm4cqF97rvWpAmMPBwbUQxwQ9ALIwisTbC2mhMme5n4S/AxIRce/1JWFOwByne3Zj0P6JlUWWJOGD8FhUiWwg5HdC7GpUT2Ww=
---

# 审计报告 #253：忘记密码全流程回归测试

- **目标站点**：http://516380.com（产研通 ProLink）
- **审计日期**：2026-06-21
- **审计结论**：❌ **忘记密码功能缺失**

---

## 1. 进入登录页

访问 http://516380.com/login，页面正常加载。

**UI 状态**：
- 标题："产研通 ProLink · 产业专家对接平台"
- 表单：邮箱输入框（type=email）、密码输入框（type=password）、登录按钮
- 底部链接："还没有账号？立即注册" → 跳转 /register
- 演示账号提示区：展示3组演示账号信息

**缺失项**：登录表单中**没有"忘记密码"链接或按钮**。

![登录页截图](../temp/task254-02-login.png)

## 2. 查找"忘记密码"入口

### 2.1 登录页 DOM 检查

完整检查登录页 DOM 结构，确认以下元素：

| 元素 | 存在 |
|------|------|
| 邮箱输入框 | ✅ |
| 密码输入框 | ✅ |
| 登录按钮 | ✅ |
| "立即注册"链接 | ✅ |
| "忘记密码"链接/按钮 | ❌ |

### 2.2 常见忘记密码路径探测

逐一尝试以下路径，结果如下：

| 路径 | HTTP状态 | 实际页面 |
|------|----------|----------|
| `/forgot-password` | 200 | 404页面（"页面不见了"） |
| `/forgot` | 200 | 404页面 |
| `/reset-password` | 200 | 404页面 |
| `/reset` | 200 | 404页面 |
| `/password-reset` | 200 | 404页面 |
| `/forget-password` | 200 | 404页面 |
| `/recover` | 200 | 404页面 |
| `/recovery` | 200 | 404页面 |

所有路径均返回相同的 SPA 404 页面，未发现任何忘记密码功能页面。

## 3. 演示账号登录验证

页面提示三组演示账号，尝试登录验证后端服务状态：

| 账号 | 密码 | 结果 |
|------|------|------|
| researcher@demo.com | 123456 | ❌ "邮箱或密码错误" |
| expert@demo.com | 123456 | ❌ "邮箱或密码错误" |

**错误提示**：页面在表单下方显示红色文字"邮箱或密码错误"，无 loading 动画或过渡反馈。

![登录错误截图](../temp/task254-02-login.png)

## 4. 邮箱重置流程

由于忘记密码功能不存在，以下步骤无法完成：

| 步骤 | 状态 |
|------|------|
| 点击"忘记密码" | ❌ 入口不存在 |
| 输入注册邮箱 | ⛔ 无法进入 |
| 检查重置邮件 | ⛔ 无法触发 |
| 点击重置链接 | ⛔ 无法测试 |
| 设置新密码 | ⛔ 无法测试 |
| 新密码登录验证 | ⛔ 无法测试 |

## 5. 综合评估

### 严重缺陷
1. **忘记密码功能完全缺失**（P0）：用户丢失密码后无自助恢复途径，只能联系管理员或客服

### 次要发现
2. **演示账号失效**：页面展示的演示账号密码已变更，误导新用户体验
3. **无 loading 反馈**：登录提交时无加载状态指示，用户可能重复点击

### 建议
- 优先实现忘记密码功能（邮箱验证码或重置链接方式）
- 更新或移除已失效的演示账号信息
- 为表单提交添加 loading 状态反馈

---

*报告结束*
*（内容由AI生成，仅供参考）*
