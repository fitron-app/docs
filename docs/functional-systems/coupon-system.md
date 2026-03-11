# 优惠券系统

**涉及子系统**：云端 API（核心）、管理后台（创建/发放）、小程序（领取/使用）  
**核心业务**：支持多种优惠券类型，覆盖发放、领取、使用（核销）全流程

---

## 优惠券类型

| 类型 | 说明 | 示例 |
|---|---|---|
| 折扣券 | 按比例打折 | 9 折券 |
| 满减券 | 满指定金额减固定金额 | 满 100 减 20 |
| 固定金额券 | 直接抵扣固定金额 | 抵扣 50 元 |
| 免费体验券 | 指定产品免费兑换（通常为体验卡） | 免费体验 1 次 |

---

## 优惠券数据模型

```
CouponTemplate {
  id              String       # 优惠券模板 ID
  name            String       # 券名称（如"新用户专享50元券"）
  type            Enum         # DISCOUNT / CASH_MINUS / FIXED_CASH / FREE_PRODUCT
  discountRate    Decimal?     # 折扣率（type=DISCOUNT，如 0.9 = 9折）
  thresholdAmount Decimal?     # 使用门槛（满 N 元可用）
  discountAmount  Decimal?     # 优惠金额（type=CASH_MINUS / FIXED_CASH）
  freeProductId   String?      # 兑换的产品（type=FREE_PRODUCT）
  applicableProducts String[]  # 可用产品范围（空=全场通用）
  totalStock      Int?         # 总发放数量（null=不限量）
  issuedCount     Int          # 已发放数量
  usedCount       Int          # 已核销数量
  validDays       Int          # 领取后有效天数
  startAt         DateTime?    # 活动开始时间
  endAt           DateTime?    # 活动结束时间
  isActive        Boolean      # 是否启用
}

UserCoupon {
  id              String       # 用户优惠券 ID
  userId          String       # 用户 ID
  templateId      String       # 关联模板
  status          Enum         # UNUSED / USED / EXPIRED
  issuedAt        DateTime     # 发放时间
  expiresAt       DateTime     # 到期时间（issuedAt + validDays）
  usedAt          DateTime?    # 使用时间
  usedOrderId     String?      # 使用的订单 ID
}
```

---

## 发放方式

| 发放方式 | 触发时机 | 操作入口 |
|---|---|---|
| 注册赠券 | 用户首次注册时自动发放 | 云端 API 自动触发 |
| 活动发放 | 管理员批量发放给指定用户群 | 管理后台 → 优惠券管理 |
| 分享领取 | 用户分享小程序，好友领取 | 小程序分享 + 云端 API |
| 购买赠券 | 购买指定产品时赠送下一次用的优惠券 | 云端 API 订单回调触发 |
| 手动发放 | 客服处理投诉/补偿时手动发放 | 管理后台 → 用户详情 |

---

## 核销流程

```
用户在小程序选择产品 → 勾选可用优惠券
        │
        ▼
POST /api/v1/orders（传入 couponId）
服务端：校验优惠券
  ├── 检查 status = UNUSED
  ├── 检查 expiresAt > now
  ├── 检查产品是否在 applicableProducts 范围内
  └── 检查满足 thresholdAmount 条件
        │
   ┌────┴────┐
   │ 校验通过 │──► 计算折扣后金额 → 创建订单
   └─────────┘
        │
        ▼
用户支付成功后（微信回调确认）
        │
        ▼
更新 UserCoupon.status = USED
写入 usedAt / usedOrderId
```

---

## 管理后台功能

- **优惠券模板管理**：创建/编辑/停用优惠券模板
- **发放记录**：查看每张优惠券的发放对象、领取/使用状态
- **批量发放**：按条件筛选用户群，批量发放指定优惠券
- **核销记录**：查看优惠券使用情况，关联到具体订单

---

## 小程序展示规则

- 购买页面下方展示「可用优惠券 N 张」入口
- 点击展开可用/不可用两个 Tab
- 不可用券显示不可用原因（未达门槛/不适用此产品/已过期）

---

## 待确认事项

- [ ] 注册赠券的具体方案（赠什么券、金额/折扣）
- [ ] 是否支持优惠码（用户手动输入码领券）
- [ ] 优惠券是否可以叠加使用（当前设计为每单仅用一张）
- [ ] 免费体验券是否需要特殊核销逻辑（无支付流程）
