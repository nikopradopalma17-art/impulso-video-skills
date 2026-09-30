/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";
import { enableTailwind } from '@remotion/tailwind-v4';

Config.setVideoImageFormat("jpeg");
// 截帧质量拉满 + 编码 CRF 调低：默认 jpeg80+crf18 会在 MG 文字边缘产生压缩晕影（v3 画质教训）
Config.setJpegQuality(100);
Config.setCrf(15);
Config.setOverwriteOutput(true);
Config.overrideWebpackConfig(enableTailwind);
