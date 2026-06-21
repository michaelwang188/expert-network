# 任务#96：邮件通知模板库（系统通知+订单通知+积分通知共20封）

**执行AI**: 1号AI（总架构师）  
**执行时间**: 2026-06-21  
**任务状态**: ✅ 已完成

---

## 一、邮件通知模板库总体框架

### 模板定位
面向产研通ProLink用户的邮件通知模板库，覆盖系统通知、订单通知、积分通知3大类共20封邮件，确保用户及时获取关键信息，提升打开率和点击率。

### 模板原则
1. **简洁明了** - 主题清晰，内容精炼
2. **行动导向** - 明确告知用户要做什么
3. **个性化** - 包含用户姓名、订单号等信息
4. **品牌一致** - 统一Header、Footer、配色
5. **移动友好** - 响应式设计，手机端易读

---

## 二、邮件模板通用元素

### 2.1 Header
```html
<table width="100%" bgcolor="#f8f9fa" cellpadding="20">
  <tr>
    <td align="center">
      <img src="https://prlink.cn/logo.png" alt="产研通ProLink" width="200">
    </td>
  </tr>
</table>
```

### 2.2 Footer
```html
<table width="100%" bgcolor="#343a40" cellpadding="20" style="color:#ffffff;">
  <tr>
    <td align="center">
      <p>产研通ProLink - 连接专家与研究者</p>
      <p>
        <a href="https://prlink.cn" style="color:#ffffff;">访问官网</a> |
        <a href="https://prlink.cn/settings/notifications" style="color:#ffffff;">通知设置</a> |
        <a href="https://prlink.cn/support" style="color:#ffffff;">联系客服</a>
      </p>
      <p>© 2026 产研通ProLink. All rights reserved.</p>
      <p>北京市朝阳区XX路XX号 | 400-000-0000 | support@prlink.cn</p>
    </td>
  </tr>
</table>
```

---

## 三、系统通知（7封）

### ① 注册成功欢迎邮件
**主题**: 欢迎加入产研通ProLink！

**正文**:
```html
<h2>亲爱的 {用户名}，</h2>
<p>欢迎加入产研通ProLink！我们是专业的专家对接平台，连接650+产业专家与全球顶尖研究机构。</p>

<h3>接下来您可以：</h3>
<ul>
  <li><a href="{链接}">完善个人资料</a></li>
  <li><a href="{链接}">浏览专家库</a></li>
  <li><a href="{链接}">查看新人福利</a></li>
</ul>

<p>如有任何问题，欢迎联系客服：400-000-0000</p>
<p>祝您使用愉快！</p>
```

---

### ② 实名认证通过
**主题**: 实名认证已通过

**正文**:
```html
<h2>亲爱的 {用户名}，</h2>
<p>恭喜！您的实名认证已通过，现在可以下单咨询专家了。</p>

<table bgcolor="#d4edda" cellpadding="15" style="border-radius:10px;">
  <tr>
    <td>
      <h3>认证信息</h3>
      <p>姓名：{姓名}</p>
      <p>机构：{机构}</p>
      <p>职位：{职位}</p>
      <p>通过时间：{时间}</p>
    </td>
  </tr>
</table>

<p><a href="{链接}" style="background:#007bff;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;">立即下单</a></p>
```

---

### ③ 密码修改成功
**主题**: 密码修改成功

**正文**:
```html
<h2>亲爱的 {用户名}，</h2>
<p>您的账户密码已修改。</p>
<p><strong>如非本人操作，请立即联系客服：400-000-0000</strong></p>
<p>建议：定期更换密码，使用强密码（包含大小写字母、数字、特殊字符）。</p>
```

---

### ④ 异地登录提醒
**主题**: ⚠️ 账户异地登录提醒

**正文**:
```html
<h2>亲爱的 {用户名}，</h2>
<p>您的账户在异地登录，请确认是否为本人操作。</p>

<table bgcolor="#fff3cd" cellpadding="15" style="border-radius:10px;">
  <tr>
    <td>
      <h3>登录信息</h3>
      <p>时间：{时间}</p>
      <p>地点：{地点}</p>
      <p>IP地址：{IP}</p>
      <p>设备：{设备}</p>
    </td>
  </tr>
</table>

<p>如非本人操作，请立即：</p>
<ol>
  <li><a href="{链接}">修改密码</a></li>
  <li><a href="{链接}">联系客服</a></li>
</ol>
```

---

### ⑤ 隐私政策更新通知
**主题**: 隐私政策已更新，请查看

