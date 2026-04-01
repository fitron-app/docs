# 管理后台 — 数据分析

上级文档：[管理后台 Web](../admin-web)

---

### 模块概述

数据分析模块为管理层提供经营数据的可视化展示与导出能力，包含仪表盘概览、营收分析、用户分析、运营分析四大板块。数据基于业务数据库聚合计算，同时支持推送至飞书多维表格。

---

### 页面路由

| 路由 | 页面 | 说明 |
|---|---|---|
| `/dashboard` | 经营仪表盘 | 核心指标一览，默认首页 |
| `/analytics` | 数据分析 | 多维度报表，含 Tab 切换 |
| `/analytics/revenue` | 营收分析 | 营收趋势、产品占比、门店对比 |
| `/analytics/users` | 用户分析 | 增长趋势、转化率、留存率 |
| `/analytics/operations` | 运营分析 | 进店热力图、淋浴使用、告警统计 |
| `/analytics/feishu` | 飞书同步 | 飞书多维表格同步状态管理 |

---

## 经营仪表盘（Dashboard）

### 设计原则

仪表盘是管理后台的默认首页，提供**一目了然**的核心经营数据。信息密度适中，避免过载。支持按时间周期切换，受门店上下文影响。

### 核心指标卡片

| 指标 | 字段 | 计算逻辑 | 环比对比 |
|---|---|---|---|
| 今日营收 | `todayRevenue` | 今日所有 PAID/ACTIVE 订单实付金额之和 | vs 昨日同期 |
| 今日进店 | `todayCheckins` | 今日刷脸进入次数（成功开门） | vs 昨日同期 |
| 在场人数 | `currentOccupancy` | 已进入未离开的用户数 | 实时，无对比 |
| 新增用户 | `newUsers` | 今日新注册用户数 | vs 昨日 |
| 有效会员 | `activeMembers` | 当前有 ACTIVE 订单的用户数 | vs 上月同期 |

### 时间周期切换

| 选项 | 说明 |
|---|---|
| 今天 | 今日实时数据，逐分钟更新 |
| 昨天 | 昨日完整数据 |
| 近 7 天 | 最近 7 天趋势 |
| 近 30 天 | 最近 30 天趋势 |
| 本月 | 本月 1 日至今天 |
| 上月 | 上月完整数据 |
| 自定义 | 自选日期范围 |

---

## 营收分析

### 营收趋势图

| 配置项 | 说明 |
|---|---|
| 图表类型 | 折线图 + 柱状图（双轴） |
| X 轴 | 日期 |
| Y 轴（左） | 营收金额（柱状） |
| Y 轴（右） | 订单数量（折线） |
| 粒度 | 按天 / 按周 / 按月（切换） |
| 门店维度 | 全体店汇总 / 按门店分列对比 |

### 产品销售占比

| 配置项 | 说明 |
|---|---|
| 图表类型 | 饼图 / 环形图 |
| 维度 | 按产品类型 / 按具体产品 |
| 指标 | 销售额占比 / 销售数量占比 |

### 门店营收对比

| 配置项 | 说明 |
|---|---|
| 图表类型 | 横向柱状图 |
| 维度 | 按门店 |
| 指标 | 营收金额、订单数量 |
| 时间范围 | 与全局时间选择联动 |

---

## 用户分析

### 用户增长趋势

| 配置项 | 说明 |
|---|---|
| 图表类型 | 折线图 |
| X 轴 | 日期 |
| 指标 | 新注册用户、人脸录入用户 |
| 粒度 | 按天 / 按周 / 按月 |

### 转化漏斗

### 会员续费率

| 指标 | 说明 |
|---|---|
| 定义 | 到期会员中，在到期后 7 天内续费的比例 |
| 展示 | 按产品类型分别统计续费率 |
| 趋势 | 按月展示续费率变化趋势 |

### 用户活跃度

| 配置项 | 说明 |
|---|---|
| 图表类型 | 柱状图 + 分布曲线 |
| X 轴 | 月均进店次数区间（0次、1-3次、4-8次、9-15次、16+次） |
| Y 轴 | 用户数量 |

---

## 运营分析

### 进店热力图

| 配置项 | 说明 |
|---|---|
| 图表类型 | 热力色块图 |
| X 轴 | 星期一 ~ 星期日 |
| Y 轴 | 时段（6:00-23:00，每小时一个格） |
| 色块颜色 | 深度表示进店人数密度 |
| 数据源 | `checkin_logs` 按星期+小时聚合 |

### 淋浴使用统计

| 指标 | 说明 |
|---|---|
| 每日淋浴使用次数 | 柱状图 |
| 平均使用时长 | 饼图/分布图（按时长区间） |
| 高峰时段 | 折线图 |

### 设备告警统计

| 配置项 | 说明 |
|---|---|
| 图表类型 | 柱状图（按告警类型分组） |
| 维度 | 告警类型、门店 |
| 指标 | 告警次数、平均处理时长 |

---

## 飞书多维表格同步

### 同步任务配置

| 表格 | 同步频率 | 数据范围 | [建议值] |
|---|---|---|---|
| 每日经营汇总 | 每天凌晨 02:00 | 各门店前一日营收、进店人次、新增用户 | ✅ |
| 订单明细 | 每小时增量同步 | 近 30 天订单记录 | ✅ |
| 用户列表 | 每天凌晨 02:05 | 全部用户基本信息 + 会员状态 | ✅ |
| 告警记录 | 每小时增量同步 | 近 7 天告警记录 | ✅ |

### 失败处理

