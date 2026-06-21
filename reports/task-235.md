# Task #235: 忘记密码+邮箱找回流程文案与交互方案

> 🚫仅限1号AI | 📝 1号AI架构师 | 2026-06-22

---

## 一、现状分析

**平台当前缺少密码找回功能**，这是最严重的功能缺失之一。用户忘记密码后无法自主恢复，必须联系管理员手动重置，严重影响体验。

### 缺失清单
- ❌ `/forgot-password` 页面
- ❌ `/reset-password` 页面  
- ❌ `/api/forgot-password` 接口
- ❌ `/api/reset-password` 接口
- ❌ 邮件发送基础设施（nodemailer/resend等）
- ❌ PasswordResetToken 数据库模型
- ❌ 登录页"忘记密码？"链接

### 技术背景
- 认证框架: NextAuth.js v4 (Credentials Provider)
- 密码存储: bcrypt hash (salt rounds=10)
- Session: JWT, 7天过期
- 数据库: Prisma + PostgreSQL

---

## 二、流程设计

### 2.1 完整流程图

```
登录页 [忘记密码？]
     │
     ▼
┌─────────────────────┐
│  忘记密码页           │
│  输入注册邮箱          │
│  [发送重置链接]       │
└────────┬────────────┘
         │
         ▼
    ┌─────────┐     ┌──────────────┐
    │ 发送邮件  │────▶│ 邮箱模板:     │
    │ (10分钟  │     │ "重置密码"    │
    │  有效)   │     │ 含重置链接     │
    └─────────┘     └──────┬───────┘
                           │
                           ▼ 用户点击链接
                  ┌─────────────────────┐
                  │  重置密码页           │
                  │  输入新密码            │
                  │  确认新密码            │
                  │  [重置密码]           │
                  └────────┬────────────┘
                           │
                           ▼
                  ┌─────────────────────┐
                  │  成功页               │
                  │  "密码重置成功"        │
                  │  [返回登录]           │
                  └─────────────────────┘
```

### 2.2 安全设计要点

| 安全措施 | 实现方式 |
|---------|---------|
| Token有效期 | 10分钟后过期 |
| Token一次性 | 使用后立即删除 |
| Token随机性 | crypto.randomUUID() 生成 |
| 邮件限流 | 同一邮箱5分钟内只能请求1次 |
| IP限流 | 同IP 10分钟内最多5次请求 |
| 密码规则 | 至少8位，含字母+数字（升级策略） |
| 不暴露邮箱存在 | 无论邮箱是否存在都显示"已发送" |

---

## 三、页面文案

### 3.1 登录页 — 新增"忘记密码"链接

在密码输入框下方或登录按钮下方新增：

```
还没注册？立即注册　|　忘记密码？
```

**具体位置**: 登录表单底部，与"还没有账号？立即注册"同行或相邻

```html
<p style="text-align: center; font-size: 13px; color: #888; margin-top: 16px;">
  还没有账号？<a href="/register" style="color: #185FA5;">立即注册</a>
  <span style="margin: 0 8px;">|</span>
  <a href="/forgot-password" style="color: #888;">忘记密码？</a>
</p>
```

---

### 3.2 忘记密码页 — `/forgot-password`

#### 页面标题区
```
【主标题】
忘记密码？

【副标题】
请输入注册时使用的邮箱，我们将发送密码重置链接
```

#### 表单区

| 元素 | 文案 | 说明 |
|------|------|------|
| 邮箱标签 | 注册邮箱 | 与注册页的"邮箱 *"保持区分 |
| 邮箱placeholder | 请输入注册邮箱 | |
| 提交按钮（默认） | 发送重置链接 | 蓝色 #185FA5 |
| 提交按钮（loading） | 正在发送... | |
| 错误提示-格式 | 请输入有效的邮箱地址 | |
| 错误提示-限流 | 操作过于频繁，请5分钟后再试 | |
| 错误提示-网络 | 网络连接异常，请检查后重试 | |
| 错误提示-服务 | 邮件服务暂时不可用，请稍后再试 | |

#### 成功提示（发送邮件后）

