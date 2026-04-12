# 远程 SSH 到工控机

**涉及子系统**：工控机、云端 API
**核心业务**：通过云端 frps 服务器安全访问门店本地工控机，用于运维、排障、程序更新

---

## 架构方案

工控机位于门店内网（NAT 后），无固定公网 IP，使用 **FRP tcpmux HTTP CONNECT** 模式实现内网穿透。

```
运维人员
    │  ssh -o "ProxyCommand=nc -X connect -x frps.fitron-system.com:6001 %h %p"
    │           root@store-001.ssh.fitron-system.com
    ▼
云端 frps（frps.fitron-system.com）
    │  控制连接：:7000
    │  tcpmux HTTP CONNECT：:6001（所有工控机共享同一端口，按域名路由）
    ▼
目标工控机 frpc（store-001）
    │  customDomains: store-001.ssh.fitron-system.com
    ▼
工控机 sshd :22
```

**核心优势**：云端仅需开放两个端口（7000 控制 + 6001 业务），所有工控机通过 `customDomains` 域名名称寻址，连接关系清晰，运维侧无需本地启动额外进程。

---

## 安全要求

- 禁止密码登录，仅允许 SSH 密钥认证
- 云端仅开放 frps 控制端口（7000）和 tcpmux 端口（6001），不暴露 SSH 端口
- 工控机 SSH 公钥通过 MQTT 指令动态管理，支持随时授权和撤销（见[公钥动态管理](#公钥动态管理)）
- frps 管理面板（7500）绑定 `127.0.0.1`，不对公网暴露
- `auth.token` 和面板密码不得提交至 git，部署时手动填写

---

## 云端 frps 部署（一次性）

### 1. 下载并安装 frp

```bash
wget https://github.com/fatedier/frp/releases/download/v0.61.0/frp_0.61.0_linux_amd64.tar.gz
tar -xzf frp_0.61.0_linux_amd64.tar.gz
mkdir -p /opt/frp
cp frp_0.61.0_linux_amd64/frps /opt/frp/
```

### 2. 写入配置

配置文件路径：`/opt/frp/frps.toml`

```toml
bindPort = 7000                      # frpc 控制连接端口
tcpmuxHTTPConnectPort = 6001         # 所有工控机 SSH 共享此端口

auth.method = "token"
auth.token = "your_frp_token"        # 部署时替换，与 frpc.toml 保持一致

# 管理面板仅本机可访问，通过 SSH 端口转发查看
webServer.addr = "127.0.0.1"
webServer.port = 7500
webServer.user = "admin"
webServer.password = "your_dashboard_password"

log.to = "/var/log/frp/frps.log"
log.level = "info"
log.maxDays = 7
```

### 3. 防火墙

```bash
ufw allow 7000/tcp   # frp 控制端口
ufw allow 6001/tcp   # tcpmux SSH 端口
```

### 4. 安装 systemd 服务

```ini
# /etc/systemd/system/frps.service
[Unit]
Description=Fitron frps 内网穿透服务端
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=root
ExecStart=/opt/frp/frps -c /opt/frp/frps.toml
Restart=always
RestartSec=5
StartLimitBurst=10
StartLimitIntervalSec=60

[Install]
WantedBy=multi-user.target
```

```bash
systemctl daemon-reload
systemctl enable frps
systemctl start frps
```

### 5. 查看管理面板

```bash
# 在本机建立 SSH 隧道后访问
ssh -L 7500:127.0.0.1:7500 user@frps.fitron-system.com
# 浏览器访问 http://127.0.0.1:7500
```

---

## 工控机 frpc 部署（每台工控机执行一次）

### 1. 下载并安装 frp

```bash
# RK3576 芯片选择 linux_arm64
wget https://github.com/fatedier/frp/releases/download/v0.61.0/frp_0.61.0_linux_arm64.tar.gz
tar -xzf frp_0.61.0_linux_arm64.tar.gz
mkdir -p /opt/frp
cp frp_0.61.0_linux_arm64/frpc /opt/frp/
```

### 2. 写入配置

配置文件路径：`/opt/frp/frpc.toml`，**按门店修改 `name` 和 `customDomains`**：

```toml
serverAddr = "frps.fitron-system.com"
serverPort = 7000

auth.method = "token"
auth.token = "your_frp_token"   # 与 frps.toml 保持一致

transport.heartbeatInterval = 10
transport.heartbeatTimeout = 30

log.to = "/var/log/frp/frpc.log"
log.level = "info"
log.maxDays = 7

[[proxies]]
name = "store-001-ssh"                          # 改为该门店 ID，全局唯一
type = "tcpmux"
multiplexer = "httpconnect"
customDomains = ["store-001.ssh.fitron-system.com"]     # 改为该门店域名，格式固定
localIP = "127.0.0.1"
localPort = 22
```

> `customDomains` 格式规范：`store-{门店ID}.ssh.fitron-system.com`

### 3. 配置 sshd

工控机 sshd 需使用独立授权文件，以支持云端动态管理公钥：

```bash
# /etc/ssh/sshd_config 追加
AuthorizedKeysFile .ssh/authorized_keys /etc/ssh/authorized_keys.d/fitron
PasswordAuthentication no
```

```bash
mkdir -p /etc/ssh/authorized_keys.d
touch /etc/ssh/authorized_keys.d/fitron
chmod 600 /etc/ssh/authorized_keys.d/fitron

systemctl restart sshd
```

### 4. 安装 systemd 服务

```ini
# /etc/systemd/system/frpc.service
[Unit]
Description=Fitron frpc 内网穿透客户端
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=root
ExecStart=/opt/frp/frpc -c /opt/frp/frpc.toml
Restart=always
RestartSec=5
StartLimitBurst=10
StartLimitIntervalSec=60

[Install]
WantedBy=multi-user.target
```

```bash
systemctl daemon-reload
systemctl enable frpc
systemctl start frpc
systemctl status frpc
```

---

## 运维人员连接方式

### 方式一：直接 SSH（推荐）

```bash
ssh \
  -i ~/.ssh/id_ed25519 \
  -o "ProxyCommand=nc -X connect -x frps.fitron-system.com:6001 %h %p" \
  -o "StrictHostKeyChecking=no" \
  -o "UserKnownHostsFile=/dev/null" \
  root@store-001.ssh.fitron-system.com
```

### 方式二：使用连接脚本

```bash
# 用法：./connect-ipc.sh <store-id>
./connect-ipc.sh store-001
```

脚本支持以下环境变量覆盖默认值：


| 环境变量              | 默认值                      | 说明         |
| ----------------- | ------------------------ | ---------- |
| `FITRON_FRP_HOST` | `frps.fitron-system.com` | frps 服务器地址 |
| `FITRON_FRP_PORT` | `6001`                   | tcpmux 端口  |
| `FITRON_SSH_KEY`  | `~/.ssh/id_ed25519`      | SSH 私钥路径   |
| `FITRON_SSH_USER` | `root`                   | 登录用户名      |


### 方式三：配置 SSH Config（同时管理多台）

```sshconfig
# ~/.ssh/config
Host store-*
    User root
    IdentityFile ~/.ssh/id_ed25519
    ProxyCommand nc -X connect -x frps.fitron-system.com:6001 %h %p
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
```

配置后直接执行：

```bash
ssh root@store-001.ssh.fitron-system.com
ssh root@store-002.ssh.fitron-system.com
```

---

## 公钥动态管理

工控机 sshd 的 `/etc/ssh/authorized_keys.d/fitron` 文件由云端通过 MQTT 指令动态管理，无需登录工控机手动操作。

### MQTT 指令

**Topic**：`fitron/ipc/{device_id}/ssh/cert`

**新增公钥**：

```json
{
  "action": "add",
  "operator": "ops-001",
  "pubkey": "ssh-ed25519 AAAA..."
}
```

**撤销公钥**：

```json
{
  "action": "revoke",
  "operator": "ops-001"
}
```

- `operator`：运维人员唯一标识（工号或邮箱），写入注释便于审计
- 新增操作具有幂等性，重复下发同一 operator 的公钥会自动跳过
- 撤销按 `operator` 标识匹配删除，无需提供公钥内容

### authorized_keys 文件格式

```
ssh-ed25519 AAAA... fitron:operator=ops-001
ssh-ed25519 BBBB... fitron:operator=ops-002
```

