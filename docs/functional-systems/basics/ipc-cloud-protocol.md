# 工控机与云端通信协议定义

**涉及子系统**：工控机、云端 API
**核心业务**：定义工控机与云端之间 MQTT 指令和 HTTP 上报的完整格式规范

---

## 通信架构

```
工控机 ──── MQTT over TLS ────► MQTT Broker（云端）◄──── 云端 API 服务
工控机 ──── HTTPS ────────────► 云端 API（HTTP 上报）
```

---

## MQTT Topic 规范

| Topic 方向 | Topic 格式 | 说明 |
|---|---|---|
| 云端 → 工控机（指令） | `fitron/ipc/{ipcId}/cmd` | 云端下发控制指令 |
| 工控机 → 云端（事件） | `fitron/ipc/{ipcId}/event` | 工控机上报事件 |
| 工控机 → 云端（状态） | `fitron/ipc/{ipcId}/status` | 定期上报设备状态 |

---

## 指令格式（云端 → 工控机）

```json
{
  "cmdId": "uuid",
  "type": "door_open | door_close | light_on | light_off | shower_start | shower_stop | play_audio | ota_update | ...",
  "payload": { /* 指令参数，按 type 不同 */ },
  "issuedAt": 1712345678
}
```

---

## 事件格式（工控机 → 云端）

```json
{
  "eventId": "uuid",
  "ipcId": "ipc-001",
  "storeId": "store-001",
  "type": "face_matched | door_opened | door_closed | alarm | ...",
  "payload": { /* 事件详情 */ },
  "occurredAt": 1712345678
}
```

---

## HTTP 上报接口

| 接口 | 说明 |
|---|---|
| `POST /api/v1/ipc/heartbeat` | 心跳上报（30 秒一次） |
| `POST /api/v1/ipc/event` | 事件上报（刷脸、门磁、告警等） |
| `POST /api/v1/ipc/ota/result` | OTA 更新结果回报 |

---

## 待确认事项

- [ ] MQTT Broker 选型（EMQX / Mosquitto / 云厂商托管）
- [ ] 离线期间积压事件的重传策略与去重机制
- [ ] 指令响应超时与重试机制
