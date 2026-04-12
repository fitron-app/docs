$ErrorActionPreference = "Stop"

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
Set-Location $RepoRoot

$RemoteHost = if ($env:REMOTE_HOST) { $env:REMOTE_HOST } else { "root@62.234.91.201" }
$RemoteTargetDir = if ($env:REMOTE_TARGET_DIR) { $env:REMOTE_TARGET_DIR } else { "/www/wwwroot/fitron-docs.hm5.com" }
$RemoteTmpDir = if ($env:REMOTE_TMP_DIR) { $env:REMOTE_TMP_DIR } else { "$RemoteTargetDir-tmp" }
$LocalDistDir = if ($env:LOCAL_DIST_DIR) { $env:LOCAL_DIST_DIR } else { "docs/.vitepress/dist" }

Write-Host "开始构建文档..."
npm install
npm run docs:build

if (-not (Test-Path $LocalDistDir)) {
  throw "构建结果不存在: $LocalDistDir"
}

Write-Host "开始上传到临时目录: $RemoteTmpDir"
ssh $RemoteHost "mkdir -p `"$RemoteTmpDir`""
scp -r "$LocalDistDir/*" "$RemoteHost`:$RemoteTmpDir/"

Write-Host "开始替换线上目录: $RemoteTargetDir"
ssh $RemoteHost "rm -fr `"$RemoteTargetDir`" && mv `"$RemoteTmpDir`" `"$RemoteTargetDir`""

Write-Host "部署完成"
