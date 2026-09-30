// 共享作用域：跨 Scene 复用的顶层辅助件与工具函数（含弃用件）。作用域锁：多会话共读，改此文件需全局对齐（勿并行改）。
import React from 'react';
import { AbsoluteFill, interpolate, OffthreadVideo, staticFile, useCurrentFrame } from 'remotion';
import {
  MessageCircle,
} from 'lucide-react';
import { useEnter, useExit } from '../../design/motion';
import { COLOR, FONT, GRID, SIZE, type SemanticColor } from '../../design/tokens';

const FPS = 30;
export const F = (seconds: number) => Math.round(seconds * FPS);
export const at = (seconds: number, sceneStart: number) => F(seconds - sceneStart);

// A 级素材接管：全幅底色盖住人物层，人物整段退场、不带 PiP（用户 2026-07-16 否决小窗；pip 参数仅存档，禁止置 true）。
// 放在 Scene fragment 的第一个子元素（同 Scene 内的 SideLabel/其他元素在其上层）。
export const Takeover: React.FC<{
  globalStart: number;
  children: React.ReactNode;
  surface?: 'dark' | 'light';
  pip?: boolean;
  enterAt?: number;
  exitAt?: number;
}> = ({ globalStart, children, surface = 'dark', pip = false, enterAt = 0, exitAt }) => {
  // pip 默认 false：用户 2026-07-16 否决人物缩右上小窗（「基准片并不是这么处理的」），接管期人物整段退场。
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [enterAt, enterAt + 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fadeOut =
    exitAt === undefined
      ? 1
      : interpolate(frame, [exitAt, exitAt + 12], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opacity = fadeIn * fadeOut;
  if (opacity <= 0) return null;
  return (
    <AbsoluteFill style={{ opacity }}>
      {/* dark 用半透明暗幕：人物隐约可见（基准片渐进接管手法），light 用实底 */}
      <AbsoluteFill style={{ background: surface === 'light' ? '#F2EFE9' : 'rgba(6,7,10,0.88)' }} />
      {/* 左缘压暗带：保证亮底接管时左上侧标仍可读 */}
      {surface === 'light' ? (
        <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(7,9,13,0.55) 0%, rgba(7,9,13,0.25) 18%, transparent 34%)' }} />
      ) : null}
      {children}
      {pip ? (
        <div
          style={{
            position: 'absolute',
            right: 48,
            top: 48,
            width: 320,
            height: 180,
            borderRadius: 16,
            overflow: 'hidden',
            border: '2px solid rgba(255,255,255,0.28)',
            boxShadow: '0 18px 50px rgba(0,0,0,0.5)',
          }}
        >
          <OffthreadVideo
            muted
            src={staticFile('footage/0715-01.mp4')}
            startFrom={F(globalStart)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// B 级压暗升格：人物在场，全帧压暗铺底（人物区禁入仍生效），用于 VS 决算/全片级判词。
// 已弃用（用户 2026-07-16 否决全帧压暗：他的画面不暗，压暗观感突兀）；保留导出仅作参考，禁止再挂载。
export const DimStage: React.FC<{ enterAt?: number; exitAt?: number; amount?: number }> = ({ enterAt = 0, exitAt, amount = 0.4 }) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [enterAt, enterAt + 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = exitAt === undefined ? 1 : interpolate(frame, [exitAt, exitAt + 15], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return <AbsoluteFill style={{ background: `rgba(4,5,8,${amount})`, opacity: fadeIn * fadeOut }} />;
};

// 逐字机打大字（开场 hook / 接管段用）
export const TypeHero: React.FC<{ text: string; color?: SemanticColor; enterAt: number; fontSize?: number; charFrames?: number }> = ({
  text,
  color,
  enterAt,
  fontSize = SIZE.h1,
  charFrames = 3,
}) => {
  const frame = useCurrentFrame();
  const n = Math.max(0, Math.floor((frame - enterAt) / charFrames));
  if (frame < enterAt) return null;
  const shown = text.slice(0, n);
  const done = n >= text.length;
  const caret = Math.floor(frame / 8) % 2 === 0;
  return (
    <div
      style={{
        fontFamily: FONT.zh,
        fontWeight: FONT.zhHeavy,
        fontSize,
        lineHeight: 1.12,
        color: color ? COLOR[color] : COLOR.white,
        textShadow: '0 6px 26px rgba(0,0,0,0.6)',
        whiteSpace: 'nowrap',
      }}
    >
      {shown}
      {!done && caret ? <span style={{ opacity: 0.9 }}>▌</span> : null}
    </div>
  );
};

export const LeftStage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      width: 640,
      top: 0,
      bottom: 0,
      pointerEvents: 'none',
    }}
  >
    {children}
  </div>
);

export const Place: React.FC<{
  children: React.ReactNode;
  top: number;
  left?: number;
  right?: number;
  scale?: number;
  rotate?: number;
  width?: number;
  /** QC 白名单：与哪些 data-qc-id 的重叠是设计（咬合位），逗号分隔。
   * 注意：默认 id `place@x,y` 含逗号会被 allow 的逗号切分拆碎，被引用方必须用 qcId 起无逗号别名 */
  qcAllow?: string;
  /** 覆盖默认 data-qc-id（供 qcAllow 引用时用无逗号别名） */
  qcId?: string;
}> = ({ children, top, left = 72, right, scale = 1, rotate = 0, width, qcAllow, qcId }) => (
  <div
    data-qc="box"
    data-qc-id={qcId ?? `place@${right === undefined ? left : `r${right}`},${top}`}
    data-qc-allow={qcAllow}
    style={{
      position: 'absolute',
      top,
      width,
      ...(right === undefined ? { left } : { right }),
      transform: `scale(${scale}) rotate(${rotate}deg)`,
      transformOrigin: right === undefined ? 'top left' : 'top right',
    }}
  >
    {children}
  </div>
);

export const FadeUp: React.FC<{ children: React.ReactNode; enterAt: number }> = ({ children, enterAt }) => {
  const enter = useEnter(enterAt, 'up');
  return <div style={{ opacity: enter.opacity, transform: enter.transform }}>{children}</div>;
};

// 退场包装器：exitAt 起淡出+轻降（章内旧元素让位 / 章尾清场用）
// 容器卡入场门控：darkPlate 容器 div 没有自己的 enterAt 时会从章首就渲出空黑板（体检 s06 实锤），必须包一层。
export const Enter: React.FC<{ at: number; children: React.ReactNode }> = ({ at: enterAt, children }) => {
  const en = useEnter(enterAt, 'up');
  return <div style={{ opacity: en.opacity, transform: en.transform }}>{children}</div>;
};

// 让位门控：主角进场后旧主导层 dim（章标题=导航不是主角，seg02 词级方案 D1）。
export const DimAfter: React.FC<{ at: number; to?: number; children: React.ReactNode }> = ({ at: dimAt, to = 0.4, children }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [dimAt, dimAt + 12], [1, to], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return <div style={{ opacity: o }}>{children}</div>;
};

export const Exit: React.FC<{ at: number; children: React.ReactNode }> = ({ at: exitAt, children }) => {
  const ex = useExit(exitAt);
  if (ex.opacity <= 0) return null;
  return <div style={{ opacity: ex.opacity, transform: ex.transform }}>{children}</div>;
};

export const Kicker: React.FC<{
  text: string;
  color?: SemanticColor;
  enterAt?: number;
}> = ({ text, color = 'blue', enterAt = 0 }) => {
  const enter = useEnter(enterAt, 'left');
  return (
    <div
      style={{
        fontFamily: FONT.en,
        fontWeight: 800,
        fontSize: SIZE.kicker,
        letterSpacing: '0.3em',
        color: COLOR[color],
        opacity: enter.opacity,
        transform: enter.transform,
        textShadow: '0 2px 12px rgba(0,0,0,0.6)',
      }}
    >
      {text.toUpperCase()}
    </div>
  );
};

export const TypeLockup: React.FC<{
  zh: string;
  kicker: string;
  color: SemanticColor;
  enterAt?: number;
  size?: 'h1' | 'h2';
}> = ({ zh, kicker, color, enterAt = 0, size = 'h1' }) => {
  const enter = useEnter(enterAt, 'up');
  return (
    <div style={{ opacity: enter.opacity, transform: enter.transform }}>
      <div
        style={{
          fontFamily: FONT.zh,
          fontWeight: FONT.zhHeavy,
          fontSize: SIZE[size],
          lineHeight: 1.08,
          whiteSpace: 'nowrap',
          color: COLOR.white,
          textShadow: '0 0 34px rgba(255,255,255,0.2), 0 6px 22px rgba(0,0,0,0.7)',
        }}
      >
        {zh}
      </div>
      <div
        style={{
          marginTop: GRID,
          fontFamily: FONT.en,
          fontWeight: 800,
          fontSize: SIZE.kicker,
          letterSpacing: '0.3em',
          color: COLOR[color],
        }}
      >
        {kicker.toUpperCase()}
      </div>
    </div>
  );
};

// Generating 胶囊（复刻 n4 t=55 白色实录卡）。
// seg05 2026-07-17 帧级校验重排后弃用（改内联 S5GeneratingCard：8 点 spinner+打字扩展+卡体加宽）；
// 保留导出仅作参考（同 DimStage 先例），禁止再挂载。
export const GeneratingPill: React.FC<{ enterAt: number }> = ({ enterAt }) => {
  const frame = useCurrentFrame();
  const enter = useEnter(enterAt, 'up');
  const pulse = 0.55 + 0.45 * Math.sin(frame / 4);
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: GRID * 2,
        padding: `${GRID * 2.5}px ${GRID * 5}px`,
        borderRadius: 16,
        background: '#FBF9F6',
        boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
        opacity: enter.opacity,
        transform: enter.transform,
      }}
    >
      <span style={{ width: 18, height: 18, borderRadius: 9, background: '#E5484D', opacity: pulse }} />
      <span style={{ fontFamily: FONT.en, fontWeight: 600, fontSize: 30, color: '#4A505A' }}>Generating</span>
    </div>
  );
};

// ============ seg01 开场体验序列（对齐基准片 0-7.5s 的第一人称操作流） ============

// 深底 + 渐变包边（章法修正：渐变只做上下窄带氛围包边，内容区永远是黑的——基准片三段式）
export const GradientBlobs: React.FC<{ strength?: number }> = ({ strength = 1 }) => (
  <AbsoluteFill style={{ overflow: 'hidden' }}>
    {/* 底部窄渐变带 */}
    <div
      style={{
        position: 'absolute',
        left: -120,
        right: -120,
        bottom: -180,
        height: 430,
        background: 'linear-gradient(100deg, #3B82F6 0%, #8B5CF6 30%, #E14FA0 58%, #FF5FA2 78%, #7C3AED 100%)',
        filter: 'blur(90px)',
        opacity: 0.6 * strength,
      }}
    />
    {/* 顶部窄渐变带（侧标区后方） */}
    <div
      style={{
        position: 'absolute',
        left: -120,
        right: -120,
        top: -200,
        height: 360,
        background: 'linear-gradient(80deg, #7C3AED 0%, #3B82F6 45%, #E14FA0 100%)',
        filter: 'blur(100px)',
        opacity: 0.32 * strength,
      }}
    />
  </AbsoluteFill>
);

// 鼠标手型指针（Chat 特写点击用）
const HandCursor: React.FC<{ pressAt: number }> = ({ pressAt }) => {
  const frame = useCurrentFrame();
  const dip = interpolate(frame, [pressAt - 6, pressAt, pressAt + 6], [0, 14, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <svg width={130} height={150} viewBox="0 0 26 30" style={{ transform: `translateY(${dip}px)`, filter: 'drop-shadow(0 8px 18px rgba(0,0,0,0.5))' }}>
      <path
        d="M10 2v14l-3.2-2.6c-1-.8-2.4-.7-3.2.3-.7.9-.6 2.2.2 3l7.4 7.6c1 1 2.3 1.7 3.8 1.7h4.6c2.8 0 5-2.2 5-5v-6.2c0-1.3-1-2.4-2.3-2.5l-8.3-1V2c0-1.1-.9-2-2-2s-2 .9-2 2z"
        fill="#FFFFFF"
        stroke="#16181D"
        strokeWidth={1.2}
      />
    </svg>
  );
};

// 全屏大字打字机（prompt 输入体验）
export const BigTyper: React.FC<{ text: string; enterAt: number; fontSize?: number; charFrames?: number }> = ({ text, enterAt, fontSize = 96, charFrames = 2 }) => {
  const frame = useCurrentFrame();
  if (frame < enterAt) return null;
  const n = Math.min(text.length, Math.floor((frame - enterAt) / charFrames));
  const caret = Math.floor(frame / 7) % 2 === 0;
  return (
    <div style={{ fontFamily: FONT.en, fontWeight: 700, fontSize, color: COLOR.white, whiteSpace: 'nowrap', textShadow: '0 4px 30px rgba(0,0,0,0.5)' }}>
      {text.slice(0, n)}
      {caret ? <span style={{ opacity: 0.85, fontWeight: 400 }}>|</span> : null}
    </div>
  );
};

// Chat 输入条怼脸特写（按基准片帧测量：pill 高 ~280px、按钮 ~340px、组件超宽出血、毛玻璃）
export const ChatBarZoom: React.FC<{ enterAt: number; clickAt: number }> = ({ enterAt, clickAt }) => {
  const frame = useCurrentFrame();
  const enter = useEnter(enterAt, 'up');
  const press = interpolate(frame, [clickAt, clickAt + 4, clickAt + 10], [1, 0.88, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 70, opacity: enter.opacity, transform: enter.transform }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 44, padding: '72px 110px', borderRadius: 999, border: '5px solid rgba(255,255,255,0.4)', background: 'rgba(16,16,22,0.55)', backdropFilter: 'blur(12px)', fontFamily: FONT.en, fontWeight: 600, fontSize: 96, color: 'rgba(255,255,255,0.9)' }}>
        <MessageCircle size={110} strokeWidth={2} />
        Chat
      </div>
      {/* 语音波形钮 */}
      <div style={{ width: 300, height: 300, borderRadius: 150, border: '5px solid rgba(255,255,255,0.4)', background: 'rgba(16,16,22,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        {[54, 96, 140, 96, 54].map((h, i) => (
          <div key={i} style={{ width: 16, height: h, borderRadius: 8, background: 'rgba(255,255,255,0.85)' }} />
        ))}
      </div>
      {/* 发送钮 + 鼠标手型 */}
      <div style={{ position: 'relative' }}>
        <div style={{ transform: `scale(${press})`, width: 340, height: 340, borderRadius: 170, background: 'linear-gradient(160deg,#FFFFFF, #E9E4F7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 90px rgba(139,92,246,0.55)' }}>
          <svg width={150} height={150} viewBox="0 0 24 24" fill="none" stroke="#16181D" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </div>
        <div style={{ position: 'absolute', right: -20, bottom: -60 }}>
          <HandCursor pressAt={clickAt} />
        </div>
      </div>
    </div>
  );
};