**正文**:
```html
<h2>亲爱的 {用户名}，</h2>
<p>我们更新了《隐私政策》，主要变化：</p>
<ul>
  <li>新增数据收集类型说明</li>
  <li>新增数据跨境传输条款</li>
  <li>新增用户权利章节</li>
</ul>
<p>请点击下方链接查看完整政策：</p>
<p><a href="{链接}">查看隐私政策</a></p>
<p>如您不同意更新后的政策，可在30天内申请删除账户。</p>
```

---

### ⑥ 系统维护通知
**主题**: 系统维护通知（6月25日凌晨2:00-4:00）

**正文**:
```html
<h2>亲爱的 {用户名}，</h2>
<p>平台将在以下时间进行系统维护：</p>
<table bgcolor="#d1ecf1" cellpadding="15" style="border-radius:10px;">
  <tr>
    <td>
      <p><strong>维护时间</strong>：2026年6月25日 2:00-4:00（北京时间）</p>
      <p><strong>影响范围</strong>：Web平台、App、微信小程序将无法访问</p>
      <p><strong>建议</strong>：请提前安排咨询，避免维护期间使用</p>
    </td>
  </tr>
</table>
<p>维护完成后，我们会发送通知。如有问题，请联系客服。</p>
```

---

### ⑦ 账户注销确认
**主题**: 账户注销申请已提交

**正文**:
```html
<h2>亲爱的 {用户名}，</h2>
<p>我们已收到您的账户注销申请。</p>
<p><strong>注销生效时间</strong>：7天后（2026年6月28日）</p>
<p>在此期间，您可以：</p>
<ul>
  <li>登录账户撤销注销申请</li>
  <li>下载个人数据（<a href="{链接}">点击下载</a>）</li>
</ul>
<p>注销后，您的个人数据将被删除或匿名化（合规要求）。</p>
```

---

## 四、订单通知（7封）

### ⑧ 订单邀请已发送（研究员）
**主题**: 订单邀请已发送 - {专家姓名}

**正文**:
```html
<h2>亲爱的 {用户名}，</h2>
<p>您已向 {专家姓名} 发送咨询邀请。</p>

<table bgcolor="#e2e3e5" cellpadding="15" style="border-radius:10px;">
  <tr>
    <td>
      <h3>订单详情</h3>
      <p>订单号：{订单号}</p>
      <p>专家：{专家姓名} | {专家机构} | {专家职位}</p>
      <p>咨询主题：{主题}</p>
      <p>咨询形式：{形式}</p>
      <p>期望时间：{时间}</p>
      <p>费用：¥{金额}</p>
    </td>
  </tr>
</table>

<p>专家将在24小时内响应。如专家接受，您会收到邮件通知。</p>
<p><a href="{链接}" style="background:#28a745;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;">查看订单</a></p>
```

---

### ⑨ 专家已接受订单（研究员）
**主题**: 好消息！{专家姓名}已接受您的订单

**正文**:
```html
<h2>亲爱的 {用户名}，</h2>
<p>{专家姓名} 已接受您的咨询邀请，咨询即将开始。</p>

<table bgcolor="#d4edda" cellpadding="15" style="border-radius:10px;">
  <tr>
    <td>
      <h3>咨询信息</h3>
      <p>订单号：{订单号}</p>
      <p>专家：{专家姓名} | {专家机构} | {专家职位}</p>
      <p>咨询形式：{形式}</p>
      <p>咨询时间：{时间}</p>
      <p>拨入号码：400-000-0000（输入订单号+密码）</p>
    </td>
  </tr>
</table>

<p><strong>准备建议</strong>：</p>
<ul>
  <li>准备好要问的问题清单</li>
  <li>提前10分钟拨入</li>
  <li>准备好笔和纸记录要点</li>
</ul>

<p><a href="{链接}" style="background:#007bff;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;">查看订单</a></p>
```

---

### ⑩ 专家已拒绝订单（研究员）
**主题**: 订单匹配失败 - {专家姓名}无法接受

**正文**:
```html
<h2>亲爱的 {用户名}，</h2>
<p>很抱歉，{专家姓名} 无法接受您的订单。</p>
<p><strong>拒绝原因</strong>：{原因}</p>
<p>我们已为您重新匹配其他专家，请查看：</p>

<table bgcolor="#f8d7da" cellpadding="15" style="border-radius:10px;">
  <tr>
    <td>
      <h3>新推荐专家</h3>
      <p>专家：{新专家姓名} | {新专家机构} | {新专家职位}</p>
      <p>匹配度：{匹配度}</p>
      <p>咨询次数：{次数}</p>
      <p>评分：{评分}⭐</p>
    </td>
  </tr>
</table>

<p><a href="{链接}" style="background:#007bff;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;">查看新推荐</a></p>
```

---

### ⑪ 咨询即将开始提醒（研究员+专家）
**主题**: 咨询即将开始（1小时后）- {订单号}

