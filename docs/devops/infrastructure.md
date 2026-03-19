# 研发与运维体系规划

> 基于腾讯云，面向无人值守健身房系统的 DevOps 方案。  
> 核心原则：**方案确定、流程稳定、自动化可执行**。

---

## 一、整体架构图

```
开发者本地
    │
    │ git push
    ▼
CODING / GitHub（代码仓库）
    │
    │ 触发 CI 流水线
    ▼
构建环境（CODING CI / GitHub Actions）
    ├─ 运行测试
    ├─ 构建 Docker 镜像
    └─ 推送镜像到 TCR（腾讯云容器镜像仓库）
          │
          │ 测试分支 → 自动部署测试环境
          │ main 分支 → 手动确认后部署生产环境
          ▼
   ┌──────────────────────────────────┐
   │         腾讯云 VPC 私有网络        │
   │                                  │
   │  CLB 负载均衡（公网入口）           │
   │    ├── 测试域名 → 测试 CVM         │
   │    └── 生产域名 → 生产 CVM(s)      │
   │                                  │
   │  CVM（Docker Compose 部署）        │
   │    ├── API 服务容器               │
   │    ├── Nginx 反向代理容器          │
   │    └── MQTT Broker 容器（EMQX）   │
   │                                  │
   │  TencentDB for PostgreSQL         │
   │  TencentDB for Redis              │
   │  COS（对象存储，人脸图片等）         │
   └──────────────────────────────────┘
```

---

## 二、腾讯云产品选型

### 2.1 计算资源

| 用途 | 产品 | 推荐规格 | 说明 |
|---|---|---|---|
| **生产环境应用服务器** | CVM 标准型 S6 | 4 核 8G，100G 系统盘 | 运行 Docker Compose，跑 API 服务 + Nginx |
| **测试环境服务器** | CVM 标准型 S6 | 2 核 4G，50G 系统盘 | 测试环境，成本压缩 |
| **数据库服务器** | TencentDB for PostgreSQL | 2 核 4G，100G 数据盘 | 托管 PG，免运维，自动备份 |
| **缓存** | Redis 标准版 | 1G 起 | 托管 Redis，主从高可用 |

> **为什么不用 K8s / TKE**：当前系统采用 Docker Compose，运维路径更直接，部署与故障处理成本更可控。

---

### 2.2 网络与访问

| 用途 | 产品 | 说明 |
|---|---|---|
| **公网流量入口** | CLB 负载均衡（应用型）| 统一管理域名和 HTTPS 证书，后端挂 CVM；统一入口便于流量治理与安全策略收敛 |
| **域名** | DNSPod（腾讯云域名解析）| 解析到 CLB 的 VIP 地址 |
| **HTTPS 证书** | SSL 证书（免费 DV 型）| 腾讯云免费申请，CLB 上统一终结 TLS，后端 HTTP 通信 |
| **静态资源加速** | COS + CDN | 前端打包产物（HTML/JS/CSS）存 COS，CDN 全球加速 |
| **对象存储** | COS | 存储人脸原图、用户头像等二进制文件 |
| **私有网络隔离** | VPC | 数据库、Redis 不暴露公网，只允许 VPC 内访问 |

---

### 2.3 研发与 CI/CD

| 用途 | 产品 | 说明 |
|---|---|---|
| **代码仓库** | CODING（腾讯云 DevOps）或 GitHub | CODING 与腾讯云生态集成好；GitHub 生态更广；**优先推荐 GitHub** |
| **CI/CD 流水线** | GitHub Actions 或 CODING CI | 与代码仓库对应 |
| **Docker 镜像仓库** | TCR 个人版（免费）或 TCR 企业版 | 个人版够用，镜像存腾讯云，拉取速度快 |

---

### 2.4 监控与运维

| 用途 | 产品 | 说明 |
|---|---|---|
| **服务器监控** | 腾讯云云监控 | 自动采集 CVM CPU / 内存 / 磁盘，配置告警规则 |
| **日志服务** | CLS（日志服务）| Docker 容器日志统一投递到 CLS，支持检索 |
| **告警通知** | 云监控 + 企业微信 Webhook | 服务异常、CPU 超阈值等自动推送到群 |

---

## 三、环境划分

### 3.1 三套环境定义

| 环境 | 用途 | 触发方式 | 域名示例 |
|---|---|---|---|
| **本地开发（local）** | 工程师本地跑，用 docker-compose 起完整服务 | 手动 | localhost |
| **测试环境（test）** | 功能联调、QA 验证 | `develop` 分支有推送，自动部署 | api-test.yourdomain.com |
| **生产环境（prod）** | 正式上线服务 | `main` 分支 + 人工确认 | api.yourdomain.com |

### 3.2 环境隔离原则

- 测试环境和生产环境使用**独立的 CVM**，互不影响
- 数据库各自独立实例，测试库和生产库**物理隔离**，严禁测试代码写生产数据
- Redis 各自独立实例
- 环境配置（数据库连接串、第三方密钥等）通过**环境变量**注入，不写入代码仓库
- 所有敏感配置统一存放在 **CODING / GitHub Secrets** 中