- 同步失败时状态变为 🔴 异常，显示错误信息
- [建议值] 自动重试 3 次，间隔 5 分钟
- 3 次仍失败则通知管理员（飞书机器人消息）
- 管理后台提供「手动重试」按钮

---

## 数据导出

### 导出规范

| 报表 | 格式 | 文件名规范 | 说明 |
|---|---|---|---|
| 经营日报 | xlsx | `经营日报_YYYY-MM-DD.xlsx` | 含当日核心指标 |
| 订单明细 | xlsx | `订单明细_YYYY-MM-DD_to_YYYY-MM-DD.xlsx` | 按日期范围 |
| 用户列表 | xlsx | `用户列表_YYYY-MM-DD.xlsx` | 全部用户快照 |
| 进出记录 | xlsx | `进出记录_YYYY-MM-DD_to_YYYY-MM-DD.xlsx` | 按日期范围 |

### 导出规则

1. 所有导出按钮位置统一在页面右上角
2. 导出范围 = 当前筛选条件
3. 数据量 > 10,000 条时采用**异步导出**：点击导出 → 显示「正在生成」→ 完成后推送下载链接
4. 数据量 ≤ 10,000 条时同步下载
5. 导出 Excel 统一中文表头、`YYYY-MM-DD` 日期格式、金额 2 位小数

---

## 权限控制

| 功能 | 老板 | 财务 | 店长 | 客服 | 说明 |
|---|---|---|---|---|---|
| 经营仪表盘 | ✅ 全店 | ✅ 全店 | ✅ 本店 | ❌ | 店长仅看本店数据 |
| 营收分析 | ✅ 全店 | ✅ 全店 | ✅ 本店 | ❌ | — |
| 用户分析 | ✅ | ✅ | ✅ 本店 | ❌ | — |
| 运营分析 | ✅ | ❌ | ✅ 本店 | ❌ | — |
| 数据导出 | ✅ | ✅ | ✅ 本店 | ❌ | — |
| 飞书同步管理 | ✅ | ✅ | ❌ | ❌ | — |

---

## 用户故事

### US-ANALYTICS-01：老板查看今日经营概况

> 作为老板，我打开管理后台时，第一眼就看到今日各门店的核心经营数据。

**验收标准**：
- [ ] 仪表盘为管理后台默认首页
- [ ] 展示今日营收、进店人次、在场人数、新增用户
- [ ] 核心指标卡片带环比对比（vs 昨日/上周同期）
- [ ] 可切换时间周期（今天/近7天/近30天/本月等）
- [ ] 多店模式下展示门店营收对比

### US-ANALYTICS-02：运营人员分析进店高峰时段

> 作为运营人员，我想查看一周内各时段的进店热力图，以便合理安排工作人员和设备维护时间。

**验收标准**：
- [ ] 热力图 X 轴为周一到周日，Y 轴为每小时
- [ ] 颜色深度表示进店人数密度
- [ ] 受门店上下文影响，单店模式下仅展示本店数据
- [ ] 支持导出原始数据

### US-ANALYTICS-03：财务导出月度报表

> 作为财务人员，我想导出指定月份的全部订单数据，以便导入财务系统进行对账。

**验收标准**：
- [ ] 选择月份后，一键导出该月全部订单
- [ ] Excel 包含订单编号、用户、门店、产品、金额、状态、支付时间等完整字段
- [ ] 文件名包含起止日期
- [ ] 大数据量异步生成，完成后通知下载

---

## API 接口规划

```
# 经营概览
GET /api/v1/admin/analytics/overview
  Query: { storeId?, period: 'today'|'yesterday'|'7d'|'30d'|'month'|'lastMonth',
          customStart?, customEnd? }
  Response: {
    todayRevenue, todayCheckins, currentOccupancy, newUsers, activeMembers,
    revenueCompare, checkinsCompare, usersCompare
  }

# 营收趋势
GET /api/v1/admin/analytics/revenue-trend
  Query: { storeId?, startDate, endDate, groupBy: 'day'|'week'|'month' }
  Response: { items: { date, revenue, orderCount }[] }

# 产品销售占比
GET /api/v1/admin/analytics/product-distribution
  Query: { storeId?, startDate, endDate, metric: 'revenue'|'count' }
  Response: { items: { productName, amount, percentage }[] }

# 门店营收对比
GET /api/v1/admin/analytics/store-revenue-compare
  Query: { startDate, endDate }
  Response: { items: { storeName, revenue, orderCount }[] }

# 用户增长趋势
GET /api/v1/admin/analytics/user-growth
  Query: { storeId?, startDate, endDate, groupBy: 'day'|'week'|'month' }
  Response: { items: { date, newUsers, faceEnrolled }[] }

# 转化漏斗
GET /api/v1/admin/analytics/conversion-funnel
  Query: { storeId?, startDate, endDate }
  Response: { registered, faceEnrolled, firstPurchase, repeatPurchase,
              rates: { enrollment, conversion, retention } }

# 进店热力图
GET /api/v1/admin/analytics/checkin-heatmap
  Query: { storeId?, startDate, endDate }
  Response: { grid: { dayOfWeek: 1-7, hour: 6-23, count }[] }

# 飞书同步状态
GET /api/v1/admin/analytics/feishu-sync-status
  Response: { connected, tasks: FeishuSyncTask[] }

# 手动触发同步
POST /api/v1/admin/analytics/feishu-sync-trigger
  Body: { taskIds?: string[] }  // 空数组=全部
  Response: { success: boolean }

# 数据导出
POST /api/v1/admin/analytics/export
  Body: { type: 'daily_report'|'orders'|'users'|'checkins',
          storeId?, startDate, endDate }
  Response: { taskId: string } | { downloadUrl: string }  // 异步/同步
```
