# API 定义文档系统

**涉及子系统**：云端 API
**核心业务**：基于 OpenAPI 自动生成接口文档，并同步到 Apifox 做团队管理与测试，统一前端、工控机、第三方对接的接口规范

---

## 目标

- 代码中的 OpenAPI 定义作为唯一事实源（Single Source of Truth）
- Swagger UI 作为开发调试入口
- Apifox 作为团队协作管理、调试测试、自动化测试平台
- 接口定义变更后可自动同步到 Apifox

- **文档地址**（内网）：`https://api-internal.fitron-system.com/swagger-ui.html`
- **OpenAPI JSON**：`/v3/api-docs`

---

## 技术方案

云端 API 基于 Kotlin + Spring Boot，使用 SpringDoc（OpenAPI 3.0）自动生成接口文档。

推荐采用双轨方案：

- **Swagger UI**：后端开发实时查看接口与字段定义
- **Apifox**：项目分组、版本管理、环境变量、接口调试、自动化测试
- **同步机制**：以 `/v3/api-docs` 为源，定时或在 CI 中同步到 Apifox

---

## 文档分组

| 分组 | 路径前缀 | 适用对象 |
|---|---|---|
| 用户端 | `/api/v1/` | 小程序客户端 |
| 管理端 | `/api/v1/admin/` | 管理后台 |
| 工控机端 | `/api/v1/ipc/` | 工控机 |
| 支付回调 | `/api/v1/pay/` | 微信支付服务器 |

---

## 规范要求

- 所有接口必须有中文描述（`@Operation`、`@Schema`）
- 请求/响应字段必须有注释说明（DTO 字段级注解）
- 错误码统一在文档中列举并维护错误码说明
- 接口变更必须先改代码注解，再同步到 Apifox
- 禁止仅在 Apifox 手工改接口定义而不回写代码

---

## 同步流程

### 流程 A：Apifox 拉取 URL（推荐先落地）

1. 在 Apifox 项目中配置 OpenAPI 数据源 URL：`https://api-internal.fitron-system.com/v3/api-docs`
2. 设置定时同步，或在发布前手动触发同步
3. 以服务端代码注解为准，Apifox 仅做管理和测试

### 流程 B：CI 脚本推送（进阶）

1. CI 构建后获取 `openapi.json`
2. 调用 Apifox 导入能力执行覆盖更新（是否使用公开 API 需以官方文档为准）
3. 将同步日志作为流水线产物保存

> 说明：流程 B 依赖 Apifox 侧的可用导入能力。当前阶段优先推荐流程 A（URL + 定时导入）。

---

## 跨平台脚本（Windows + macOS）

### 1) 拉取 OpenAPI 文件（本地或 CI）

Windows PowerShell：

```powershell
$ErrorActionPreference = "Stop"
$ApiBase = "https://api-internal.fitron-system.com"
$Output = ".\openapi.json"

Invoke-RestMethod -Uri "$ApiBase/v3/api-docs" -Method Get -OutFile $Output
Write-Host "OpenAPI 已导出到 $Output"
```

macOS (bash/zsh)：

```bash
#!/usr/bin/env bash
set -euo pipefail

API_BASE="https://api-internal.fitron-system.com"
OUTPUT="./openapi.json"

curl -fsSL "${API_BASE}/v3/api-docs" -o "${OUTPUT}"
echo "OpenAPI 已导出到 ${OUTPUT}"
```

### 2) 推送到 Apifox（模板）

Windows PowerShell：

```powershell
$ErrorActionPreference = "Stop"
$ApifoxImportUrl = $env:APIFOX_IMPORT_URL
$ApifoxToken = $env:APIFOX_TOKEN
$OpenApiFile = ".\openapi.json"

if (-not $ApifoxImportUrl) { throw "缺少环境变量 APIFOX_IMPORT_URL" }
if (-not $ApifoxToken) { throw "缺少环境变量 APIFOX_TOKEN" }
if (-not (Test-Path $OpenApiFile)) { throw "找不到文件 $OpenApiFile" }

Invoke-RestMethod `
  -Uri $ApifoxImportUrl `
  -Method Post `
  -Headers @{ Authorization = "Bearer $ApifoxToken" } `
  -Form @{ file = Get-Item $OpenApiFile }

Write-Host "已触发 Apifox 导入"
```

macOS (bash/zsh)：

```bash
#!/usr/bin/env bash
set -euo pipefail

: "${APIFOX_IMPORT_URL:?缺少 APIFOX_IMPORT_URL}"
: "${APIFOX_TOKEN:?缺少 APIFOX_TOKEN}"

OPENAPI_FILE="./openapi.json"
test -f "${OPENAPI_FILE}" || { echo "找不到 ${OPENAPI_FILE}"; exit 1; }

curl -fsSL -X POST "${APIFOX_IMPORT_URL}" \
  -H "Authorization: Bearer ${APIFOX_TOKEN}" \
  -F "file=@${OPENAPI_FILE}"

echo "已触发 Apifox 导入"
```

---

## CNB.COOL 流水线集成

