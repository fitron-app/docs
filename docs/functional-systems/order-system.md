# 订单系统

**涉及子系统**：云端 API（核心）、管理后台（查询/退款）、小程序（购买入口）  
**核心业务**：处理用户购买产品套餐的完整生命周期，包括创建、支付、生效、核销、退款

---

## 订单状态流转

```
                    用户下单
                      │
                      ▼
               ┌─── PENDING ───┐
               │  （待支付）    │
               └───────────────┘
                 │           │
         支付成功│           │超时未支付（30分钟）
                 ▼           ▼
          ┌─── PAID ───┐  CANCELLED
          │  （已支付） │  （已取消）
          └────────────┘
                 │
         会员权益生效
                 ▼
          ┌─── ACTIVE ───┐
          │  （使用中）   │
          └──────────────┘
              │       │
    到期/次数用完│     │申请退款
              ▼       ▼
          EXPIRED   ┌─── REFUNDING ───┐
          （已过期） │    （退款中）    │
                    └─────────────────┘
                              │
                       退款成功│
                              ▼
                          REFUNDED
                          （已退款）
```

---

## 订单数据模型

```
Order {
  id              String       # 订单唯一标识（展示用：年月日+随机码）
  userId          String       # 用户 ID
  storeId         String?      # 购买时所在门店（null = 线上购买）
  productId       String       # 产品 ID
  productSnapshot Json         # 购买时产品快照（防止产品修改后影响订单）
  couponId        String?      # 使用的优惠券 ID
  originalAmount  Decimal      # 原价
  discountAmount  Decimal      # 优惠金额
  payAmount       Decimal      # 实付金额
  status          Enum         # PENDING/PAID/ACTIVE/EXPIRED/CANCELLED/REFUNDING/REFUNDED
  paymentMethod   String?      # 支付方式（wechat）
  wxTransactionId String?      # 微信支付流水号
  paidAt          DateTime?    # 支付时间
  expiresAt       DateTime?    # 有效期截止时间（付款后计算）
  remainingTimes  Int?         # 次卡剩余次数
  refundedAt      DateTime?    # 退款时间
  refundReason    String?      # 退款原因
  createdAt       DateTime
  updatedAt       DateTime
}
```

---

## 购买流程

### 小程序端流程

```
用户选择产品 → 选择优惠券（可选）
      │
      ▼
POST /api/v1/orders
（服务端：创建订单记录，状态=PENDING，计算应付金额）
      │
      ▼
服务端调用微信支付统一下单 API
返回 prepay_id 给小程序
      │
      ▼
小程序调用 wx.requestPayment（传入 prepay_id）
      │
 ┌────┴────┐
 │ 支付成功 │
 └─────────┘
      │
      ▼
微信回调 POST /api/v1/payments/wx-notify
（服务端：验签 → 更新订单状态=PAID → 计算并写入 expiresAt/remainingTimes → 状态=ACTIVE）
      │
      ▼
小程序轮询订单状态（或 WebSocket 推送）
显示购买成功页面
```

### 支付回调安全处理

- 回调接口需验证微信签名，防止伪造
- 使用幂等锁防止重复回调处理（基于微信 `transaction_id`）
- 异步处理：回调立即返回 200，业务逻辑异步执行

---

## 核销流程（次卡扣减）

次卡每次用户成功进入时由云端 API 执行：

```
工控机上报进入事件（userId + storeId + orderId）
        │
        ▼
服务端：查找对应 ACTIVE 次卡订单
        │
        ▼
原子操作：remainingTimes - 1
        │
   ┌────┴────┐
   │ 还有次数 │──► 保持 ACTIVE 状态
   └─────────┘
        │ 次数归零
        ▼
   更新状态 = EXPIRED
   写入 order_use_logs 记录
```

---

## 退款规则

| 订单类型 | 退款条件 | 退款金额计算 |
|---|---|---|
| 月卡（未使用） | 未进入过健身房 | 全额退款 |
| 月卡（已使用） | 在有效期内 | 按剩余天数比例退款 |
| 次卡（未使用） | 0 次已用 | 全额退款 |
| 次卡（已使用）| 有剩余次数 | 按剩余次数比例退款 |
| 体验卡 | — | 不支持退款（特殊低价产品） |

> 具体退款规则可在产品配置中设定 `refundPolicy`，上表为默认规则建议。

---

## 管理后台订单功能

- **订单列表**：多维度筛选（时间范围、门店、用户、产品类型、状态）
- **订单详情**：完整信息、支付记录、使用记录
- **手动退款**：填写退款原因，调用微信退款 API，记录操作人
- **数据导出**：支持导出为 Excel/CSV（财务对账用）

---

## 待确认事项

- [ ] 订单是否支持多产品合并购买（一次下单多张卡）
- [ ] 待支付订单超时时间（建议 30 分钟）
- [ ] 体验卡是否完全不支持退款，还是有条件退款
- [ ] 退款是否需要审批流程（管理员直接退 vs 需上级审批）
- [ ] 是否接入微信退款 API 自动退款（vs 线下退款）