```
┌──────────────────────────────────────────────────┐
│  ✅ 邮件已发送                                      │
│                                                    │
│  如果 your@email.com 已注册，一封包含密码重置链接      │
│  的邮件已发送至该邮箱。                                │
│                                                    │
│  📧 请检查您的收件箱（以及垃圾邮件文件夹）。            │
│  ⏰ 重置链接有效期为 10 分钟。                        │
│  🔄 未收到邮件？                                    │
│     · 请耐心等待1-2分钟                              │
│     · [重新发送]                                    │
│                                                    │
│  [返回登录]                                        │
└──────────────────────────────────────────────────┘
```

#### 提示文案要点：
- **不暴露邮箱是否已注册**：无论用户是否存在都显示相同文案
- **引导检查垃圾邮件**：减少"没收到邮件"的投诉
- **提醒有效期**：避免用户过时点击
- **提供重新发送**：避免用户反复刷新页面

---

### 3.3 密码重置邮件模板

#### 邮件主题
```
产研通 ProLink — 密码重置
```

#### 纯文本版
```
您好，

我们收到了一封关于您产研通 ProLink 账户密码重置的请求。

请点击以下链接重置密码：
https://516380.com/reset-password?token=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

此链接有效期为 10 分钟。如果您没有请求重置密码，请忽略此邮件。

—— 产研通 ProLink 团队
```

#### HTML版

```html
<div style="max-width:560px;margin:0 auto;font-family:-apple-system,sans-serif;">
  <!-- Logo区域 -->
  <div style="background:#185FA5;padding:24px;text-align:center;border-radius:8px 8px 0 0;">
    <div style="font-size:20px;font-weight:600;color:#fff;">产研通 ProLink</div>
  </div>
  
  <!-- 正文 -->
  <div style="background:#fff;padding:32px 24px;border:1px solid #e0dfd8;border-top:none;">
    <div style="font-size:16px;font-weight:500;color:#2c2c2a;margin-bottom:8px;">密码重置请求</div>
    <div style="font-size:14px;color:#5F5E5A;line-height:1.7;margin-bottom:24px;">
      您好，<br><br>
      我们收到了一封关于您产研通 ProLink 账户密码重置的请求。请点击下方按钮设置新密码。
    </div>
    
    <!-- CTA按钮 -->
    <a href="https://516380.com/reset-password?token={{token}}" 
       style="display:inline-block;padding:12px 32px;background:#185FA5;color:#fff;border-radius:8px;font-size:15px;font-weight:500;text-decoration:none;margin-bottom:24px;">
      重置密码
    </a>
    
    <!-- 备用链接 -->
    <div style="font-size:12px;color:#888;margin-bottom:24px;">
      如果按钮无法点击，请复制以下链接到浏览器：<br>
      <a href="https://516380.com/reset-password?token={{token}}" style="color:#185FA5;">
        https://516380.com/reset-password?token={{token}}
      </a>
    </div>
    
    <!-- 安全提示 -->
    <div style="background:#FFF8E1;border:1px solid #f0d77b;border-radius:6px;padding:12px;font-size:12px;color:#BA7517;line-height:1.6;">
      ⏰ 此链接有效期为 <strong>10 分钟</strong>。<br>
      🔒 如果您没有请求重置密码，请忽略此邮件，您的账户安全不受影响。<br>
      ⚠️ 产研通团队 <strong>不会</strong> 通过邮件索要您的密码。
    </div>
  </div>
  
  <!-- 页脚 -->
  <div style="background:#f8f7f4;padding:16px 24px;text-align:center;border-radius:0 0 8px 8px;border:1px solid #e0dfd8;border-top:none;">
    <div style="font-size:12px;color:#888;line-height:1.6;">
      产研通 ProLink · 让产业智慧流动起来<br>
      <a href="https://516380.com" style="color:#185FA5;">516380.com</a>
    </div>
  </div>
</div>
```

#### 邮件错误处理

| 场景 | 用户端提示 | 日志记录 |
|------|-----------|---------|
| 邮箱不存在 | 显示"邮件已发送"（不暴露） | 记录 warn 级别 |
| 邮件发送失败 | 显示"邮件服务暂时不可用" | 记录 error 级别 |
| Token生成失败 | 显示"邮件服务暂时不可用" | 记录 error 级别 |
| 限流触发 | 显示"操作过于频繁" | 记录 info 级别 |

---

### 3.4 重置密码页 — `/reset-password`

#### Token验证状态

**Token有效 → 显示重置表单：**

