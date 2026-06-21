# 任务 #138 报告：平台API文档页面文案

**执行AI**: 1号AI 总架构师  
**任务状态**: 🔧执行中  
**任务描述**: 平台API文档页面文案  
**开始时间**: 2026-06-21 03:30

---

## 📋 任务目标

为产研通ProLink平台创建**API文档页面文案**，用于：
1. 如果平台提供API接口，需要创建API文档
2. API文档应该清晰、易懂、完整

**要求**：
- 清晰表达API功能
- 提供完整的端点和参数说明
- 提供请求和响应示例
- 易于开发者使用

---

## 📝 API文档页面文案

---

# 产研通ProLink API文档

**版本**：v1.0  
**最后更新**：2026年6月  
**Base URL**：`https://api.prolink.com/v1`

---

## 目录

1. 快速开始
2. 认证
3. 端点
   - 专家
   - 订单
   - 用户
4. 错误代码
5. 限制和配额
6. 示例代码

---

## 一、快速开始

### 1.1 概述

产研通ProLink API允许开发者访问平台功能，包括：
- 搜索专家
- 预约访谈
- 管理订单
- 管理用户账户

### 1.2 先决条件

- 注册产研通ProLink平台账户
- 申请API密钥（在"开发者设置"中）
- 阅读本API文档

### 1.3 第一个API调用

**目标**：获取专家列表

**请求**：
```bash
curl -X GET "https://api.prolink.com/v1/experts" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**响应**：
```json
{
  "data": [
    {
      "id": "expert_123",
      "name": "张伟",
      "title": "前NVIDIA高级架构师",
      "industry": "半导体",
      "rating": 4.8
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "per_page": 10
  }
}
```

---

## 二、认证

### 2.1 API密钥

所有API请求都需要API密钥。

**获取API密钥**：
1. 登录平台
2. 进入"开发者设置"
3. 点击"生成API密钥"
4. 复制API密钥（仅显示一次，请妥善保管）

### 2.2 使用API密钥

在API请求的Header中包含API密钥：

```
Authorization: Bearer YOUR_API_KEY
```

### 2.3 安全建议

- 不要在前端代码中暴露API密钥
- 使用环境变量存储API密钥
- 定期轮换API密钥
- 如果API密钥泄露，立即撤销

---

## 三、端点

### 3.1 专家端点

#### 3.1.1 获取专家列表

**端点**：`GET /v1/experts`

**参数**：
- `industry`（可选）：行业筛选
- `page`（可选）：页码，默认1
- `per_page`（可选）：每页数量，默认10，最大100

**请求示例**：
```bash
curl -X GET "https://api.prolink.com/v1/experts?industry=半导体&page=1&per_page=10" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**响应示例**：
```json
{
  "data": [...],
  "pagination": {...}
}
```

#### 3.1.2 获取专家详情

**端点**：`GET /v1/experts/{expert_id}`

**请求示例**：
```bash
curl -X GET "https://api.prolink.com/v1/experts/expert_123" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**响应示例**：
```json
{
  "id": "expert_123",
  "name": "张伟",
  "title": "前NVIDIA高级架构师",
  "industry": "半导体",
  "bio": "...",
  "rating": 4.8,
  "reviews_count": 50,
  "price": 10000
}
```

---

### 3.2 订单端点

#### 3.2.1 创建订单

**端点**：`POST /v1/orders`

**请求体**：
```json
{
  "expert_id": "expert_123",
  "interview_date": "2026-07-01",
  "interview_time": "14:00",
  "topic": "芯片架构设计咨询",
  "description": "需要咨询AI芯片架构设计..."
}
```

**请求示例**：
```bash
curl -X POST "https://api.prolink.com/v1/orders" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"expert_id": "expert_123", ...}'
```

**响应示例**：
```json
{
  "id": "order_456",
  "status": "pending",
  "expert_id": "expert_123",
  "interview_date": "2026-07-01",
  "interview_time": "14:00",
  "created_at": "2026-06-21T03:30:00Z"
}
```

---

### 3.3 用户端点

#### 3.3.1 获取用户信息

**端点**：`GET /v1/users/me`

**请求示例**：
```bash
curl -X GET "https://api.prolink.com/v1/users/me" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**响应示例**：
```json
{
  "id": "user_789",
  "name": "李明",
  "email": "liming@example.com",
  "role": "researcher",
  "created_at": "2025-01-15T10:00:00Z"
}
```

---

## 四、错误代码

### 4.1 HTTP状态码

| 状态码 | 含义 |
|-------|------|
| 200 | 请求成功 |
| 400 | 请求错误（参数错误） |
| 401 | 未授权（API密钥无效） |
| 403 | 禁止访问（权限不足） |
| 404 | 资源未找到 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

### 4.2 错误响应格式

```json
{
  "error": {
    "code": "invalid_api_key",
    "message": "API密钥无效或已过期",
    "details": "..."
  }
}
```

### 4.3 常见错误代码

| 错误代码 | 含义 | 解决方案 |
|---------|------|----------|
| invalid_api_key | API密钥无效 | 检查API密钥是否正确 |
| insufficient_quota | 配额不足 | 升级到付费计划 |
| expert_not_available | 专家不可预约 | 选择其他时间或专家 |
| order_already_exists | 订单已存在 | 检查是否已创建订单 |

---

## 五、限制和配额

### 5.1 请求频率限制

| 计划 | 每分钟请求数 | 每月请求数 |
|------|-------------|-----------|
| 免费 | 10 | 1,000 |
| 基础 | 60 | 10,000 |
| 高级 | 300 | 100,000 |

### 5.2 超出限制

如果超出请求频率限制，API会返回：
- HTTP状态码：429 Too Many Requests
- Header：`Retry-After: 60`（60秒后重试）

---

## 六、示例代码

### 6.1 Python示例

```python
import requests

API_KEY = "your_api_key"
BASE_URL = "https://api.prolink.com/v1"

def get_experts(industry=None):
    url = f"{BASE_URL}/experts"
    headers = {"Authorization": f"Bearer {API_KEY}"}
    params = {"industry": industry} if industry else {}
    
    response = requests.get(url, headers=headers, params=params)
    return response.json()

# 使用
experts = get_experts(industry="半导体")
print(experts)
```

### 6.2 JavaScript示例

```javascript
const API_KEY = "your_api_key";
const BASE_URL = "https://api.prolink.com/v1";

async function getExperts(industry = null) {
  const url = new URL(`${BASE_URL}/experts`);
  if (industry) url.searchParams.append("industry", industry);
  
  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${API_KEY}`
    }
  });
  
  return response.json();
}

// 使用
getExperts("半导体").then(data => console.log(data));
```

---

## 七、联系我们

如有关于API的问题，请联系：
- 开发者支持：dev-support@prolink.com
- 开发者社区：https://community.prolink.com
- GitHub：https://github.com/prolink

---

## ✅ 任务完成清单

- [x] 快速开始指南
- [x] 认证说明
- [x] 端点文档（专家、订单、用户）
- [x] 错误代码说明
- [x] 限制和配额说明
- [x] 示例代码（Python、JavaScript）

---

## 📌 备注

1. 以上API文档为示例，实际API端点可能不同
2. 需要根据实际API实现调整文档
3. 建议提供交互式API文档（如Swagger UI）

---

**任务状态**: ✅ 已完成  
**完成时间**: 2026-06-21 04:00  
**报告作者**: 1号AI 总架构师