**正文**:
```html
<h2>亲爱的 {用户名}，</h2>
<p>您的咨询将在 <strong>1小时后</strong> 开始，请做好准备。</p>

<table bgcolor="#fff3cd" cellpadding="15" style="border-radius:10px;">
  <tr>
    <td>
      <h3>咨询信息</h3>
      <p>订单号：{订单号}</p>
      <p>对方：{对方姓名} | {对方机构}</p>
      <p>咨询形式：{形式}</p>
      <p>咨询时间：{时间}</p>
      <p>拨入号码：400-000-0000（输入订单号+密码）</p>
    </td>
  </tr>
</table>

<p><strong>准备建议</strong>：</p>
<ul>
  <li>测试网络、音频、视频</li>
  <li>准备相关资料</li>
  <li>选择安静、私密的环境</li>
</ul>

<p><a href="{链接}" style="background:#007bff;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;">查看订单</a></p>
```

---

### ⑫ 咨询已完成（研究员+专家）
**主题**: 咨询已完成 - {订单号}

**正文**:
```html
<h2>亲爱的 {用户名}，</h2>
<p>您的咨询已完成。</p>

<table bgcolor="#d4edda" cellpadding="15" style="border-radius:10px;">
  <tr>
    <td>
      <h3>咨询摘要</h3>
      <p>订单号：{订单号}</p>
      <p>对方：{对方姓名} | {对方机构}</p>
      <p>咨询时长：{时长}</p>
      <p>费用：¥{金额}</p>
    </td>
  </tr>
</table>

<p>请对本次咨询进行评价，帮助其他用户：</p>
<p><a href="{链接}" style="background:#ffc107;color:#000;padding:10px 20px;text-decoration:none;border-radius:5px;">立即评价</a></p>
```

---

### ⑬ 订单取消成功（研究员）
**主题**: 订单已取消 - {订单号}

**正文**:
```html
<h2>亲爱的 {用户名}，</h2>
<p>您的订单已取消。</p>

<table bgcolor="#e2e3e5" cellpadding="15" style="border-radius:10px;">
  <tr>
    <td>
      <h3>取消信息</h3>
      <p>订单号：{订单号}</p>
      <p>取消原因：{原因}</p>
      <p>退款金额：¥{金额}</p>
      <p>退款时间：3-7个工作日</p>
    </td>
  </tr>
</table>

<p>费用将在3-7个工作日内原路退回。</p>
<p><a href="{链接}">查看订单</a> | <a href="{链接}">再次下单</a></p>
```

---

### ⑭ 退款成功（研究员）
**主题**: 退款成功 - ¥{金额}

**正文**:
```html
<h2>亲爱的 {用户名}，</h2>
<p>您的退款已成功。</p>

<table bgcolor="#d4edda" cellpadding="15" style="border-radius:10px;">
  <tr>
    <td>
      <h3>退款信息</h3>
      <p>订单号：{订单号}</p>
      <p>退款金额：¥{金额}</p>
      <p>退款方式：{方式}（原路退回）</p>
      <p>到账时间：3-7个工作日</p>
    </td>
  </tr>
</table>

<p>请注意查收。如超过7个工作日未到账，请联系客服。</p>
```

---

## 五、积分通知（6封）

### ⑮ 积分到账通知
**主题**: 积分已到账 +{积分}积分

**正文**:
```html
<h2>亲爱的 {用户名}，</h2>
<p>您的积分账户有新的变动。</p>

<table bgcolor="#cce5ff" cellpadding="15" style="border-radius:10px;">
  <tr>
    <td>
      <h3>积分变动</h3>
      <p>变动类型：{类型}（完成咨询/评价专家/邀请好友...）</p>
      <p>变动积分：+{积分}</p>
      <p>当前积分：{当前积分}</p>
    </td>
  </tr>
</table>

<p><a href="{链接}" style="background:#007bff;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;">查看积分</a> | <a href="{链接}">兑换礼品</a></p>
```

---

### ⑯ 积分扣除通知
**主题**: 积分已扣除 -{积分}积分

**正文**:
```html
<h2>亲爱的 {用户名}，</h2>
<p>您的积分账户有新的变动。</p>

<table bgcolor="#fff3cd" cellpadding="15" style="border-radius:10px;">
  <tr>
    <td>
      <h3>积分变动</h3>
      <p>变动类型：{类型}（下单抵扣/兑换礼品/转让...）</p>
      <p>变动积分：-{积分}</p>
      <p>当前积分：{当前积分}</p>
    </td>
  </tr>
</table>

<p><a href="{链接}">查看积分明细</a></p>
```

---

### ⑰ 积分即将过期提醒
**主题**: ⚠️ 积分即将过期（{积分}积分）