---

## 四、代码管理规范

### 4.1 分支策略（简化 Git Flow）

```
main          ─── 生产代码，受保护分支，只能通过 PR 合入
  │
develop       ─── 集成分支，测试环境跑的代码
  │
feature/xxx   ─── 功能开发分支，从 develop 切出，完成后 PR 回 develop
hotfix/xxx    ─── 线上紧急修复，从 main 切出，修复后同时合入 main 和 develop
```

### 4.2 分支保护规则

- `main` 分支：
  - 禁止直接 push
  - 合入需要至少 1 人 Code Review 通过
  - CI 必须全部通过才能合入
- `develop` 分支：
  - 禁止直接 push（feature 分支通过 PR 合入）
  - CI 必须通过

### 4.3 Commit Message 规范

```
类型: 简短描述（中文）

示例：
feat: 新增用户人脸录入接口
fix: 修复订单重复创建问题
refactor: 重构优惠券核销逻辑
chore: 更新依赖版本
docs: 补充 API 文档
```

---

## 五、CI/CD 流水线设计

### 5.1 完整流水线流程

```
代码推送 / PR
    │
    ▼
① 代码检查（Lint + 格式化）
    │
    ▼
② 单元测试 + 集成测试
    │ 失败 → 通知开发者，阻断流程
    ▼
③ 构建 Docker 镜像
    │ 镜像 tag = git commit sha（生产）/ latest（测试）
    ▼
④ 推送镜像到 TCR
    │
    ├─ develop 分支 → ⑤A 自动部署到测试环境
    └─ main 分支    → ⑤B 等待人工确认 → 部署到生产环境
```

### 5.2 GitHub Actions 核心配置（Kotlin 后端示例）

```yaml
# .github/workflows/deploy.yml

name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: 设置 JDK
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '17'
          cache: gradle
      - name: 运行单元测试
        run: ./gradlew clean test --no-daemon
      - name: 构建 JAR
        run: ./gradlew bootJar -x test --no-daemon
      - name: 运行集成测试（容器化依赖）
        run: |
          docker compose -f docker-compose.test.yml up --abort-on-container-exit
          docker compose -f docker-compose.test.yml down

  build-and-push:
    needs: test
    if: github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: 登录腾讯云 TCR
        run: |
          docker login ${{ secrets.TCR_REGISTRY }} \
            -u ${{ secrets.TCR_USERNAME }} \
            -p ${{ secrets.TCR_PASSWORD }}
      - name: 构建并推送镜像
        run: |
          IMAGE_TAG=${{ github.sha }}
          docker build -t ${{ secrets.TCR_REGISTRY }}/fitness/api:$IMAGE_TAG .
          docker push ${{ secrets.TCR_REGISTRY }}/fitness/api:$IMAGE_TAG

  deploy-test:
    needs: build-and-push
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - name: SSH 部署到测试环境
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.TEST_SERVER_IP }}
          username: ubuntu
          key: ${{ secrets.TEST_SSH_KEY }}
          script: |
            cd /opt/fitness
            export IMAGE_TAG=${{ github.sha }}
            docker compose pull api
            docker compose up -d api
            docker image prune -f

  deploy-prod:
    needs: build-and-push
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production   # 需要在 GitHub 中配置 required reviewers
    steps:
      - name: SSH 部署到生产环境
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.PROD_SERVER_IP }}
          username: ubuntu
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            cd /opt/fitness
            export IMAGE_TAG=${{ github.sha }}
            docker compose pull api
            docker compose up -d --no-deps api
            docker image prune -f
```

---

## 六、服务器上的 Docker Compose 结构

### 6.1 目录结构

```
/opt/fitness/
├── docker-compose.yml        # 生产服务定义
├── docker-compose.test.yml   # 测试服务定义（测试服务器上）
├── .env                      # 环境变量（不入代码仓库，手动维护）
├── nginx/
│   └── nginx.conf            # Nginx 反向代理配置
└── data/
    ├── postgres/             # 如本地跑数据库（测试环境可用）
    └── redis/
```

### 6.2 生产 docker-compose.yml 示例

```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - api
    restart: always

  api:
    image: ${TCR_REGISTRY}/fitness/api:${IMAGE_TAG}
    environment:
      - DB_URL=${DB_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
      - WX_APP_ID=${WX_APP_ID}
      - WX_APP_SECRET=${WX_APP_SECRET}
      - MQTT_BROKER_URL=${MQTT_BROKER_URL}
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 5s
      retries: 3

  emqx:
    image: emqx/emqx:latest
    ports:
      - "1883:1883"    # MQTT
      - "8083:8083"    # WebSocket
    environment:
      - EMQX_NAME=emqx
    restart: always
```

### 6.3 Nginx 反向代理配置示例