当前仓库已在 `.cnb.yml` 中增加 `Sync OpenAPI To Apifox` 阶段。

需在 CNB.COOL 仓库变量中配置：

- `OPENAPI_URL`：测试环境 OpenAPI 地址（建议使用受保护地址）
- `APIFOX_IMPORT_URL`：Apifox 导入接口地址
- `APIFOX_TOKEN`：Apifox 导入凭证
- `OPENAPI_FILE`（可选）：默认 `./openapi.json`

本地手动执行：

Windows PowerShell：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\api-docs\sync-apifox.ps1
```

macOS (bash/zsh)：

```bash
chmod +x ./scripts/api-docs/sync-apifox.sh
./scripts/api-docs/sync-apifox.sh
```

---

## Apifox 同步方式（已按官方文档核验）

已核验的官方页面：

- [导入 OpenAPI/Swagger](https://docs.apifox.com/import-openapi-swagger)
- [定时导入（绑定数据源）](https://docs.apifox.com/scheduled-import)
- [导入导出数据](https://docs.apifox.com/import-and-export)

当前可确认结论：

- Apifox 支持导入 OpenAPI/Swagger
- Apifox 支持“定时导入（绑定数据源）”
- 导入策略存在“覆盖已有接口”模式（导入后替换旧接口内容）

当前未确认项（文档阶段先不假设）：

- 是否存在稳定公开、可长期依赖的“服务端推送导入 API”
- 该 API 在你当前 Apifox 版本/套餐下是否可用

落地建议（先稳妥）：

1. 先使用流程 A：在 Apifox 绑定受控 URL 并开启定时导入  
2. CNB 仅负责发布服务与文档源可用性检查，不强依赖未知导入 API  
3. 待你们确认 Apifox 公开 API 能力后，再启用流程 B（CI 主动推送）

---

## 公网测试环境下的接口定义保护

由于测试服务器在公网，必须避免直接暴露完整接口定义：

- 默认关闭对外文档端点：生产/公网测试环境禁用 `swagger-ui` 与 `/v3/api-docs`
- 必须做访问控制：仅允许白名单 IP、或接入鉴权（Basic Auth / OAuth2 / 网关鉴权）
- 将文档与业务 API 分离：优先放在受控子域名（如 `api-docs.xxx.com`）并加 WAF 规则
- 只对内部角色开放：通过 VPN/Zero Trust/企业身份登录后访问
- 同步给 Apifox 使用受控地址，不直接使用匿名公网 URL

Spring Boot（按环境控制）建议：

- `dev`：开启 Swagger UI 和 `/v3/api-docs`
- `test/prod`：默认关闭，必要时仅临时开启并叠加鉴权

示例配置：

```yaml
springdoc:
  api-docs:
    enabled: ${API_DOCS_ENABLED:false}
  swagger-ui:
    enabled: ${SWAGGER_UI_ENABLED:false}
```

---

## Spring Security 访问策略（文档阶段）

目标：公网测试环境可被团队访问，但外部不可见 API 文档定义。

### 端点保护范围

- `/v3/api-docs/**`
- `/swagger-ui/**`
- `/swagger-ui.html`

### 环境分级策略

- `dev`：可访问（便于开发联调），建议仅限本机或开发网段
- `test`：默认需要认证 + 白名单策略，不允许匿名访问
- `prod`：默认关闭文档端点；仅在故障排查窗口临时开启并加严鉴权

### 鉴权授权策略（Spring Security）

- 使用 `SecurityFilterChain` 的 `authorizeHttpRequests` 定义端点级规则
- 文档端点要求已认证身份（`authenticated`）并限制角色（如 `DOCS_READER`）
- 业务 API 与文档 API 使用不同授权规则，避免误放开
- 对文档端点关闭不必要跨域，避免被外站脚本直接读取

### 网络层策略（与安全组/网关配合）

- 网关层对文档端点加 IP 白名单（办公网、VPN、CI 出口）
- 对文档子域名加 WAF 规则和限流
- 文档域名与业务 API 域名分离，便于独立封禁与审计

### 审计与应急

- 文档端点访问日志单独保留并告警
- 出现异常抓取时，可一键关闭 `API_DOCS_ENABLED` 与 `SWAGGER_UI_ENABLED`

参考（官方）：

- [Spring Security: Authorize HTTP Requests](https://docs.spring.io/spring-security/reference/servlet/authorization/authorize-http-requests.html)
- [springdoc-openapi](https://springdoc.org/)

---

## 管理与测试建议

- 开发阶段：优先使用 Swagger UI 快速验证接口定义
- 联调阶段：统一在 Apifox 管理环境变量、鉴权、Mock、断言
- 回归阶段：在 Apifox 自动化测试中执行接口回归套件
- 变更控制：所有接口变更必须通过 `/v3/api-docs` 同步，不走手工漂移

---

## 待确认事项

- [ ] 是否对加盟商开放部分端点及其鉴权方案
- [ ] 是否接入 CI 的自动推送流程（流程 B）
- [ ] Apifox 项目中是否需要按业务线拆分多个项目