**正文**:
```html
<h2>亲爱的 {用户名}，</h2>
<p>您有 <strong>{积分}积分</strong> 将在 <strong>7天后</strong> 过期，请尽快使用。</p>

<table bgcolor="#fff3cd" cellpadding="15" style="border-radius:10px;">
  <tr>
    <td>
      <h3>即将过期积分</h3>
      <p>积分：{积分}</p>
      <p>获得时间：{时间}</p>
      <p>过期时间：{时间}</p>
    </td>
  </tr>
</table>

<p>您可以使用积分：</p>
<ul>
  <li>抵扣咨询费（100积分=¥1）</li>
  <li>兑换礼品（咖啡券、购物卡、Kindle...）</li>
  <li>转让给其他用户</li>
</ul>

<p><a href="{链接}" style="background:#dc3545;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;">立即使用</a></p>
```

---

### ⑱ 积分兑换成功
**主题**: 兑换成功 - {礼品名称}

**正文**:
```html
<h2>亲爱的 {用户名}，</h2>
<p>您的积分兑换已成功。</p>

<table bgcolor="#d4edda" cellpadding="15" style="border-radius:10px;">
  <tr>
    <td>
      <h3>兑换信息</h3>
      <p>礼品：{礼品名称}</p>
      <p>消耗积分：{积分}</p>
      <p>剩余积分：{剩余积分}</p>
      <p>发货时间：{时间}（实物礼品3-5个工作日，虚拟礼品即时到账）</p>
    </td>
  </tr>
</table>

<p>请注意查收。如有问题，请联系客服。</p>
```

---

### ⑲ 积分排行榜更新
**主题**: 恭喜！您上榜了 🏆

**正文**:
```html
<h2>亲爱的 {用户名}，</h2>
<p>恭喜！您在本周积分排行榜位列 <strong>第{名次}名</strong>。</p>

<table bgcolor="#fff3cd" cellpadding="15" style="border-radius:10px;">
  <tr>
    <td>
      <h3>您的成绩</h3>
      <p>本周积分：{积分}</p>
      <p>排名：第{名次}名</p>
      <p>奖励：{奖励}</p>
    </td>
  </tr>
</table>

<p>继续保持，冲击更高的排名！</p>
<p><a href="{链接}" style="background:#007bff;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;">查看排行榜</a></p>
```

---

### ⑳ 连续签到奖励
**主题**: 连续签到{天数}天，奖励{积分}积分

**正文**:
```html
<h2>亲爱的 {用户名}，</h2>
<p>恭喜！您已连续签到 <strong>{天数}天</strong>，获得 <strong>{积分}积分</strong> 奖励。</p>

<table bgcolor="#d4edda" cellpadding="15" style="border-radius:10px;">
  <tr>
    <td>
      <h3>签到信息</h3>
      <p>连续签到天数：{天数}</p>
      <p>本次奖励：{积分}积分</p>
      <p>当前积分：{当前积分}</p>
    </td>
  </tr>
</table>

<p>明天继续签到，可获得更多积分！</p>
<p><a href="{链接}" style="background:#28a745;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;">立即签到</a></p>
```

---

## 六、邮件发送最佳实践

### 6.1 发送时间
```
✅ 最佳发送时间
• 工作日：9:00-11:00，14:00-17:00
• 周末：10:00-12:00

❌ 避免发送时间
• 22:00-8:00（除非紧急事项）
```

### 6.2 邮件主题优化
```
✅ 好的主题
• 具体、清晰、有行动导向
• 例如："订单已确认 - 明天下午2点咨询"

❌ 不好的主题
• 模糊、冗长、无重点
• 例如："您好"、"通知"
```

### 6.3 邮件内容优化
```
✅ 好的内容
• 简洁明了（<500字）
• 有清晰的CTA按钮
• 移动友好（响应式设计）

❌ 不好的内容
• 冗长复杂（>1000字）
• 无明确行动指引
• 桌面端设计（手机端难读）
```

---

## 七、总结

本文案为产研通ProLink提供20封邮件通知模板，覆盖：

✅ **系统通知（7封）** - 注册、认证、安全、维护  
✅ **订单通知（7封）** - 下单、匹配、提醒、完成、取消、退款  
✅ **积分通知（6封）** - 到账、扣除、过期、兑换、排行榜、签到  

**下一步行动**
1. 将邮件模板交付技术团队实施
2. 配置邮件发送系统（SMTP、模板变量）
3. A/B测试优化邮件主题和内容（打开率、点击率）
4. 定期检查邮件发送数据，持续优化

---

**任务完成时间**: 2026-06-21 11:15  
**交付物**: `reports/task-96.md`  
**下一步**: 所有8个任务已完成（#85-#88, #93-#96），请求2号AI安排新任务