```nginx
upstream api_backend {
    server api:8080;
}

server {
    listen 80;
    server_name _;

    # API 请求转发
    location /api/ {
        proxy_pass http://api_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 健康检查
    location /actuator/health {
        proxy_pass http://api_backend;
    }
}
```

> **注意**：HTTPS 在 CLB 层面终结（SSL Termination），Nginx 只处理 HTTP，无需在服务器内配置证书。

---

## 七、CLB + 域名配置规划

### 7.1 域名规划

| 域名 | 指向 | 用途 |
|---|---|---|
| `api.yourdomain.com` | CLB 生产 VIP | 生产 API 服务（小程序和管理后台调用）|
| `admin.yourdomain.com` | CDN / COS | 管理后台前端静态资源 |
| `api-test.yourdomain.com` | CLB 测试 VIP 或测试 CVM IP | 测试环境 API |
| `admin-test.yourdomain.com` | 测试 CVM 静态服务 | 测试版管理后台 |

### 7.2 CLB 配置要点

- 在 CLB 上配置 HTTPS 监听器（443 端口），绑定 SSL 证书
- 开启 HTTP → HTTPS 强制跳转（80 端口 301 重定向）
- 后端服务器（CVM）走 HTTP（80 端口），无需在应用层处理 TLS
- 开启健康检查，探测 `/actuator/health` 接口，自动摘除异常节点

---

## 八、监控与告警规范

### 8.1 必配告警项

| 监控指标 | 告警阈值 | 通知方式 |
|---|---|---|
| CVM CPU 使用率 | > 80%，持续 5 分钟 | 企业微信群 |
| CVM 内存使用率 | > 85% | 企业微信群 |
| CVM 磁盘使用率 | > 80% | 企业微信群 |
| API 服务健康检查失败 | 连续 2 次 | 企业微信群 + 电话 |
| TencentDB 连接数 | > 90% 最大连接数 | 企业微信群 |
| Redis 内存使用率 | > 80% | 企业微信群 |

### 8.2 日志规范

- 应用日志统一输出到 stdout（不写文件），由 Docker 收集
- 接入腾讯云 CLS，统一检索
- 日志保留：测试环境 7 天，生产环境 30 天

### 8.3 数据库备份

- TencentDB 开启自动备份，保留 7 天
- 每月人工导出一次全量备份到 COS 冷存储

---

## 九、安全规范

| 措施 | 说明 |
|---|---|
| VPC 私有网络 | 数据库、Redis 不暴露公网，仅 VPC 内访问 |
| 安全组 | CVM 只开放 80 / 443 / 1883 端口；SSH（22）限制来源 IP |
| SSH 密钥登录 | 禁用密码登录，所有 SSH 访问走密钥认证 |
| 密钥不入库 | 所有密码、Token、密钥通过环境变量注入，存放在 GitHub Secrets / CODING 密钥管理 |
| 镜像扫描 | TCR 开启镜像漏洞扫描，推送时自动检测 |
| 定期轮换 | 数据库密码、JWT Secret、微信密钥每季度轮换一次 |

---

## 十、运维操作手册（核心操作速查）

### 常用命令（PowerShell）

```powershell
# 查看运行中的容器
docker compose ps

# 查看 API 服务日志（实时）
docker compose logs -f api

# 手动重启某个服务
docker compose restart api

# 部署新版本（指定 IMAGE_TAG）
$env:IMAGE_TAG = "abc1234"
docker compose pull api ; docker compose up -d api

# 回滚到上一版本（改 IMAGE_TAG 为上一个 commit sha）
$env:IMAGE_TAG = "上一个sha"
docker compose up -d api

# 清理无用镜像
docker image prune -f
```

### 紧急回滚步骤

1. 到 GitHub Actions / CODING 找上一次成功部署的 commit SHA
2. SSH 登录生产服务器
3. 修改 `.env` 中的 `IMAGE_TAG` 为上一次的 SHA
4. 执行 `docker compose up -d api`
5. 验证 `/actuator/health` 接口正常后，通知相关人员

---

## 十一、分阶段实施计划

| 阶段 | 内容 | 优先级 |
|---|---|---|
| **第一阶段** | 购买 CVM + TencentDB + Redis；配置 VPC 和安全组；手动 Docker Compose 部署跑通 API | 立即 |
| **第二阶段** | 注册域名；配置 CLB + HTTPS；前端构建产物部署到 COS + CDN | 立即 |
| **第三阶段** | 搭建 GitHub 代码仓库；接入 TCR；配置 CI 流水线（测试 + 构建 + 推送镜像）| 第一个版本上线前 |
| **第四阶段** | 配置自动部署流水线（develop 自动发测试，main 手动确认发生产）| 第一个版本上线前 |
| **第五阶段** | 接入 CLS 日志；配置云监控告警；配置数据库自动备份 | 上线后第一周 |
| **第六阶段** | 完善分支保护规则、Code Review 流程、测试覆盖率要求 | 团队人员到位后 |