// AI 生成 loading：单体连续渐变软花瓣（基准片款：8 瓣剪影 mask 一整张渐变，蓝右上→品红中→橙左下）
export const GenLoader: React.FC<{ enterAt: number; size?: number }> = ({ enterAt, size = 430 }) => {
  const frame = useCurrentFrame();
  const enter = useEnter(enterAt, 'up');
  const petals = 8;
  const r = size * 0.27;
  const petalR = size * 0.235;
  // 花形剪影：中心圆 + 8 个花瓣圆合成一张 mask，渐变作为整体填充
  const maskParts = [
    `radial-gradient(circle ${size * 0.3}px at 50% 50%, black 99%, transparent 100%)`,
    ...Array.from({ length: petals }).map((_, i) => {
      const a = (i / petals) * Math.PI * 2 + (frame * 0.012);
      const cx = 50 + (Math.cos(a) * r * 100) / size;
      const cy = 50 + (Math.sin(a) * r * 100) / size;
      return `radial-gradient(circle ${petalR}px at ${cx}% ${cy}%, black 99%, transparent 100%)`;
    }),
  ].join(',');
  return (
    <div
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(215deg, #4D9EFF 0%, #B45BE0 34%, #E1338F 58%, #FF7A45 100%)',
        WebkitMaskImage: maskParts,
        maskImage: maskParts,
        opacity: enter.opacity,
        transform: enter.transform,
        filter: 'blur(6px) drop-shadow(0 0 60px rgba(225,51,143,0.45))',
      }}
    />
  );
};

