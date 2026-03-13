# 刷脸系统（AB 门）

**涉及子系统**：工控机（核心）、云端 API（人脸验证/同步）、小程序（人脸录入）  
**核心业务**：通过 AB 门隔离间 + 人脸识别，实现用户无人值守安全进出健身房

---

## 系统概述

入口采用 **AB 门隔离间**结构：两道门（A 门朝外、B 门朝内）围成一个独立隔离区域。

```mermaid
graph LR
    Street["外部街道"]
    DoorA["A 门（外门）\nfail-safe 常开型电磁锁"]
    Chamber["隔离间\n海康刷脸终端 + 人数检测摄像头"]
    DoorB["B 门（内门）\nfail-safe 常开型电磁锁"]
    Gym["健身区内部"]

    Street -- "按钮 ①" --> DoorA --> Chamber -- "刷脸后自动解锁" --> DoorB --> Gym
```

**硬件说明：**

| 设备 | 安装位置 | 作用 |
|---|---|---|
| A 门外侧进门按钮 ① | A 门外侧 | 触发进门流程（无需刷脸） |
| 海康刷脸终端 | 隔离间内（A 门内侧） | 活体检测 + 质量检测，通过后推送工控机识别 |
| 人数检测摄像头 | 隔离间内 | AI 视频分析，精确统计隔离间内人数（0人/1人） |
| B 门健身区侧出门按钮 ② | B 门健身区侧 | 触发出门流程 |
| 隔离间内 A 门侧开门按钮 ③ | 隔离间内（A 门内侧） | 出门最后一步，从隔离间离开 |
| 电磁锁（A/B 门） | 门框 | **fail-safe 常开型**：断电/紧急情况自动开门，通电后受控 |

---

## 进门流程

### 第一步：A 门开启（无需刷脸）

用户按下 **A 门外侧进门按钮 ①**，工控机检查：

| 条件 | 要求 |
|---|---|
| B 门状态 | 锁定 |
| 隔离间人数 | 0 人（摄像头检测） |

两个条件均满足 → A 门电磁锁解锁，用户**推门**进入隔离间。

### 第二步：隔离间内刷脸

```mermaid
flowchart TD
    Enter["用户进入隔离间"] --> MagA["A 门关闭（门磁检测）"]
    MagA --> LockA["A 门立即锁定"]
    LockA --> FaceScreen["海康刷脸终端激活\n活体检测 + 质量检测（终端本地处理）"]
    FaceScreen -->|"质量不通过"| RetryFace["提示重试"]
    FaceScreen -->|"质量通过"| PushToIPC["人脸数据推送工控机\n执行人脸识别"]
    PushToIPC --> CheckCount{"隔离间人数检测\n（摄像头）"}
    CheckCount -->|"≠ 1 人"| Reject["拒绝：隔离间内必须只有一人\n语音提示"]
    CheckCount -->|"= 1 人"| FaceMatch["人脸识别比对\n本地库 → 云端回退"]
    FaceMatch -->|"未命中"| FaceFail["拒绝：人脸识别失败，请重试"]
    FaceMatch -->|"命中"| CheckMembership{"检查会员资格\nGET /api/v1/device/membership"}

    CheckMembership -->|"eligible: true"| UnlockB["B 门解锁\n30秒倒计时开始\n提示：请推门进入"]
    CheckMembership -->|"no_valid_order"| NoMember["B 门不开\n提示：请先购买套餐"]
    CheckMembership -->|"times_exhausted"| TimesOut["B 门不开\n提示：次数已用完，请续卡"]
    CheckMembership -->|"trial_refund_eligible"| TrialRefund["体验卡退款流程\n见下方"]
    CheckMembership -->|"trial_refund_expired"| TrialExpired["B 门不开\n提示：体验已结束，退款窗口已关闭"]
```

### 第三步：B 门通过与扣费

```mermaid
flowchart TD
    UnlockB["B 门解锁（30秒倒计时）"]
    UnlockB -->|"30秒内用户推门"| PushB["用户推门进入健身区"]
    UnlockB -->|"30秒内未推门"| Timeout["B 门重新锁定\n不扣费\n用户可按隔离间内 A 门侧按钮 ③ 离开"]
    PushB --> MagBClose["B 门关闭（门磁检测）"]
    MagBClose --> LockBImm["B 门立即锁定"]
    LockBImm --> Charge["扣费一次\nPOST /api/v1/device/checkin"]
    Charge --> WriteLog["进入记录写入云端\n用户ID / 门店ID / 时间戳"]
```

