# 工控机看门狗及进程保活

**涉及子系统**：工控机
**核心业务**：检测工控机关键进程状态，崩溃后自动重启，并定期上报心跳到云端

---

## 保活策略

| 机制 | 工具 | 说明 |
|---|---|---|
| 进程守护 | systemd | 主控程序以 systemd service 运行，崩溃后自动 Restart |
| 硬件看门狗 | WDT（内核模块）| 喂狗超时则硬重启，防止进程死锁无法重启 |
| 心跳上报 | HTTP POST | 每 30 秒向云端上报状态，超时触发告警 |

---

## 心跳上报格式

```json
POST /api/v1/ipc/heartbeat
{
  "storeId": "store-001",
  "ipcId": "ipc-001",
  "timestamp": 1712345678,
  "uptime": 86400,
  "processes": {
    "main": "running",
    "face_engine": "running",
    "mqtt_client": "running"
  },
  "system": {
    "cpu": 12.5,
    "memory": 45.2,
    "disk": 60.1,
    "temperature": 52.3
  }
}
```

---

## 云端告警规则

- 心跳超过 **3 分钟**未收到 → 触发工控机离线告警
- 推送通知至管理后台 + 门店管理员微信

---

## 待确认事项

- [ ] 硬件看门狗芯片具体型号与喂狗周期
- [ ] 告警通知渠道（微信服务通知 / 短信 / 企业微信）
