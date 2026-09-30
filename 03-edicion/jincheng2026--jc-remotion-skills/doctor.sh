#!/usr/bin/env bash
# 兼容入口：逻辑已迁到跨平台的 doctor.mjs（Windows 直接 node doctor.mjs [目录]）
exec node "$(cd "$(dirname "$0")" && pwd)/doctor.mjs" "$@"