> **关键规则**：B 门解锁后用户需主动推门，**30 秒内未推门则重新锁定且不扣费**。用户推门进入、B 门关闭后立即锁定，同时扣费。

---

## 出门流程

### 第一步：从健身区进入隔离间

用户按下 **B 门健身区侧出门按钮 ②**，工控机检查：

| 条件 | 要求 |
|---|---|
| A 门状态 | 锁定 |
| 隔离间人数 | 0 人（摄像头检测） |

条件满足 → B 门解锁，用户推门进入隔离间 → B 门关闭后立即锁定。

### 第二步：从隔离间离开

用户按下 **隔离间内 A 门侧开门按钮 ③**，工控机检查：

| 条件 | 要求 |
|---|---|
| B 门状态 | 锁定（满足，因第一步已锁定） |

条件满足 → A 门解锁，用户推门离开健身房。

```mermaid
flowchart TD
    PressBtn2["按 B 门健身区侧按钮 ②"]
    PressBtn2 --> CheckExit{"A门锁定？\n隔离间0人？"}
    CheckExit -->|"否"| WaitExit["等待条件满足"]
    CheckExit -->|"是"| UnlockBOut["B 门解锁"]
    UnlockBOut --> EnterChamber["用户进入隔离间\n推门后 B 门关闭"]
    EnterChamber --> LockBOut["B 门立即锁定"]
    LockBOut --> PressBtn3["用户按隔离间内 A 门侧按钮 ③"]
    PressBtn3 --> UnlockAOut["A 门解锁（B门已锁，直接开）"]
    UnlockAOut --> LeaveA["用户推门离开"]
    LeaveA --> MagAClose["A 门关闭（门磁检测）"]
    MagAClose --> LockAOut["A 门锁定"]
    LockAOut --> WriteExitLog["离开记录写入云端"]
```

> **出门全程无需刷脸**，也不受会员有效期/体验卡状态限制。

---

## 体验卡退款流程

当刷脸结果为 `trial_refund_eligible`（体验卡在 10 分钟退款窗口内）时：

```mermaid
flowchart TD
    Trigger["收到 trial_refund_eligible"]
    Trigger --> Notify["提示：检测到体验卡\n将为您退款 ¥XX，请稍候"]
    Notify --> CallRefund["POST /api/v1/orders/trial-refund"]
    CallRefund --> Result{"退款结果"}
    Result -->|"成功"| UnlockAOut["A 门解锁\n提示：退款成功，请出门"]
    Result -->|"失败"| RefundFail["提示：退款失败，请联系客服\nA 门同样解锁放行"]
    UnlockAOut --> Leave["用户推开 A 门离开"]
    RefundFail --> Leave
    Leave --> LockA["A 门关闭后锁定"]
    LockA --> PushMsg["小程序通知：退款结果 + 金额"]
```

> **原则**：退款无论成功失败均放行用户，不得将用户困在隔离间。失败时记录异常待人工补退。

### 体验卡超时规则

| 情况 | 用户在隔离间刷脸结果 |
|---|---|
| 10 分钟内返回隔离间刷脸 | `trial_refund_eligible` → 退款 + 结束体验 |
| 超出 10 分钟，按天计费卡 | `eligible: true` → 正常扣费，可继续使用 |
| 超出 10 分钟，按次计费卡 | `times_exhausted` → B 门不开，提示次数已用完 |
| 超出 10 分钟且退款窗口关闭 | `trial_refund_expired` → B 门不开，退款窗口已关闭 |

---

## 边界情况处理

| 场景 | 处理方式 |
|---|---|
| 断电 / UPS 切换 | fail-safe 电磁锁断电自动开门，用户可自由离开（地震等紧急情况同） |
| 工控机与云端断网 | 本地库有记录的用户正常进入；本地库无记录的用户无法进入（暂不支持离线注册） |
| 多人同时进入隔离间 | 人数检测摄像头检测到 > 1 人 → 拒绝刷脸，语音提示"隔离间内只允许一人" |
| 刷脸后 30 秒未推门 | B 门重新锁定，不扣费；用户可按隔离间内按钮 ③ 离开 |
| 人数检测摄像头故障 | 触发告警，上报云端；管理员可通过管理后台远程手动开门 |
| 隔离间内滞留超时 | 超过配置时间后语音提示，可选择解锁 A 门放行（需管理员确认） |

