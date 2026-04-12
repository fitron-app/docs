#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${REPO_ROOT}"

REMOTE_HOST="${REMOTE_HOST:-root@62.234.91.201}"
REMOTE_TARGET_DIR="${REMOTE_TARGET_DIR:-/www/wwwroot/fitron-docs.hm5.com}"
REMOTE_TMP_DIR="${REMOTE_TMP_DIR:-${REMOTE_TARGET_DIR}-tmp}"
LOCAL_DIST_DIR="${LOCAL_DIST_DIR:-docs/.vitepress/dist}"

if [[ ! -d "${LOCAL_DIST_DIR}" ]]; then
  echo "开始构建文档..."
fi

npm install
npm run docs:build

if [[ ! -d "${LOCAL_DIST_DIR}" ]]; then
  echo "构建结果不存在: ${LOCAL_DIST_DIR}"
  exit 1
fi

echo "开始上传到临时目录: ${REMOTE_TMP_DIR}"
ssh "${REMOTE_HOST}" "mkdir -p \"${REMOTE_TMP_DIR}\""
scp -r "${LOCAL_DIST_DIR}/"* "${REMOTE_HOST}:${REMOTE_TMP_DIR}/"

echo "开始替换线上目录: ${REMOTE_TARGET_DIR}"
ssh "${REMOTE_HOST}" "rm -fr \"${REMOTE_TARGET_DIR}\" && mv \"${REMOTE_TMP_DIR}\" \"${REMOTE_TARGET_DIR}\""

echo "部署完成"
