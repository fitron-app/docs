# 域名备案与 HTTPS 证书

**涉及子系统**：云端 API
**核心业务**：域名 ICP 备案、SSL/TLS 证书申请与自动续期

---

## 域名规划

| 用途 | 建议域名 | 说明 |
|---|---|---|
| 云端 API | `api.fitron.com` | 小程序、管理后台、工控机统一调用 |
| 管理后台 | `admin.fitron.com` | PC 浏览器访问 |
| 文档系统 | `docs.fitron.com` | 本规划文档站（对内） |
| MQTT Broker | `mqtt.fitron.com` | 工控机 MQTT 连接 |

---

## ICP 备案

- 需以企业主体完成工信部 ICP 备案
- 服务器需在中国大陆 IDC 托管（已满足）
- 备案完成前不可将域名指向服务器对外提供服务
- 备案周期约 **20 个工作日**，建议提前申请

---

## HTTPS 证书

推荐使用 **Let's Encrypt** 免费证书 + **Certbot** 自动续期，或使用云厂商提供的免费 DV 证书。

```bash
# 自动续期示例（crontab）
0 3 * * * certbot renew --quiet && systemctl reload nginx
```

---

## 待确认事项

- [ ] 主域名确认（fitron.com 是否已注册）
- [ ] CDN 是否需要接入（管理后台静态资源加速）
