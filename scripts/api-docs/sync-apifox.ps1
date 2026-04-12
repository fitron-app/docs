$ErrorActionPreference = "Stop"

$OpenApiUrl = $env:OPENAPI_URL
$ApifoxImportUrl = $env:APIFOX_IMPORT_URL
$ApifoxToken = $env:APIFOX_TOKEN
$OpenApiFile = if ($env:OPENAPI_FILE) { $env:OPENAPI_FILE } else { ".\openapi.json" }

if (-not $OpenApiUrl) { throw "缺少环境变量 OPENAPI_URL" }
if (-not $ApifoxImportUrl) { throw "缺少环境变量 APIFOX_IMPORT_URL" }
if (-not $ApifoxToken) { throw "缺少环境变量 APIFOX_TOKEN" }

Invoke-RestMethod -Uri $OpenApiUrl -Method Get -OutFile $OpenApiFile
Write-Host "OpenAPI 已下载到 $OpenApiFile"

Invoke-RestMethod `
  -Uri $ApifoxImportUrl `
  -Method Post `
  -Headers @{ Authorization = "Bearer $ApifoxToken" } `
  -Form @{ file = Get-Item $OpenApiFile }

Write-Host "已触发 Apifox 导入"
