#!/bin/bash
# 兼容入口：逻辑已迁到跨平台的 qc-master.mjs（Windows 直接 node scripts/qc-master.mjs …）
exec node "$(cd "$(dirname "$0")" && pwd)/qc-master.mjs" "$@"