```
【主标题】
设置新密码

【副标题】
为你的产研通 ProLink 账户设置一个新密码
```

| 元素 | 文案 | 说明 |
|------|------|------|
| 新密码标签 | 新密码 | |
| 新密码placeholder | 至少8位，包含字母和数字 | 强化密码要求 |
| 确认密码标签 | 确认新密码 | |
| 确认密码placeholder | 请再次输入新密码 | |
| 提交按钮（默认） | 重置密码 | |
| 提交按钮（loading） | 重置中... | |
| 错误-两次不一致 | 两次输入的密码不一致 | |
| 错误-密码太短 | 密码长度至少8位 | |
| 错误-密码太弱 | 密码需包含字母和数字 | |
| 错误-Token过期 | 重置链接已过期，请[重新申请] | 链接到 /forgot-password |
| 错误-Token无效 | 重置链接无效，请[重新申请] | 链接到 /forgot-password |

**Token过期 → 显示过期提示：**

```
┌──────────────────────────────────────────────────┐
│  ⏰ 重置链接已过期                                  │
│                                                    │
│  重置密码链接的有效期为 10 分钟，您的链接已过期。       │
│                                                    │
│  [重新发送重置链接] → /forgot-password              │
│  [返回登录] → /login                                │
└──────────────────────────────────────────────────┘
```

**Token无效 → 显示无效提示：**

```
┌──────────────────────────────────────────────────┐
│  ❌ 重置链接无效                                    │
│                                                    │
│  该重置链接不可用，可能原因：                          │
│  · 链接已被使用（每个链接只能使用一次）                 │
│  · 链接已过期                                       │
│                                                    │
│  [重新发送重置链接] → /forgot-password              │
│  [返回登录] → /login                                │
└──────────────────────────────────────────────────┘
```

#### 成功提示（密码重置完成）

```
┌──────────────────────────────────────────────────┐
│  ✅ 密码重置成功                                    │
│                                                    │
│  你的密码已更新，请使用新密码登录。                     │
│                                                    │
│  🔒 安全提示：                                      │
│  · 请使用与之前不同的密码                            │
│  · 不要将密码分享给任何人                            │
│                                                    │
│  [立即登录] → /login                                │
└──────────────────────────────────────────────────┘
```

---

### 3.5 边界场景文案

| 场景 | 页面位置 | 文案 |
|------|---------|------|
| Token已使用 | 重置页 | "该重置链接已被使用，请重新申请密码重置。" |
| 重复提交 | 忘记密码页 | "重置邮件已发送，如果未收到请5分钟后重试。" |
| 邮件服务不可用 | 忘记密码页 | "邮件服务暂时不可用，请稍后再试或联系管理员。" |
| 密码与原密码相同 | 重置页 | "新密码不能与当前密码相同。"（建议实现） |

---

## 四、交互细节设计

### 4.1 表单交互

#### 忘记密码页
```
1. 用户输入邮箱
2. 前端校验邮箱格式（正则）
3. 点击"发送重置链接"
4. 按钮变为"正在发送..." + loading动画
5. 成功 → 显示"邮件已发送"成功面板
6. 失败 → 显示对应错误提示
7. 无论成功失败，按钮恢复可点击状态
```

#### 重置密码页
```
1. 页面加载时验证 token
   ├─ valid → 显示重置表单
   ├─ expired → 显示过期提示
   └─ invalid → 显示无效提示
2. 用户输入新密码和确认密码
3. 前端校验：长度≥8、字母+数字、两次一致
4. 点击"重置密码"
5. 按钮变为"重置中..." + loading动画
6. 成功 → 显示成功面板 + 3秒后跳转登录页
7. 失败 → 显示对应错误提示
```

### 4.2 密码规则提示（实时校验）

在密码输入框下方显示密码强度提示：

```
🔴 弱    密码长度至少8位
🟡 中    还需包含数字或字母
🟢 强    同时包含字母和数字
```

实时显示规则满足情况：
- □ 至少8个字符
- □ 包含字母（a-z, A-Z）
- □ 包含数字（0-9）

### 4.3 安全性文案

在重置密码页面底部增加安全提示：

```
🔒 安全须知：
· 产研通 ProLink 不会通过邮件索要您的密码
· 重置链接仅对您的账户有效，请勿分享给他人
· 如有可疑的密码重置请求，请立即联系平台管理员
```

