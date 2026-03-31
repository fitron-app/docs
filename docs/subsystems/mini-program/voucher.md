# 微信小程序 — 外部券码核销

上级文档：[微信小程序](../mini-program)

---

### 概述

> 对应主文档 §2.1（外部券码）

外部券码核销用于处理用户在抖音、美团等外部平台购买的兑换券。一期支持**两种核销方式**：

1. **手动输入券码**：用户复制券码后粘贴
2. **线下扫码**：用户扫描门店张贴的二维码跳转到兑换页

> **二期规划**：支持通过美团/抖音开放平台 API 自动查询用户手机号下的未核销券，**免粘贴，一键核销**。

### 页面路由

| 路由 | 页面 | 说明 |
|:---:|---|---|
| `/pages/voucher/redeem` | 兑换券码 | 手动输入 / 扫码 |

### 一期：手动输入 + 扫码

#### 兑换页要素

- 返回按钮 + 「兑换券码」标题
- 说明文案：「在抖音/美团等平台购买的券码，在此兑换使用」
- 输入框：支持粘贴券码
- 「或」分隔线
- 扫码入口：调用 `wx.scanCode`，二维码内容为券码字符串
- 「立即兑换」按钮

#### 交互规则

1. 输入框支持粘贴
2. 扫码调用 `wx.scanCode`，二维码内容为券码字符串
3. 兑换成功展示获得的产品和有效期
4. 失败展示具体原因：券码无效 / 已使用 / 已过期 / 活动已结束
5. 同一批次同一用户限兑换 1 张

#### 异常处理

| 异常 | 处理 |
|---|---|
| 券码无效 | 「该券码不存在或已失效」 |
| 已使用 | 「该券码已被使用」 |
| 已过期 | 「该券码已过期」 |
| 活动已结束 | 「该活动已结束，无法兑换」 |
| 重复兑换 | 「同一批次限兑换 1 张」 |
| 扫码失败 | 提示「扫描失败，请重试」 |

---

## 二期：平台 API 自动同步（规划）

### 设计思路

用户不需要手动复制粘贴券码，系统通过美团/抖音开放平台 API，按用户手机号自动查询该用户在本店的未核销券，直接在小程序内展示并一键核销。

### 美团自动核销

#### 接入方案

1. 管理后台配置美团开放平台 API 凭证（AppKey、AppSecret、商户 ID）
2. 用户在小程序内授权手机号（`wx.getPhoneNumber`）
3. 后端通过手机号调用美团 API 查询该用户的未核销券
4. 小程序展示可核销券列表，用户点击即可核销

#### 数据流程

```
用户打开「我的券包」页面
    │
    ├─ 后端调用美团 API: mt.deal.order.list
    │   参数: { phone: 用户手机号, dealId: 团购ID, status: "unuse" }
    │
    ├─ 返回未核销券列表
    │
    └─ 展示券列表（券名、有效期、核销截止日期）
         │
         ├─ 点击「立即使用」
         │   ├─ 后端调用美团 API: mt.deal.use
         │   ├─ 核销成功 → 展示获得的产品和有效期
         │   └─ 核销失败 → 展示原因
         │
         └─ 券即将过期 → 提醒用户尽快使用
```

#### 美团 API 参考

| API | 说明 | 参数 |
|---|---|---|
| `mt.deal.order.list` | 查询团购订单 | `phone`、`dealId`、`status` |
| `mt.deal.use` | 核销团购券 | `couponId`、`open_uuid` |

#### 管理后台配置

| 配置项 | 说明 |
|---|---|
| 美团 AppKey | 开放平台应用标识 |
| 美团 AppSecret | 开放平台应用密钥 |
| 美团商户 ID | 本店在美团平台的商户 ID |
| 团购 ID 列表 | 本店上架的团购活动 ID |

### 抖音自动核销

#### 接入方案

1. 管理后台配置抖音开放平台 API 凭证
2. 用户授权手机号后，后端调用抖音券核销 API 查询
3. 小程序展示可核销券，一键核销

#### 数据流程

```
用户打开「我的券包」页面
    │
    ├─ 后端调用抖音 API: life.coupon.order.list
    │   参数: { phone: 用户手机号, status: "unused" }
    │
    ├─ 返回未核销券列表
    │
    └─ 展示券列表
         │
         ├─ 点击「立即使用」→ 后端调用 life.coupon.verify → 核销
         └─ 券即将过期 → 提醒
```

#### 抖音 API 参考

| API | 说明 | 参数 |
|---|---|---|
| `life.coupon.order.list` | 查询券订单 | `phone`、`status` |
| `life.coupon.verify` | 核销券 | `order_id`、`verify_code` |

### 二期页面路由（新增）

| 路由 | 页面 | 说明 |
|:---:|---|---|
| `/pages/voucher/my-coupons` | 我的券包 | 外部平台券自动同步列表 |
| `/pages/voucher/bind-phone` | 绑定手机号 | 授权手机号（如尚未绑定） |

### 二期接口

```
POST /api/v1/user/phone
  Auth: JWT
  Body: { code: string }  // wx.getPhoneNumber 返回的 code
  Response: { success: boolean, phone: string }

GET /api/v1/vouchers/external?platform=meituan
  Auth: JWT
  Response: {
    items: [
      {
        id,
        platform: 'meituan' | 'douyin',
        couponName,
        dealName,
        originalPrice,
        dealPrice,
        validBeginTime,
        validEndTime,
        status: 'unused' | 'used' | 'expired'
      }
    ]
  }

POST /api/v1/vouchers/external/:id/redeem
  Auth: JWT
  Response: {
    success: boolean,
    message: string,
    order?: Order  // 核销成功时返回生成的订单
  }
```

### 接口（一期，手动输入）

```
POST /api/v1/vouchers/redeem
  Auth: JWT
  Body: { code: string }
  Response: {
    success: boolean,
    message: string,
    order?: Order
  }
```
