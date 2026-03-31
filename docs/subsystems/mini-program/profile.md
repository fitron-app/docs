# 微信小程序 — 个人中心

上级文档：[微信小程序](../mini-program)

---

### 概述

> 对应主文档 §8.8

个人中心是用户管理个人信息、查看权益、使用功能的统一入口。所有功能子页面的导航都从个人中心发起。

### 页面路由

| 路由 | 页面 | 说明 |
|:---:|---|---|
| `/pages/profile/index` | 个人中心 | 功能导航主页 |
| `/pages/profile/face-manage` | 人脸管理 | 查看/重新录入人脸 |

### 个人中心页要素

#### 用户信息区

- 头像 + 昵称
- 手机号（脱敏展示）
- 当前会员卡摘要（如有）：套餐名称 + 到期日期
- 「编辑资料」入口

#### 功能菜单列表

| 菜单项 | 图标 | 跳转 | 说明 |
|---|---|---|---|
| 我的会员 | 🟢 | `/pages/profile/membership` | 查看有效/历史会员 |
| 我的订单 | 📋 | `/pages/order/list` | 订单列表 |
| 优惠券 | 🎫 | `/pages/coupon/list` | 我的优惠券 |
| 人脸管理 | 📸 | `/pages/profile/face-manage` | 查看/重新录入 |
| 兑换券码 | 🎁 | `/pages/voucher/redeem` | 外部平台券码兑换 |
| 淋浴控制 | 🚿 | `/pages/shower/index` | 启动/查看淋浴 |
| 联系客服 | 📞 | 客服方式 | 一期：展示微信号/电话 |
| 语言切换 | ⚙️ | 语言设置 | 中/EN 切换 |
| 关于我们 | ℹ️ | 关于页面 | 版本信息、隐私政策、用户协议 |

#### 我的会员摘要区

在用户信息下方展示当前有效会员卡的快捷摘要：
- 会员卡名称 + 状态标签
- 到期时间或剩余天数
- 「查看全部会员 >」跳转

### 人脸管理页要素

- 返回按钮 + 「人脸管理」标题
- 人脸状态卡片：已录入/未录入 + 录入时间
- 隐私说明：「人脸数据用于健身房刷脸进出验证」
- 「重新录入」按钮（已录脸时展示）
- 删除说明：「如需删除人脸数据，请联系客服」
- 「📞 联系客服」入口

### 客服与帮助

#### 一期方案

- 个人中心和首页各保留一个固定客服入口
- 点击后展示客服微信号/电话号码
- 支持一键复制微信号
- 支持拨打电话（`wx.makePhoneCall`）

#### 帮助页要素

- 常见问题（FAQ）列表
- 每个问题可展开查看答案
- 底部固定「联系客服」入口

### 接口

```
GET /api/v1/user/profile
  Auth: JWT
  Response: {
    id, nickname, avatarUrl, phone,
    faceEnrolled: boolean,
    faceEnrolledAt: string | null,
    locale: 'zh' | 'en'
  }

PUT /api/v1/user/profile
  Auth: JWT
  Body: { nickname?: string, locale?: string }
  Response: { success: boolean }
```