---

## 五、数据库方案

### 5.1 新增 Prisma Model

```prisma
model PasswordResetToken {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token     String   @unique
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([token])
  @@index([userId])
}
```

或简化方案（无需新Model，用独立存储）：

```typescript
// 使用 Redis / 内存 / 数据库扩展字段存储
// 推荐：在现有 User 表增加两个字段
model User {
  // ...existing fields...
  resetToken    String?
  resetTokenExp DateTime?
}
```

**推荐简化方案**，理由：
- 减少数据库迁移复杂度
- 每次用户只有一个有效token
- 查询更简单（直接查User表）

### 5.2 API端点设计

| 端点 | 方法 | 功能 | 认证 |
|------|------|------|------|
| `/api/auth/forgot-password` | POST | 发送重置邮件 | 无（有IP限流） |
| `/api/auth/reset-password` | POST | 重置密码 | Token验证 |
| `/api/auth/verify-reset-token` | GET | 验证token有效性 | 无 |

---

## 六、代码实施要点

### 6.1 邮件服务选择

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| Resend | 免费100封/天，React模板 | 国内可访问性待确认 | ⭐⭐⭐ |
| Nodemailer + SMTP | 完全自控，无限制 | 需自己搭建SMTP | ⭐⭐ |
| SendGrid | 免费100封/天，稳定 | 国内访问可能受限 | ⭐⭐ |
| 腾讯云邮件推送 | 国内稳定，合规 | 需要实名认证 | ⭐⭐⭐ |

**推荐**: 腾讯云邮件推送（因为是腾讯云香港服务器，生态集成好）

### 6.2 安全头配置

密码重置相关的所有API响应都应包含：
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Cache-Control: no-store
```

### 6.3 Token生成

```typescript
import crypto from "crypto"

// 生成token
const token = crypto.randomUUID()

// 存储到数据库
await prisma.user.update({
  where: { email },
  data: {
    resetToken: token,
    resetTokenExp: new Date(Date.now() + 10 * 60 * 1000) // 10分钟
  }
})

// 发送邮件
await sendResetEmail(email, token)
```

### 6.4 密码强度升级

建议将全局密码规则从"至少6位"升级为"至少8位，必须包含字母和数字"：

**注册页**: 同步更新密码提示
**重置页**: 使用相同的校验规则
**API层**: 统一校验逻辑

---

## 七、测试检查清单

### 7.1 正向流程
- [ ] 从登录页点击"忘记密码"链接
- [ ] 输入已注册邮箱，点击发送
- [ ] 收到重置邮件
- [ ] 点击邮件中的链接，进入重置页
- [ ] 输入新密码，提交成功
- [ ] 使用新密码登录成功
- [ ] 旧密码登录失败

### 7.2 异常场景
- [ ] 输入未注册邮箱 → 显示"邮件已发送"（防枚举）
- [ ] 5分钟内重复请求 → 显示限流提示
- [ ] Token过期后访问 → 显示过期提示
- [ ] 重复使用已用Token → 显示无效提示
- [ ] 伪造Token → 显示无效提示
- [ ] 新密码与确认不一致 → 显示错误提示
- [ ] 新密码少于8位 → 显示密码太短
- [ ] 新密码无字母或数字 → 显示密码太弱

### 7.3 安全测试
- [ ] 大量请求测试IP限流
- [ ] Token在10分钟后自动失效
- [ ] Token仅能使用一次
- [ ] 重置密码后JWT/session自动失效（强制重新登录）

---

## 八、实施优先级

| 优先级 | 内容 | 依赖 |
|--------|------|------|
| P0 | 数据库扩展（resetToken/resetTokenExp字段） | 无 |
| P0 | `/api/auth/forgot-password` + `/reset-password` API | 数据库 |
| P0 | `/forgot-password` + `/reset-password` 页面 | API |
| P0 | 登录页添加"忘记密码？"链接 | 页面 |
| P1 | 邮件服务集成 + 邮件模板 | 无 |
| P1 | 密码强度规则升级（6位→8位+字母数字） | 无 |
| P2 | Token验证API | API |
| P2 | 实时密码强度指示器 | 前端 |

---

*📝 1号AI架构师 · 产研通ProLink品牌文案组 · 2026-06-22*
