# 接口通信安全

**涉及子系统**：云端 API、工控机
**核心业务**：保障各端与云端 API 之间通信的身份认证、数据完整性与传输加密

---

## 安全机制总览

| 通信链路 | 传输层 | 身份认证 | 备注 |
|---|---|---|---|
| 小程序 → 云端 API | HTTPS（TLS 1.2+） | JWT（微信登录签发） | 用户级鉴权 |
| 管理后台 → 云端 API | HTTPS | JWT（管理员账号签发） | 角色级鉴权 |
| 工控机 → 云端 API（HTTP） | HTTPS | HMAC-SHA256 请求签名 | 设备级鉴权 |
| 工控机 ↔ 云端（MQTT） | MQTT over TLS | 客户端证书 + username/password | 每台工控机独立证书 |

---

## JWT 规范

- 算法：RS256（非对称）
- 有效期：用户端 7 天，管理员端 24 小时
- Refresh Token 策略：临近过期自动续签
- Payload 包含：`userId / role / storeIds / iat / exp`

---

## 工控机请求签名

工控机每次 HTTP 请求附加以下 Header：

```
X-IPC-ID: ipc-001
X-Timestamp: 1712345678
X-Nonce: random-string
X-Signature: HMAC-SHA256(ipcId + timestamp + nonce + requestBody, secretKey)
```

云端验证：
1. 时间戳与服务器时间差不超过 ±5 分钟（防重放）
2. Nonce 在时间窗口内唯一（Redis 短期缓存校验）
3. Signature 与重算结果一致

---

## 敏感数据处理

- 人脸特征向量传输使用 AES-256-GCM 加密
- 数据库中的 secretKey 使用 KMS 加密存储
- 日志中脱敏手机号、人脸相关字段

---

## 待确认事项

- [ ] 工控机 secretKey 的初始化分发方案（首次部署时如何安全写入）
- [ ] 是否需要 IP 白名单限制工控机 API 访问
