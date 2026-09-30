import React, { useEffect } from 'react';
import { useCurrentFrame, useCurrentScale } from 'remotion';

// QC 探针（最佳实践采纳清单 A1，2026-07-16）：渲染期 DOM 层布局断言。
// 组件埋 data-qc="text|box|subtitle" + data-qc-id；探针逐帧收集 getBoundingClientRect
// （÷useCurrentScale 校正回合成像素），做三类断言并以 console.log('QC{json}') 上报，
// 由 scripts/render-service.mjs qc 模式经 onBrowserLog 收集汇总。
// 断言：①重叠（AABB 相交，排除父子/同 data-qc-group/data-qc-allow 白名单）
//      ②字幕净空（非字幕元素底边 > SUB_TOP_LIMIT）
//      ③最小字号（text 类 fontSize < MIN_FONT）
// 只在 inputProps.qc=true 时挂载，正式渲染零开销。

const SUB_TOP_LIMIT = 840; // 左区底线（layout.md：给贴底字幕留 ≥100px 净空）
// 最小字号阈值：跟 tokens.ts 的字阶真源走 —— typography §7.7 的 T4 下沿是 t4Sm=17
// （2026-07-25 实测定档），留 1px 容差 ⇒ 16。
// 旧值 19 是 2026-07-16 字阶定档前的口径（当时最小说明字 20px），已过期：t4Sm 条目
// 级 EN 小标会被误判 min-font 违规。2026-07-31 主会话裁定改 16；对存量片只放宽、不新增误报。
const MIN_FONT = 16;
const MIN_OVERLAP = 6; // 两个方向都超过 6px 才算重叠（容忍描边/阴影贴边）

type Box = {
  el: Element;
  leaf: boolean;
  id: string;
  kind: string;
  group: string;
  allow: string[];
  left: number;
  top: number;
  right: number;
  bottom: number;
  fontSize: number;
};

const effectiveOpacity = (el: Element): number => {
  let o = 1;
  let node: Element | null = el;
  while (node && node instanceof HTMLElement) {
    o *= parseFloat(getComputedStyle(node).opacity || '1');
    if (o < 0.01) return 0;
    node = node.parentElement;
  }
  return o;
};

export const QcProbe: React.FC = () => {
  const frame = useCurrentFrame();
  const scale = useCurrentScale();

  useEffect(() => {
    const report = (payload: Record<string, unknown>) => {
      // eslint-disable-next-line no-console
      console.log(`QC${JSON.stringify({ frame, ...payload })}`);
    };
    const els = Array.from(document.querySelectorAll('[data-qc]'));
    const boxes: Box[] = [];
    for (const el of els) {
      if (effectiveOpacity(el) < 0.15) continue; // 入退场半透期不判
      const r = el.getBoundingClientRect();
      if (r.width < 3 || r.height < 3) continue;
      const style = getComputedStyle(el);
      boxes.push({
        el,
        leaf: el.children.length === 0, // min-font 只查叶子（容器读到的是继承 16px，误报）
        id: el.getAttribute('data-qc-id') || el.getAttribute('data-qc') || '?',
        kind: el.getAttribute('data-qc') || 'box',
        group: el.getAttribute('data-qc-group') || '',
        allow: (el.getAttribute('data-qc-allow') || '').split(',').filter(Boolean),
        left: r.left / scale,
        top: r.top / scale,
        right: r.right / scale,
        bottom: r.bottom / scale,
        fontSize: parseFloat(style.fontSize) / scale,
      });
    }
    // 覆盖心跳：每帧上报一次（无论有无违规），供 render-service 核「探针是否真的全程在跑」。
    // 防假过闸（错题 #35）：Scene 漏挂 QcProbe → 该段无心跳 → render-service 判「覆盖不足」而非「零违规」。
    report({ hb: 1, n: boxes.length });
    for (let i = 0; i < boxes.length; i++) {
      const a = boxes[i];
      // ③最小字号
      if (a.kind === 'text' && a.leaf && a.fontSize > 0 && a.fontSize < MIN_FONT) {
        report({ type: 'min-font', a: a.id, detail: `${a.fontSize.toFixed(1)}px` });
      }
      // ②字幕净空（字幕自己豁免）
      if (a.kind !== 'subtitle' && a.bottom > SUB_TOP_LIMIT && a.top < SUB_TOP_LIMIT) {
        report({ type: 'sub-clearance', a: a.id, detail: `底边 ${Math.round(a.bottom)} > ${SUB_TOP_LIMIT}` });
      }
      for (let j = i + 1; j < boxes.length; j++) {
        const b = boxes[j];
        if (a.group && a.group === b.group) continue;
        if (a.allow.includes(b.id) || b.allow.includes(a.id)) continue;
        if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
        const ow = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const oh = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (ow > MIN_OVERLAP && oh > MIN_OVERLAP) {
          report({ type: 'overlap', a: a.id, b: b.id, detail: `${Math.round(ow)}x${Math.round(oh)}px` });
        }
      }
    }
  }, [frame, scale]);

  return null;
};
