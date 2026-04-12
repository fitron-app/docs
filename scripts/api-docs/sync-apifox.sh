#!/usr/bin/env bash
set -euo pipefail

OPENAPI_URL="${OPENAPI_URL:-}"
APIFOX_IMPORT_URL="${APIFOX_IMPORT_URL:-}"
APIFOX_TOKEN="${APIFOX_TOKEN:-}"
OPENAPI_FILE="${OPENAPI_FILE:-./openapi.json}"

if [[ -z "${OPENAPI_URL}" ]]; then
  echo "缺少环境变量 OPENAPI_URL"
  exit 1
fi

if [[ -z "${APIFOX_IMPORT_URL}" ]]; then
  echo "缺少环境变量 APIFOX_IMPORT_URL"
  exit 1
fi

if [[ -z "${APIFOX_TOKEN}" ]]; then
  echo "缺少环境变量 APIFOX_TOKEN"
  exit 1
fi

curl -fsSL "${OPENAPI_URL}" -o "${OPENAPI_FILE}"
echo "OpenAPI 已下载到 ${OPENAPI_FILE}"

curl -fsSL -X POST "${APIFOX_IMPORT_URL}" \
  -H "Authorization: Bearer ${APIFOX_TOKEN}" \
  -F "file=@${OPENAPI_FILE}"

echo "已触发 Apifox 导入"