// 成品页：完整网页 mockup（按基准片帧测量：~1330px 宽近全高，浏览器 chrome + 左文档右简历双栏）
export const ResumeMock: React.FC<{ enterAt: number }> = ({ enterAt }) => {
  const enter = useEnter(enterAt, 'up');
  return (
    <div style={{ width: 1360, height: 900, borderRadius: 22, background: '#15161C', boxShadow: '0 40px 120px rgba(0,0,0,0.6)', overflow: 'hidden', opacity: enter.opacity, transform: enter.transform }}>
      {/* 浏览器 chrome */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px 26px', borderBottom: '1px solid rgba(255,255,255,0.09)' }}>
        {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
          <div key={c} style={{ width: 15, height: 15, borderRadius: 8, background: c }} />
        ))}
        <div style={{ marginLeft: 18, fontFamily: FONT.en, fontWeight: 700, fontSize: 24, color: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#8B7BF8' }}>✦</span> Chat
        </div>
        <span style={{ marginLeft: 'auto', fontFamily: FONT.en, fontWeight: 700, fontSize: 20, color: '#FFFFFF', background: '#2A63F6', borderRadius: 10, padding: '8px 26px' }}>Export ⌄</span>
      </div>
      <div style={{ display: 'flex', height: '100%' }}>
        {/* 左：对话暗栏（真实文本密度，对齐基准片的 builder 对话栏） */}
        <div style={{ width: 430, padding: '26px 32px', borderRight: '1px solid rgba(255,255,255,0.09)', fontFamily: FONT.en }}>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)' }}>Thought for 3s</div>
          <div style={{ marginTop: 14, fontWeight: 600, fontSize: 17, lineHeight: 1.55, color: 'rgba(255,255,255,0.82)' }}>
            I'll create a beautiful AI-powered resume builder inspired by modern platforms like Notion and Canva, with a clean professional aesthetic.
          </div>
          <div style={{ marginTop: 16, fontWeight: 700, fontSize: 15, color: 'rgba(255,255,255,0.6)' }}>Design direction:</div>
          <div style={{ marginTop: 8, fontWeight: 500, fontSize: 15, lineHeight: 1.6, color: 'rgba(255,255,255,0.55)' }}>
            • Crisp neutral palette with deep blue accents<br />
            • Modern sans-serif headline font (Inter)<br />
            • Minimal shadows, rounded inputs<br />
            • Section-based editor with live preview
          </div>
          {['10 edits made', 'First version features', 'Hero section with CTA', 'Resume template gallery'].map((t, i) => (
            <div key={i} style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>
              <span>{t}</span>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>Show all</span>
            </div>
          ))}
          <div style={{ marginTop: 22, padding: '13px 18px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.16)', fontSize: 15, color: 'rgba(255,255,255,0.4)' }}>Ask Lovable…</div>
        </div>
        {/* 右：白底简历（照片位 + 真实条目） */}
        <div style={{ flex: 1, background: '#FFFFFF', padding: '34px 46px', fontFamily: FONT.en }}>
          <div style={{ display: 'flex', gap: 36 }}>
            <div style={{ width: 200, height: 250, borderRadius: 12, background: 'linear-gradient(170deg,#EFE9FA 0%,#C9B6F5 55%,#8E6FE0 100%)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden' }}>
              <div style={{ width: 130, height: 150, borderRadius: '65px 65px 0 0', background: '#6D4FD0', opacity: 0.55 }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 26, color: '#8A8F9C', letterSpacing: '0.04em' }}>Resume</div>
              <div style={{ marginTop: 6, fontWeight: 800, fontSize: 84, color: '#274FBE', lineHeight: 0.98 }}>Megan<br />Reed</div>
              <div style={{ marginTop: 10, fontWeight: 800, fontSize: 22, color: '#1A1D24', letterSpacing: '0.14em' }}>BRAND STRATEGIST</div>
              <div style={{ marginTop: 10, fontWeight: 500, fontSize: 16, lineHeight: 1.5, color: '#5A606C' }}>
                Brand strategist crafting clear, distinctive and insight-driven brand experiences. Focused on positioning and narrative.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 34, marginTop: 26 }}>
            <div style={{ flex: 1, background: '#2A63F6', borderRadius: 12, padding: '20px 24px', color: '#FFFFFF' }}>
              <div style={{ fontWeight: 800, fontSize: 19, letterSpacing: '0.1em' }}>EXPERTISE</div>
              <div style={{ marginTop: 10, fontWeight: 500, fontSize: 15, lineHeight: 1.55, opacity: 0.92 }}>
                Megan helps organizations solve growth and positioning challenges by turning complex ideas into clear, differentiated brand strategies.
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 19, letterSpacing: '0.1em', color: '#1A1D24' }}>EXPERIENCE</div>
              <div style={{ marginTop: 10, fontSize: 15, fontWeight: 600, color: '#1A1D24' }}>
                <span style={{ border: '1.5px solid #C6CBD6', borderRadius: 6, padding: '2px 8px', fontSize: 13, color: '#5A606C' }}>2022 — Present</span>
                <div style={{ marginTop: 6 }}>Senior Brand Strategy Consultant</div>
                <div style={{ fontWeight: 500, color: '#8A8F9C', fontSize: 14 }}>Independent</div>
                <div style={{ marginTop: 12 }}>
                  <span style={{ border: '1.5px solid #C6CBD6', borderRadius: 6, padding: '2px 8px', fontSize: 13, color: '#5A606C' }}>2019 — 2022</span>
                  <div style={{ marginTop: 6 }}>Marketing Communications Lead</div>
                  <div style={{ fontWeight: 500, color: '#8A8F9C', fontSize: 14 }}>Brightside Creative Studio</div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 14, border: '1.5px solid #D9DDE6', borderRadius: 999, padding: '13px 24px', fontSize: 16, color: '#8A8F9C', width: 520 }}>
            Ask Resumeo anything…
            <span style={{ marginLeft: 'auto', width: 34, height: 34, borderRadius: 17, background: 'linear-gradient(150deg,#8B5CF6,#E14FA0)' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

// 想法爆炸墙：满屏密铺大 pill（按基准片帧测量：pill 高 ~110px 字号 ~62px，四行超宽出血 + 渐变 logo 点缀 + 缓慢横移）
const IDEA_ROWS: string[][] = [
  ['Portfolio website CMS', 'Meal planner AI', 'Habit tracker'],
  ['Service booking app', 'AI meeting summarizer', 'AI note taker'],
  ['AI email summarizer', 'AI chatbot for law', 'Stock screener'],
  ['Resume builder', 'Online course platform', 'Social network'],
  ['Automation app', 'AI journaling app', 'Travel planner'],
];
// Lovable 心形渐变 logo（CSS：旋转方块+两圆）
const HeartLogo: React.FC<{ size?: number }> = ({ size = 130 }) => {
  const s = size * 0.52;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0, filter: 'drop-shadow(0 0 26px rgba(225,79,160,0.5))' }}>
      <div style={{ position: 'absolute', left: size * 0.24, top: size * 0.32, width: s, height: s, transform: 'rotate(45deg)', background: 'linear-gradient(135deg,#FF8E53,#E1338F 55%,#8B5CF6)', borderRadius: s * 0.12 }} />
      <div style={{ position: 'absolute', left: size * 0.09, top: size * 0.17, width: s, height: s, borderRadius: '50%', background: 'linear-gradient(160deg,#FF8E53,#E1338F)' }} />
      <div style={{ position: 'absolute', left: size * 0.39, top: size * 0.17, width: s, height: s, borderRadius: '50%', background: 'linear-gradient(200deg,#E1338F,#8B5CF6)' }} />
    </div>
  );
};

