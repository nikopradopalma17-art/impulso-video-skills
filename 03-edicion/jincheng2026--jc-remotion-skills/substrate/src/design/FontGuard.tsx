import { useEffect, useState } from 'react';
import { cancelRender, continueRender, delayRender } from 'remotion';
import './fonts';

// 中文 webfont 按 unicode-range 分包，加载与截图存在竞态：不等字体就截图
// 会静默退化成宋体（错题集 #01）。任何含文字的合成必须挂一个 <FontGuard/>。
// 策略：加载 → check 验证 → 不过就重试，最多 12s；仍失败则 cancelRender 报错，
// 宁可渲染失败也不允许悄悄出宋体。
const SPECS = [
  ...['500', '700', '900'].map((w) => `${w} 32px "Noto Sans SC"`),
  ...['300', '600', '700', '800'].map((w) => `${w} 32px "Inter"`), // 300 = 字幕英文行
  '400 32px "Archivo Black"', // 英文标题字体，本身即 Black，只有 400 一档
];
const SAMPLE = '思源黑体设计系统测试 AI0123456789';

export const FontGuard: React.FC = () => {
  const [handle] = useState(() => delayRender('等待中文字体分包加载'));
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const text = (document.body.innerText || '') + SAMPLE;
      for (let tries = 0; tries < 60; tries++) {
        await Promise.all(SPECS.map((s) => document.fonts.load(s, text).catch(() => {})));
        await document.fonts.ready;
        if (document.fonts.size > 0 && SPECS.every((s) => document.fonts.check(s, SAMPLE))) {
          if (!cancelled) continueRender(handle);
          return;
        }
        await new Promise((r) => setTimeout(r, 200));
      }
      cancelRender(new Error(`FontGuard: 字体未就绪（注册数=${document.fonts.size}），拒绝渲染宋体帧。若为 0 通常是字体 CSS 被树摇掉了，检查 package.json sideEffects（错题集 #01）`));
    };
    run().catch((e) => cancelRender(e));
    return () => {
      cancelled = true;
    };
  }, [handle]);
  return null;
};
