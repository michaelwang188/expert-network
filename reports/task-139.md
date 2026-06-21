# 任务 #139 报告：Webhook+API对接技术文案

**执行AI**: 1号AI 总架构师  
**任务状态**: 🔧执行中  
**任务描述**: Webhook+API对接技术文案  
**开始时间**: 2026-06-21 04:00

---

## 📋 任务目标

为产研通ProLink平台创建**Webhook+API对接技术文案**，用于：
1. 帮助开发者集成Webhook
2. 提供API对接技术指南
3. 确保安全和可靠性

**要求**：
- 技术准确
- 易于理解
- 提供完整示例
- 安全第一

---

## 📝 Webhook技术文档

---

# 产研通ProLink Webhook指南

**版本**：v1.0  
**最后更新**：2026年6月  
**Base URL**：`https://api.prolink.com/v1`

---

## 一、Webhook简介

### 1.1 什么是Webhook？

Webhook是一种回调机制，允许平台在特定事件发生时，将通知推送到你的服务器。

**与API轮询的区别**：
- API轮询：你主动请求平台（效率低，延迟高）
- Webhook：平台主动推送通知给你（效率高，实时）

### 1.2 使用场景

- 订单状态变化（如创建、确认、完成、取消）
- 专家可用性变化（如专家设置可预约时间）
- 消息通知（如收到新消息）
- 支付状态变化（如支付成功、失败）

---

## 二、配置Webhook

### 2.1 设置Webhook URL

**步骤**：
1. 登录平台
2. 进入"开发者设置" → "Webhook"
3. 点击"添加Webhook"
4. 输入你的Webhook URL（如`https://your-server.com/webhook`）
5. 选择事件类型（如订单状态变化、消息通知）
6. 保存

### 2.2 Webhook URL要求

- 必须是HTTPS（为了安全）
- 必须可公开访问（平台需要能访问）
- 必须在5秒内响应（否则平台会重试）
- 必须返回HTTP 200状态码

### 2.3 测试Webhook

平台提供"测试Webhook"功能：
1. 点击"测试Webhook"
2. 平台会发送测试事件到你的Webhook URL
3. 检查你的服务器是否收到事件

---

## 三、Webhook事件类型

### 3.1 订单事件

| 事件类型 | 描述 |
|---------|------|
| order.created | 订单创建 |
| order.confirmed | 订单确认 |
| order.completed | 订单完成 |
| order.cancelled | 订单取消 |

**示例**：订单创建事件
```json
{
  "event": "order.created",
  "data": {
    "order_id": "order_456",
    "expert_id": "expert_123",
    "client_id": "user_789",
    "status": "pending",
    "created_at": "2026-06-21T04:00:00Z"
  },
  "timestamp": "2026-06-21T04:00:00Z"
}
```

### 3.2 专家事件

| 事件类型 | 描述 |
|---------|------|
| expert.available | 专家设置可预约时间 |
| expert.unavailable | 专家取消可预约时间 |

### 3.3 消息事件

| 事件类型 | 描述 |
|---------|------|
| message.received | 收到新消息 |

---

## 四、接收Webhook事件

### 4.1 验证事件签名

为了确保Webhook事件来自产研通ProLink平台（而非恶意第三方），你需要验证事件签名。

**签名验证步骤**：
1. 从请求Header中获取`X-ProLink-Signature`
2. 使用你的API密钥和请求体计算HMAC-SHA256签名
3. 比较计算的签名和Header中的签名是否一致

**示例代码（Python）**：
```python
import hmac
import hashlib

def verify_signature(request_body, signature, api_key):
    # 计算签名
    computed_signature = hmac.new(
        api_key.encode('utf-8'),
        request_body.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    # 比较签名
    return hmac.compare_digest(computed_signature, signature)
```

### 4.2 处理事件

**步骤**：
1. 接收Webhook事件（HTTP POST请求）
2. 验证事件签名
3. 解析事件数据
4. 根据事件类型执行业务逻辑
5. 返回HTTP 200状态码

**示例代码（Python Flask）**：
```python
from flask import Flask, request
import json

app = Flask(__name__)

@app.route('/webhook', methods=['POST'])
def webhook():
    # 1. 获取请求体
    request_body = request.get_data(as_text=True)
    
    # 2. 验证签名
    signature = request.headers.get('X-ProLink-Signature')
    if not verify_signature(request_body, signature, API_KEY):
        return 'Invalid signature', 401
    
    # 3. 解析事件
    event_data = json.loads(request_body)
    event_type = event_data['event']
    
    # 4. 根据事件类型处理
    if event_type == 'order.created':
        handle_order_created(event_data['data'])
    elif event_type == 'order.completed':
        handle_order_completed(event_data['data'])
    
    # 5. 返回200
    return 'OK', 200
```

---

## 五、Webhook安全

### 5.1 安全最佳实践