export const IdeaWall: React.FC<{ enterAt: number }> = ({ enterAt }) => {
  const frame = useCurrentFrame();
  const drift = (frame - enterAt) * 0.7;
  return (
    <AbsoluteFill style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 34 }}>
      {IDEA_ROWS.map((row, r) => {
        const dir = r % 2 === 0 ? 1 : -1;
        return (
          <div key={r} style={{ display: 'flex', gap: 44, marginLeft: -320 + ((r * 173) % 300), transform: `translateX(${dir * drift}px)`, alignItems: 'center' }}>
            {r === 2 ? <HeartLogo /> : null}
            {[...row, ...row].map((t, i) => {
              const idx = r * 3 + (i % 3);
              const local = frame - enterAt - idx * 1.5;
              const p = Math.max(0, Math.min(1, local / 8));
              const typed = Math.min(t.length, Math.max(0, Math.floor(local / 0.8)));
              const pinkBorder = (r + i) % 4 === 1;
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 30,
                    padding: '34px 56px',
                    borderRadius: 999,
                    border: `2.5px solid ${pinkBorder ? 'rgba(255,95,162,0.55)' : 'rgba(255,255,255,0.32)'}`,
                    background: 'rgba(10,10,15,0.55)',
                    fontFamily: FONT.en,
                    fontWeight: 600,
                    fontSize: 64,
                    color: 'rgba(255,255,255,0.94)',
                    whiteSpace: 'nowrap',
                    opacity: p,
                    transform: `translateY(${(1 - p) * 26}px)`,
                    flexShrink: 0,
                  }}
                >
                  {t.slice(0, typed)}
                  <span style={{ width: 72, height: 72, borderRadius: 36, background: 'rgba(255,255,255,0.92)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width={38} height={38} viewBox="0 0 24 24" fill="none" stroke="#16181D" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 19V5M5 12l7-7 7 7" />
                    </svg>
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// 开场 hook：Vibe Coding 打字机代码窗内容（配 WindowCard）
const CODE_LINES = [
  '$ npx create-ai-app my-unicorn',
  '> idea: "AI 应用 · 下一个独角兽"',
  '> stack: Claude API + Next.js',
  '> generating landing page ...',
  '> generating pricing ...',
  '> deployed. total: 5 min',
];
export const CodeTyper: React.FC<{ enterAt: number }> = ({ enterAt }) => {
  const frame = useCurrentFrame();
  const chars = Math.max(0, (frame - enterAt) * 1.4);
  let used = 0;
  return (
    <div style={{ padding: `${GRID * 3}px ${GRID * 4}px`, fontFamily: FONT.en, fontWeight: 600, fontSize: 27, lineHeight: 1.85, letterSpacing: '0.02em' }}>
      {CODE_LINES.map((line, i) => {
        const take = Math.max(0, Math.min(line.length, Math.floor(chars - used)));
        used += line.length + 6; // 行间停顿
        const color = line.startsWith('$') ? COLOR.white : i >= 3 ? COLOR.grey : COLOR.green;
        return (
          <div key={i} style={{ color, whiteSpace: 'pre' }}>
            {line.slice(0, take)}
            {take > 0 && take < line.length ? '▌' : ''}
          </div>
        );
      })}
    </div>
  );
};

// 章尾清场：线性淡出+轻降（方案§三.11 51.4 起 12-15 帧），14 帧至 51.87 收敛，51.9-52.37 净场喘息交 Scene05。
// 不用 useExit：其 ease-in 前段太平（清场起步不可辨），线性 14 帧立即可见。
// 章尾整组清场（2026-07-25 按 motion §6.6 改写）：9 帧线性纯淡出、零位移零缩放。
// 旧版 14 帧 + translateY(14px) + scale(0.98) 已废止（位移超 1% 画高、帧数超规）。
export const ClearOut: React.FC<{ at: number; children: React.ReactNode }> = ({ at: exitAt, children }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [exitAt, exitAt + 9], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  if (t >= 1) return null;
  return <div style={{ opacity: 1 - t }}>{children}</div>;
};
