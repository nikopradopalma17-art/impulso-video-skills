#!/usr/bin/env bash
# 兼容入口：逻辑已迁到跨平台的 install.mjs（Windows 直接 node install.mjs --target <目录>）
exec node "$(cd "$(dirname "$0")" && pwd)/install.mjs" "$@"