1. **使用HTTPS**：确保Webhook URL是HTTPS
2. **验证签名**：验证每个事件的签名
3. **限制IP**：只允许平台的IP访问Webhook URL（可选）
4. **记录日志**：记录所有收到的Webhook事件
5. **错误处理**：如果处理失败，返回非200状态码，让平台重试

### 5.2 平台IP地址

只允许以下IP地址访问你的Webhook URL：
- `8.8.8.8/32`（示例，实际IP地址请查看平台文档）

---

## 六、Webhook重试机制

### 6.1 重试策略

如果平台发送Webhook事件后，没有收到HTTP 200响应，会重试：
- 第1次重试：1分钟后
- 第2次重试：5分钟后
- 第3次重试：30分钟后
- 第4次重试：2小时后
- 第5次重试：6小时后

如果5次重试都失败，平台会放弃，并将事件标记为"失败"。

### 6.2 查看失败事件

在"开发者设置" → "Webhook" → "失败事件"中，可以查看失败的事件，并手动重新发送。

---

## 七、API对接技术指南

### 7.1 认证

所有API请求都需要API密钥。

**在请求Header中包含API密钥**：
```
Authorization: Bearer YOUR_API_KEY
```

### 7.2 请求格式

- 所有请求都是HTTPS
- 所有请求都是UTF-8编码
- POST/PUT请求的Content-Type是`application/json`

### 7.3 响应格式

- 所有响应都是JSON格式
- 成功响应：HTTP 200，响应体包含数据
- 错误响应：HTTP 4xx/5xx，响应体包含错误详情

### 7.4 分页

列表端点支持分页。

**参数**：
- `page`：页码（从1开始）
- `per_page`：每页数量（默认10，最大100）

**响应中的分页信息**：
```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "per_page": 10,
    "total_pages": 10
  }
}
```

### 7.5 限流

API有请求频率限制。

**Header中的限流信息**：
- `X-RateLimit-Limit`：每分钟请求数限制
- `X-RateLimit-Remaining`：当前还剩余的请求数
- `X-RateLimit-Reset`：限流重置时间（Unix时间戳）

如果超出限制，API会返回HTTP 429，并在Header中包含`Retry-After`（多少秒后重试）。

---

## 八、示例代码

### 8.1 完整示例：创建订单并接收Webhook通知

**步骤1：创建订单（API）**
```python
import requests

API_KEY = "your_api_key"
BASE_URL = "https://api.prolink.com/v1"

# 创建订单
response = requests.post(
    f"{BASE_URL}/orders",
    headers={"Authorization": f"Bearer {API_KEY}"},
    json={
        "expert_id": "expert_123",
        "interview_date": "2026-07-01",
        "interview_time": "14:00",
        "topic": "芯片架构设计咨询"
    }
)

order = response.json()
print(f"订单已创建：{order['id']}")
```

**步骤2：接收订单创建通知（Webhook）**
```python
from flask import Flask, request
import json

app = Flask(__name__)

@app.route('/webhook', methods=['POST'])
def webhook():
    event_data = request.get_json()
    
    if event_data['event'] == 'order.created':
        order_id = event_data['data']['order_id']
        print(f"订单已创建：{order_id}")
    
    return 'OK', 200
```

---

## 九、常见问题

### Q1：Webhook事件没有收到？

**A**：可能原因：
1. Webhook URL不可访问（检查服务器是否运行）
2. Webhook URL不是HTTPS（平台只发送HTTPS请求）
3. 服务器响应超时（确保在5秒内响应）
4. 服务器返回非200状态码（平台会重试）

### Q2：如何调试Webhook？

**A**：
1. 使用平台提供的"测试Webhook"功能
2. 查看平台日志（"开发者设置" → "Webhook" → "日志"）
3. 在本机使用ngrok等工具将本地服务器暴露到公网，然后测试

### Q3：API请求返回401 Unauthorized？

**A**：可能原因：
1. API密钥错误（检查API密钥是否正确）
2. API密钥过期（重新生成API密钥）
3. API密钥权限不足（检查API密钥的权限设置）

---

## 十、联系我们

如有关于Webhook和API对接的问题，请联系：
- 开发者支持：dev-support@prolink.com
- 开发者社区：https://community.prolink.com
- GitHub：https://github.com/prolink

---

## ✅ 任务完成清单

- [x] Webhook简介
- [x] 配置Webhook
- [x] Webhook事件类型
- [x] 接收Webhook事件
- [x] Webhook安全
- [x] Webhook重试机制
- [x] API对接技术指南
- [x] 示例代码
- [x] 常见问题

---

## 📌 备注

1. 以上Webhook和API对接技术文案为示例，实际实现可能不同
2. 需要根据实际平台功能调整文档
3. 建议提供Webhook测试工具，方便开发者调试

---

**任务状态**: ✅ 已完成  
**完成时间**: 2026-06-21 04:30  
**报告作者**: 1号AI 总架构师
