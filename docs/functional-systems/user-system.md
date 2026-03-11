# 用户系统

**涉及子系统**：云端 API（核心）、管理后台（管理）、小程序（注册/个人中心）  
**核心业务**：用户注册、身份认证、人脸数据绑定、会员状态管理

---

## 用户注册流程

```
用户打开小程序
      │
      ▼
wx.login 获取 code
      │
      ▼
POST /api/v1/auth/wx-login（传入 code）
服务端：code 换取 openId + session_key
      │
 ┌────┴──────┐
 │ 用户已存在 │──► 更新登录时间 → 签发 JWT → 返回
 └───────────┘
      │ 新用户
      ▼
创建用户记录（openId、微信昵称、头像 URL）
签发 JWT
      │
      ▼
引导用户完成人脸录入（新用户标记 faceEnrolled=false）
```

---

## 用户数据模型

```
User {
  id              String       # 用户唯一标识
  wxOpenId        String       # 微信 openId（唯一）
  wxUnionId       String?      # 微信 unionId（多平台互通用）
  nickname        String?      # 微信昵称
  avatarUrl       String?      # 头像 URL
  phone           String?      # 手机号（用户授权后获取）
  faceEnrolled    Boolean      # 是否已完成人脸录入
  faceEnrolledAt  DateTime?    # 人脸录入时间
  status          Enum         # ACTIVE / BANNED / DELETED
  createdAt       DateTime
  lastLoginAt     DateTime
}
```

---

## 会员状态查询

用户的会员状态不单独存储字段，而是**实时从订单系统查询**：

```
GET /api/v1/user/membership?storeId=xxx
        │
        ▼
查询该用户在指定门店的 ACTIVE 订单
        │
        ▼
返回：
{
  "eligible": true/false,
  "memberships": [
    {
      "productName": "月卡",
      "expiresAt": "2026-04-11",
      "remainingTimes": null   // 不限次
    },
    {
      "productName": "次卡10次",
      "expiresAt": "2026-06-11",
      "remainingTimes": 7
    }
  ]
}
```

---

## 人脸绑定管理

| 操作 | 入口 | 说明 |
|---|---|---|
| 录入人脸 | 小程序 → 个人中心 → 人脸管理 | 首次录入，引导流程 |
| 重新录入 | 小程序 → 个人中心 → 人脸管理 | 覆盖旧数据 |
| 删除人脸 | 管理后台 → 用户详情 | 仅管理员可操作（如用户投诉隐私） |
| 查看状态 | 管理后台 → 用户详情 | 显示已录入/未录入及录入时间 |

录入/重录后，工控机通过 MQTT 实时同步新的特征向量到本地库。

---

## 用户封禁逻辑

- 管理员在管理后台可将用户设为 `BANNED` 状态
- 封禁用户刷脸时，云端 API 返回 `eligible: false, reason: "账号已封禁"`
- 工控机拒绝开门并播报提示

---

## 管理后台用户功能

- **用户列表**：搜索（手机号/昵称）、筛选（会员状态/有无人脸）
- **用户详情**：
  - 基本信息（昵称、注册时间、手机号）
  - 会员状态（当前有效套餐）
  - 人脸信息（录入状态、录入时间）
  - 订单历史
  - 进出记录
  - 操作：手动封禁/解封、删除人脸数据
- **数据导出**：用户列表 Excel 导出

---

## 隐私合规说明

- 人脸特征向量属于**生物特征数据**，需在用户授权后方可采集
- 小程序端在人脸录入前需展示《隐私政策》并获取用户同意
- 用户可随时申请删除人脸数据（通过客服或管理后台操作）
- 人脸图片原图建议不做永久存储（特征向量提取后删除原图）

---

## 待确认事项

- [ ] 手机号是否为必填（建议可选，降低注册门槛）
- [ ] 是否支持同一用户在多门店独立建立人脸记录（目前设计为全局唯一）
- [ ] 用户注销账号的流程（数据保留多久后彻底删除）
- [ ] 微信 unionId 是否需要对接（跨小程序/公众号场景）
