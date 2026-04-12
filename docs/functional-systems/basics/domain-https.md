# 域名备案与 HTTPS 证书

**涉及子系统**：云端 API、管理后台、文档系统
**核心业务**：域名 ICP 备案、SSL/TLS 证书申请与自动续期、CDN 配置

---

## 域名规划

| 用途 | 建议域名 | 说明 |
|---|---|---|
| 云端 API | `api.fitron-system.com` | 小程序、管理后台、工控机统一调用 |
| 管理后台 | `admin.fitron-system.com` | PC 浏览器访问（静态资源走 CDN） |
| 文档系统 | `docs.fitron-system.com` | 本规划文档站（对内） |
| MQTT Broker | `mqtt.fitron-system.com` | 工控机 MQTT 连接 |
| 工控机 SSH | `*.ssh.fitron-system.com` | 门店工控机远程 SSH 访问（格式：store-{门店ID}.ssh.fitron-system.com） |
| FRP 服务器 | `frps.fitron-system.com` | 内网穿透服务端 |

---

## ICP 备案

- 需以企业主体完成工信部 ICP 备案
- 服务器需在中国大陆 IDC 托管（已满足）
- 备案完成前不可将域名指向服务器对外提供服务
- 备案周期约 **20 个工作日**，建议提前申请

---

## HTTPS 证书

### 证书类型
推荐使用以下方案：
1. **腾讯云免费 DV 型证书**：适合生产环境，与腾讯云 CLB 集成良好
2. **Let's Encrypt 免费证书** + **Certbot 自动续期**：适合测试环境或自托管场景

### 证书部署
- **生产环境**：在腾讯云 CLB 上配置 HTTPS 监听器，绑定 SSL 证书
- **测试环境**：可在服务器 Nginx 上直接配置证书

### 自动续期
```bash
# Let's Encrypt 自动续期示例（crontab）
0 3 * * * certbot renew --quiet && systemctl reload nginx
```

---

## CDN 配置

### 必要性
- ✅ **必须使用 CDN**：提升静态资源加载速度，减轻源站压力，增强安全性

### 适用场景
| 资源类型 | 存储位置 | CDN 配置 |
|---|---|---|
| 管理后台前端 | 腾讯云 COS | 配置 CDN 加速域名 `admin.fitron-system.com` |
| 文档系统 | 腾讯云 COS | 配置 CDN 加速域名 `docs.fitron-system.com` |
| 图片资源 | 腾讯云 COS | 配置 CDN 加速，支持图片处理 |

### 配置要点
1. **COS 存储桶**：创建专用存储桶，设置为公共读权限
2. **CDN 加速**：
   - 配置加速域名，绑定 HTTPS 证书
   - 开启 HTTPS 强制跳转
   - 配置缓存策略，静态资源缓存 7-30 天
   - 开启 Gzip 压缩
3. **CI/CD 集成**：前端构建产物自动上传到 COS，并刷新 CDN 缓存

### 安全配置
- 配置 CDN 防盗链，限制来源域名
- 开启 CDN HTTPS 强制跳转
- 配置 TLS 1.2+ 协议支持
