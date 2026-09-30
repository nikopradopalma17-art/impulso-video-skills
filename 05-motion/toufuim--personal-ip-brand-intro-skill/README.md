# Personal IP Brand Intro Skill

一款開源的 Codex Skill，用來製作具有商業價值、節奏明確，而且不套固定模板的個人 IP 品牌開場動畫。

每次製作都會依照使用者的品牌定位，重新建立視覺命題、設計指紋、節拍表、分鏡與動畫構圖。

## 作者與聯絡

- 官方網站：[FuFu AI Lab](https://fufuailab.com)
- Threads：[@xiaochou.chou](https://www.threads.com/@xiaochou.chou)

## 功能特色

- 不需要 Logo 或照片，也能使用動態大字與原創向量插圖製作
- 支援使用者提供的人像、IP 角色圖、產品圖或 Logo
- 支援文字、插圖與圖片混合構圖
- 使用者上傳音樂時，分析節奏、段落與重拍後進行對拍剪輯
- 使用者沒有上傳音樂時，自行設計 BPM 與節拍表
- 支援 HyperFrames、Remotion，或明確指定的雙引擎交付
- 支援 16:9、9:16 與 1:1
- 先完成分鏡與檢查，取得使用者確認後才正式渲染

## 沒有音樂時如何處理

當使用者沒有提供音樂，Skill 會根據品牌個性、文字密度與影片長度，自行選擇 BPM，並產生唯一的 `audiomap.json` 節拍表。

成品會保持靜音，但所有文字、插圖、轉場與品牌收尾仍會依照節拍設計。Skill 不會搜尋、下載或偷偷替換網路音樂。

如果使用者之後補上音樂，會重新分析上傳音軌並重建節拍表，不會直接沿用原本的靜音節奏。

## 安裝方式

### 方法一：請 Codex 安裝

把以下內容貼給 Codex：

```text
請使用 $skill-installer，從下列 GitHub 儲存庫安裝 personal-ip-brand-intro：
https://github.com/toufuim/personal-ip-brand-intro-skill
Skill 路徑是 personal-ip-brand-intro。
```

安裝完成後，重新啟動 Codex。

### 方法二：手動安裝

```bash
git clone https://github.com/toufuim/personal-ip-brand-intro-skill.git
cp -R personal-ip-brand-intro-skill/personal-ip-brand-intro ~/.codex/skills/
```

## 使用方式

### 純文字與插圖版本

```text
使用 $personal-ip-brand-intro 幫我製作一支 7 秒、16:9 的個人品牌開場。
品牌名稱是 Clear Pocket，內容是預算管理、ETF 入門與退休規劃。
我沒有 Logo、圖片與音樂，請自行設計文字、原創向量插圖與節拍。
先提供視覺方向和分鏡，不要直接正式渲染。
```

### 使用人物或 IP 圖片

```text
使用 $personal-ip-brand-intro，搭配我上傳的人物圖片製作 9:16 品牌開場。
請保留人物辨識度，並根據我的內容領域重新設計構圖、色彩與插圖。
不要沿用其他品牌的版型。
```

### 使用上傳音樂對拍

```text
使用 $personal-ip-brand-intro 分析我上傳的音樂，製作 7 秒 16:9 品牌開場。
請依照音樂的重拍、段落變化與停止點安排大字、服務內容和品牌收尾。
```

## 三種視覺模式

| 模式 | 適用情況 |
|---|---|
| `text-illustration` | 沒有外部圖片，使用動態文字與原創向量插圖 |
| `image-assisted` | 使用者提供人物、IP、產品圖或 Logo |
| `mixed` | 文字、插圖與使用者圖片共同構成品牌系統 |

## 主要製作流程

1. 整理品牌名稱、角色定位、內容領域、服務與標語
2. 選擇純文字、圖片輔助或混合模式
3. 分析使用者音樂，或建立自主節拍表
4. 建立品牌專屬視覺命題與七項設計指紋
5. 撰寫精確到時間點的節奏分鏡
6. 使用 HyperFrames 或 Remotion 製作
7. 檢查版面、動態、文字、對比、節奏與成片規格
8. 取得使用者確認後正式渲染

## 系統需求

- Node.js
- FFmpeg 與 FFprobe
- 預設製作路徑需要 HyperFrames
- 只有在要求 Remotion 輸出時才需要 Remotion

使用者上傳的圖片與音樂只保留在使用者自己的製作專案中。本儲存庫不包含示範人物、音樂、Logo、品牌時間表或可直接套用的品牌動畫模板。

## 專案結構

```text
personal-ip-brand-intro/
  SKILL.md
  agents/
  assets/
  references/
  scripts/
```

## 授權

採用 MIT License，詳見 [LICENSE](LICENSE)。