---

## 状态机定义

### 状态变量

| 变量 | 初始值 | 说明 |
|---|---|---|
| `doorA_locked` | `true` | A 门锁定状态 |
| `doorB_locked` | `true` | B 门锁定状态 |
| `doorA_closed` | `true` | A 门关闭状态（门磁） |
| `doorB_closed` | `true` | B 门关闭状态（门磁） |
| `chamber_count` | `0` | 隔离间内人数（摄像头检测，0 或 1） |
| `pending_user` | `null` | 当前隔离间内待验证的用户（刷脸成功后赋值） |
| `b_unlock_timer` | `null` | B 门解锁后的 30 秒倒计时 |

### 事件触发器

| 事件 | 触发条件 | 执行动作 |
|---|---|---|
| `EVT_BTN_A_OUTER` | 按下 A 门外侧按钮 ① | 检查 B 门锁定 + 隔离间 0 人 → 解锁 A 门 |
| `EVT_DOOR_A_CLOSE` | 门磁：A 门关闭 | 立即锁定 A 门，触发刷脸等待 |
| `EVT_FACE_QUALITY_PASS` | 海康终端质量检测通过 | 推送人脸数据到工控机识别 |
| `EVT_FACE_SUCCESS` | 人脸识别通过 + `eligible: true` | 检查隔离间恰好 1 人 → 解锁 B 门，启动 30 秒计时 |
| `EVT_FACE_TRIAL_REFUND` | `trial_refund_eligible` | 触发退款流程 → 解锁 A 门 |
| `EVT_DOOR_B_CLOSE_ENTER` | 门磁：B 门关闭（进门方向） | 立即锁定 B 门，取消计时，扣费，写入进入记录 |
| `EVT_B_UNLOCK_TIMEOUT` | 30 秒计时到期且 B 门未开 | B 门重新锁定，不扣费 |
| `EVT_BTN_B_INNER` | 按下 B 门健身区侧按钮 ② | 检查 A 门锁定 + 隔离间 0 人 → 解锁 B 门 |
| `EVT_DOOR_B_CLOSE_EXIT` | 门磁：B 门关闭（出门方向） | 立即锁定 B 门 |
| `EVT_BTN_A_INNER` | 按下隔离间内 A 门侧按钮 ③ | 检查 B 门锁定 → 解锁 A 门 |
| `EVT_DOOR_A_CLOSE_EXIT` | 门磁：A 门关闭（出门方向） | 锁定 A 门，写入离开记录 |
| `EVT_CHAMBER_COUNT` | 摄像头：人数变化 | 更新 `chamber_count` |

---

## 人脸数据流

### 首次录入（小程序端）

```mermaid
flowchart TD
    Capture["小程序采集人脸照片"]
    Capture --> Upload["POST /api/v1/user/face/enroll\n云端提取特征向量存库"]
    Upload --> MqttPush["云端推送 MQTT: store/*/face/sync\n通知所有门店工控机同步特征向量"]
```

### 刷脸验证（工控机端）

```mermaid
flowchart TD
    Terminal["海康刷脸终端\n活体 + 质量检测通过"] --> PushData["推送人脸数据至工控机"]
    PushData --> LocalMatch["本地特征向量比对\nSQLite + 人脸 SDK"]
    LocalMatch -->|"本地命中"| LocalOK["本地验证通过"]
    LocalMatch -->|"未命中"| CloudVerify["POST /api/v1/device/face/verify\n云端比对全库"]
    CloudVerify -->|"云端命中"| SaveLocal["返回特征向量写入本地库"]
    SaveLocal --> CloudOK["验证通过"]
    CloudVerify -->|"未命中"| Fail["验证失败"]
```

---

## 涉及子系统的开发工作

| 子系统 | 工作内容 |
|---|---|
| 工控机 | 状态机实现、GPIO 控制门锁、与海康刷脸终端通信、接收人脸数据并识别、本地人脸库管理、MQTT 上报 |
| 云端 API | 人脸远程验证接口、特征向量存储、进出记录写入、会员资格查询、体验卡退款接口、MQTT 推送 |
| 小程序 | 人脸采集界面、上传人脸接口调用 |
| 管理后台 | 远程手动开门（紧急情况）、进出记录查看 |
