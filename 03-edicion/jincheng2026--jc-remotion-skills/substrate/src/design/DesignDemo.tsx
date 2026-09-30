import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { BadgeCheck, Bot, Car, Crown, Coins, Copy, Flame, Frown, Handshake, Headphones, Inbox, Lock, Package, Scale, SlidersHorizontal, Upload, UserCheck, Users, Wand2 } from 'lucide-react';
import { ShotCard } from './ShotCard';
import { DMCardStack } from './DMCardStack';
import { WindowCard } from './WindowCard';
import { CardWall } from './CardWall';
import { CurveOverlay } from './CurveOverlay';
import { Stamp } from './Stamp';
import { MatrixIcon } from './MatrixIcon';
import { StepList } from './StepList';
import { FlowChain } from './FlowChain';
import { CompareCard } from './CompareCard';
import { InfoCard } from './InfoCard';
import { BadgeCard } from './BadgeCard';
import { SideLabel } from './SideLabel';
import { HeroText } from './HeroText';
import { Chip } from './Chip';
import { Checklist } from './Checklist';
import { BilingualSub } from './BilingualSub';
import { COLOR, FONT, SAFE, SIZE } from './tokens';
import { FontGuard } from './FontGuard';
import { BigNumber } from './BigNumber';
import { PhoneMockup } from './PhoneMockup';
import { QuoteDoc } from './QuoteDoc';
import { TweetCard } from './TweetCard';
import { PersonCard } from './PersonCard';
import { BarChart } from './BarChart';
import { ScoreBoard } from './ScoreBoard';
import { TimelineEvents } from './TimelineEvents';

// 设计系统验收 demo 集：每个合成复刻 refs/ 里一张参考帧，
// 用 `npx remotion still` 截帧与参考图并排对比。

const Bg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: 'radial-gradient(130% 100% at 28% 18%, #151a26 0%, #0b0e14 52%, #07090d 100%)' }}>
    <FontGuard />
    {/* 暗角：压四角、聚中心，避免「纯平黑」 */}
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)' }} />
    {children}
  </AbsoluteFill>
);

export const SideLabelDemo: React.FC<{
  color?: 'blue' | 'green' | 'yellow' | 'red';
  en?: string;
  zh?: string;
  sub?: string;
}> = ({ color = 'blue', en = 'DEFINITION', zh = '严格来说', sub = '它其实不是…' }) => {
  return (
    <Bg>
      <SideLabel color={color} en={en} zh={zh} sub={sub} />
    </Bg>
  );
};

// 复刻 refs/02-hero大字/n1_t063：删除线纠偏「“智能体”→ 工作流打包」
export const StrikeFixDemo: React.FC = () => {
  return (
    <Bg>
      <SideLabel color="blue" en="DEFINITION" zh="严格来说" sub="它其实不是…" />
      <HeroText
        segments={[{ t: '“智能体”', dim: true, strike: true }]}
        size="h2"
        top={188}
        enterAt={0}
      />
      <HeroText
        kicker="IT'S REALLY A"
        segments={[{ t: '工作流' }, { t: '打包', color: 'blue' }]}
        size="h2"
        top={290}
        enterAt={14}
      />
      <div style={{ position: 'absolute', left: SAFE.stackX, top: 430 }}>
        <Chip
          icon={<Bot size={26} strokeWidth={2.5} />}
          accent="blue"
          segments={[{ t: '过程中有 AI Agent 监工' }]}
          enterAt={26}
        />
      </div>
      <BilingualSub zh="AI的agent来参与监工的" en="AI agents to participate in the supervision" />
    </Bg>
  );
};

// 复刻 refs/02-hero大字/n1_t246：THE SHIFT 转换思维 · 拥抱市场 + 两个 chip
export const TheShiftDemo: React.FC = () => {
  return (
    <Bg>
      <HeroText
        kicker="THE SHIFT"
        segments={[{ t: '转换思维' }, { t: '\u00A0·\u00A0' }, { t: '拥抱市场', color: 'blue' }]}
        size="h1"
        top={150}
        enterAt={0}
      />
      <div style={{ position: 'absolute', left: SAFE.stackX, top: 320, display: 'flex', gap: 16 }}>
        <Chip icon={<Headphones size={26} strokeWidth={2.5} />} accent="blue" segments={[{ t: '倾听下沉市场' }]} enterAt={12} />
        <Chip icon={<Handshake size={26} strokeWidth={2.5} />} accent="blue" segments={[{ t: '对接真实需求' }]} enterAt={20} />
      </div>
      <BilingualSub zh="一旦你能转变思维" en="Once you can change your mind" />
    </Bg>
  );
};

// 复刻 refs/03-chip与checklist/n1_t225：THE TRAP 三条红卡
export const TheTrapDemo: React.FC = () => {
  return (
    <Bg>
      <SideLabel color="red" en="THE TRAP" zh="技术大神的困境" sub="很多 Vibe Coder 正卡在这" />
      <Checklist
        accent="red"
        outlined
        top={190}
        items={[
          { icon: <Lock size={26} strokeWidth={2.5} />, segments: [{ t: '闭门造车 · 只做自己想做的' }], enterAt: 0 },
          { icon: <Flame size={26} strokeWidth={2.5} />, segments: [{ t: '每天烧掉大量 Token' }], enterAt: 18 },
          { icon: <Frown size={26} strokeWidth={2.5} />, segments: [{ t: '内耗很久 · 又痛苦又不变现' }], enterAt: 36 },
        ]}
      />
      <BilingualSub zh="现在有大量做Vibe coding" en="There is a lot of Vibe coding now" />
    </Bg>
  );
};


// ====== 第二批：数据组件验收 ======

// 复刻 refs/05-数据可视化/n4_t076：MANUS $125M 计数器 + Meta 并购条形图
export const ManusDemo: React.FC = () => {
  return (
    <Bg>
      <div style={{ position: 'absolute', left: SAFE.stackX, top: SAFE.sideLabel.y }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <span style={{ fontFamily: FONT.en, fontWeight: 800, fontSize: SIZE.chip, color: COLOR.white }}>MANUS</span>
          <span style={{ fontFamily: FONT.en, fontWeight: 800, fontSize: SIZE.kicker, letterSpacing: '0.3em', color: COLOR.grey }}>
            CASE 02 · AI AGENT
          </span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: SAFE.stackX, top: 170 }}>
        <BigNumber
          value={125}
          countFrom={94}
          prefix="$"
          suffix="M"
          color="yellow"
          enKicker="ARR · IN 8 MONTHS"
          zhSub="年化营收 · 上线 8 个月"
          enterAt={0}
        />
      </div>
      <div style={{ position: 'absolute', left: SAFE.stackX, top: 430 }}>
        <div style={{ fontFamily: FONT.en, fontWeight: 800, fontSize: SIZE.kicker, letterSpacing: '0.3em', color: COLOR.grey, marginBottom: 18 }}>
          META M&A TOP 3 <span style={{ letterSpacing: 0, color: COLOR.greyDim }}>· 并购史前三</span>
        </div>
        <BarChart
          accent="yellow"
          enterAt={30}
          items={[
            { label: 'WhatsApp', value: 19, display: '$19B' },
            { label: 'Scale AI', value: 14.8, display: '$14.8B' },
            { label: 'Manus', value: 2, display: '$2B', highlight: true },
          ]}
        />
      </div>
      <BilingualSub zh="差点就被Meta以20亿美金收购了" en="Almost got bought by Meta for $2 billion" />
    </Bg>
  );
};

// 复刻 refs/05-数据可视化/n3_t123：票数计分卡 218:214 / 51:50
export const ScoreboardDemo: React.FC = () => {
  return (
    <Bg>
      <SideLabel color="red" en="NEARLY FAILED" zh="差一点没通过" sub="大而美法案 · 压线通过" />
      <div style={{ position: 'absolute', left: SAFE.stackX, top: 210 }}>
        <ScoreBoard
          enterAt={0}
          rows={[
            { enKicker: 'HOUSE', zhLabel: '众议院', left: 218, right: 214 },
            { enKicker: 'SENATE', zhLabel: '参议院', left: 51, right: 50, note: 'VP VANCE · 万斯投出打破平局的一票' },
          ]}
        />
      </div>
      <BilingualSub zh="当时在众议院这边是218:214票" en="It was 218 to 214 on this side of the House" />
    </Bg>
  );
};

// 复刻 refs/05-数据可视化/n3_t090：事件时间轴 2021 被拒 → 2025 入法案
export const TimelineDemo: React.FC = () => {
  return (
    <Bg>
      <SideLabel color="blue" en="WHO'S PUSHING" zh="背后的推手" sub="从 2021 推到 2025" />
      <div style={{ position: 'absolute', left: SAFE.stackX, top: 320 }}>
        <TimelineEvents
          enterAt={0}
          width={860}
          events={[
            { xPct: 6, title: '2021', sub: '找拜登政府', chip: { text: 'REJECTED · 没推成', color: 'red' } },
            { xPct: 64, title: '2025', sub: '这一届', chip: { text: 'IN THE BILL · 塞进法案', color: 'green' } },
          ]}
        />
      </div>
      <BilingualSub zh="塞进了这个法案里面" en="Stuffed into this bill" />
    </Bg>
  );
};

// 复刻 refs/05-数据可视化/n1_t204：公式字卡 需求 ＞ 供给
export const FormulaDemo: React.FC = () => {
  return (
    <Bg>
      <SideLabel color="yellow" en="FOCUS = SCALE" zh="聚焦即铺开" sub="聚焦到一个行业，痛点就一致" />
      <HeroText
        segments={[{ t: '解决一个,' }, { t: '就能铺开全国', color: 'blue' }]}
        size="h2"
        top={200}
        enterAt={0}
      />
      <HeroText
        segments={[{ t: '需求', color: 'yellow' }, { t: '\u00A0＞\u00A0' }, { t: '供给', dim: true }]}
        size="h1"
        top={330}
        enterAt={16}
      />
      <BilingualSub zh="绝对是一个需大于供的状态" en="Definitely a state of more need than supply" />
    </Bg>
  );
};


// ====== 第三批：实录 / 引用类验收 ======

// 假微信群聊内容（占位，验证 PhoneMockup 容器与滚动；实战时换真截图 <Img>）
// 标题栏固定不滚（走 PhoneMockup 的 header），消息从标题栏下面划过。
const ChatHeader: React.FC = () => (
  <div
    style={{
      background: '#F7F7F7',
      borderBottom: '1px solid rgba(0,0,0,0.08)',
      padding: '52px 0 14px',
      textAlign: 'center',
      fontFamily: FONT.zh,
      fontWeight: 700,
      fontSize: 24,
      color: '#111',
    }}
  >
    财富自由团 (314)
  </div>
);

const FakeChat: React.FC = () => {
  const bubbles = [
    '基准片，我有个场景，我们卖二手车的每天都要拍照发朋友圈',
    '一是热天不想去拍，二是拍的好看不好看全看运气',
    '就是能不能用 agent 把随手拍的照片保证真实的情况下变成展厅里的照片',
    '换个固定场景生成了，我拿来直接上架',
    '本来我的理解其实还挺简单的，P 图换个场景嘛',
    '但是用下来就是不稳定，乱出，乱画的',
    '不同角度的图片也很难生成一个统一的角度',
    '这个提示词的设置应该朝着哪个方向去啊',
    '有没有可能一个 agent 负责出图，另一个 agent 负责审图',
    '审完不合格的自动打回去重新生成，跑一晚上第二天全是能用的图',
  ];
  return (
    <div style={{ width: '100%', background: '#EDEDED', paddingTop: 104, paddingBottom: 48 }}>
      {bubbles.map((b, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, padding: '12px 16px' }}>
          <div style={{ width: 40, height: 40, borderRadius: 7, background: ['#7A9BC8','#C8A67A','#8BC87A','#C87A8B'][i%4], flexShrink: 0 }} />
          <div style={{ maxWidth: 262, background: '#FFFFFF', borderRadius: 9, padding: '10px 12px', fontFamily: FONT.zh, fontWeight: 500, fontSize: 19, lineHeight: 1.45, color: '#111' }}>
            {b}
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 10, padding: '12px 16px', justifyContent: 'flex-end' }}>
        <div style={{ maxWidth: 262, background: '#95EC69', borderRadius: 9, padding: '10px 12px', fontFamily: FONT.zh, fontWeight: 500, fontSize: 19, color: '#111' }}>
          @晶老六二手车，完全可以
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 7, background: '#4A4A4A', flexShrink: 0 }} />
      </div>
    </div>
  );
};

// 复刻 refs/06-mockup与实录/n1_t015：右侧手机长图滚动 + 左侧侧标
export const PhoneDemo: React.FC = () => {
  return (
    <Bg>
      <SideLabel color="yellow" en="USE CASE" zh="二手车痛点" sub="财富自由团里一个群友" />
      <div style={{ position: 'absolute', right: 200, top: 70 }}>
        <PhoneMockup
          width={400}
          glow="purple"
          header={<ChatHeader />}
          scrollFrom={0}
          scrollTo={-490}
          scrollStart={40}
          scrollFrames={100}
        >
          <FakeChat />
        </PhoneMockup>
      </div>
      <BilingualSub zh="里面有个卖二手车的群友" en="There is a group of friends who sell used cars" />
    </Bg>
  );
};

// 复刻 refs/07-引用与人物卡/n3_t025：政策文档大卡（左出血）+ 整块黄高亮 + 高亮旁中文译条
export const QuoteDocDemo: React.FC = () => {
  return (
    <Bg>
      <SideLabel color="yellow" en="DEFAULT ALLOCATION" zh="这笔钱默认买什么" sub="政策原文" />
      <div style={{ position: 'absolute', left: -36, top: 200 }}>
        <QuoteDoc
          width={1180}
          blocks={[
            { t: 'Eligible Investments', heading: true },
            { t: 'During the period prior to the year in which a Trump Account beneficiary reaches age 18 (what the IRS calls the account\u2019s growth period), the funds in the account must be invested in an eligible investment. Eligible investments, as defined in the law, will include mutual funds or exchange traded funds that' },
            { t: 'must track either the Standard and Poor\u2019s 500 (S&P 500) stock market index or another index tracking the returns of equity investments in \u201Cprimarily United States companies.\u201D', hl: true },
            { t: 'The IRS says it intends to issue regulations that would consider an index \u201Cprimarily\u201D invested in U.S. companies if at least 90% of its value comes from U.S. equities. Qualified indexes do not include sector- or industry-specific index funds.' },
            { t: 'In addition, a qualifying investment must not have annual fees exceeding 0.1% of the balance of investments in the fund, and it may not use leverage. The Secretary of the Treasury has the authority to regulate qualifying investments further.' },
            { t: 'Qualified Withdrawals', heading: true },
            { t: 'Families generally cannot withdraw funds from Trump Accounts before the end of the growth period. After the growth period ends, the withdrawal rules of traditional IRAs apply.' },
          ]}
          zhNote="必须跟踪标普 500（S&P 500）股票市场指数，或另一支「主要为美国企业」股权投资收益的指数。"
          zhNoteYPct={41}
          zhNoteX={44}
          source="IRS · Trump Accounts Guidance · 2026.07"
        />
      </div>
      <BilingualSub zh="那这1,000美元实际上就是默认去买" en="So $1,000 is actually the default purchase" />
    </Bg>
  );
};

// 复刻 refs/07-引用与人物卡/n4_t024：左信息列（真头像+蓝引号+超大红字）+ 右真推文截图卡
export const TweetDemo: React.FC = () => {
  return (
    <Bg>
      <div style={{ position: 'absolute', left: SAFE.stackX, top: 150 }}>
        <TweetCard
          name="Yishan Wong"
          zhIdentity="黄易山 · Reddit 前 CEO"
          avatarSrc={staticFile('assets/yishan-avatar.jpg')}
          headlineTop="App-Layer Startups"
          headlineMain="Crushed"
          headlineColor="red"
          zhSub="被基础模型碾压"
          headlineSub="BY FOUNDATION MODELS"
        />
      </div>
      <div style={{ position: 'absolute', right: 64, top: 200 }}>
        <ShotCard src={staticFile('assets/tweet-musk.jpg')} width={1080} radius={22} enterAt={12} />
      </div>
      <BilingualSub zh="这个观点连马斯克都认同" en="This view even Musk agrees with" />
    </Bg>
  );
};

// 复刻 refs/07-引用与人物卡/n3_t079：真头像人物卡 + 白描边画中画 + 名牌
export const PeopleDemo: React.FC = () => {
  return (
    <Bg>
      <SideLabel color="blue" en="WHO'S PUSHING" zh="背后的推手" sub="除了特朗普，还有他" />
      <div style={{ position: 'absolute', left: SAFE.stackX, top: 220 }}>
        <PersonCard
          name="Donald Trump"
          zhRole="想这么干的人 · 之一"
          avatarSrc={staticFile('assets/trump-avatar.jpg')}
          enterAt={0}
        />
      </div>
      <div style={{ position: 'absolute', left: SAFE.stackX, top: 420, display: 'flex', alignItems: 'flex-end', gap: 28 }}>
        <ShotCard
          src={staticFile('assets/gerstner-pip.jpg')}
          width={380}
          radius={16}
          strokeWidth={2.5}
          stroke="rgba(255,255,255,0.85)"
          enterAt={22}
        />
        <div style={{ paddingBottom: 46, textShadow: '0 2px 12px rgba(0,0,0,0.55)' }}>
          <div style={{ fontFamily: FONT.enTitle, fontWeight: 400, fontSize: 34, color: COLOR.white, letterSpacing: '0.02em' }}>
            BRAD GERSTNER
          </div>
          <div style={{ marginTop: 6, fontFamily: FONT.zh, fontWeight: 700, fontSize: 22, color: COLOR.grey }}>
            硅谷投资人 · INVEST AMERICA 发起人
          </div>
        </div>
      </div>
      <BilingualSub zh="还有硅谷著名的投资人布拉德格斯特纳" en="And the famous Silicon Valley investor Brad Gerstner" />
    </Bg>
  );
};

// 复刻 refs/06-mockup与实录/n1_t015：私信卡堆叠（白卡+旋转+角标 chip）+ 绿色验证 chip
export const DMStackDemo: React.FC = () => {
  return (
    <Bg>
      <SideLabel color="blue" en="INBOUND" zh="后台炸了" sub="一期视频后, 私信就爆了" icon={<Inbox size={24} strokeWidth={2.75} />} />
      <div style={{ position: 'absolute', left: SAFE.stackX, top: 200 }}>
        <Chip icon={<BadgeCheck size={26} strokeWidth={2.5} />} accent="green" outlined segments={[{ t: '真实后台私信' }]} enterAt={0} />
      </div>
      <div style={{ position: 'absolute', left: SAFE.stackX + 20, top: 290 }}>
        <ShotCard
          src={staticFile('assets/dm-video-mock.jpg')}
          width={380}
          radius={26}
          glow="yellow"
          enterAt={0}
        />
      </div>
      <div style={{ position: 'absolute', left: 960, top: 260 }}>
        <DMCardStack
          enterAt={8}
          cards={[
            { chip: { text: '本地部署' }, text: '你好基准片，请问能不能定制本地部署的那种智能体', width: 480 },
            { text: '就是多个智能体交互自动运行的', width: 420 },
            { chip: { text: '房产口播' }, text: '付费房源出文案配图，能不能做成一条龙智能体', width: 460 },
          ]}
        />
      </div>
      <BilingualSub zh="我的后台私信就爆了" en="My private messages exploded" />
    </Bg>
  );
};


// ====== 第三批收尾：mac 窗口墙 / 需求卡片墙 ======

// 打字机文案（DeepSeek 窗口内容）
const TypeWriter: React.FC<{ text: string; startAt?: number; cps?: number }> = ({ text, startAt = 12, cps = 1.4 }) => {
  const frame = useCurrentFrame();
  const n = Math.max(0, Math.floor((frame - startAt) * cps));
  return (
    <div style={{ fontFamily: FONT.zh, fontWeight: 500, fontSize: 24, lineHeight: 1.7, color: '#F2F3F5' }}>
      <div style={{ fontFamily: FONT.zh, fontWeight: 500, fontSize: 18, color: '#8B9098', marginBottom: 14 }}>
        ● 文案生成中…
      </div>
      {text.slice(0, n)}
      <span style={{ opacity: 0.9 }}>▍</span>
    </div>
  );
};

const CODE_LINES: { parts: { t: string; c: string }[] }[] = [
  { parts: [{ t: "import { Agent } from ", c: '#C792EA' }, { t: "'ai-flow'", c: '#C3E88D' }] },
  { parts: [] },
  { parts: [{ t: 'const 口播 = Agent({', c: '#E8EAED' }] },
  { parts: [{ t: 'steps: ', c: '#82AAFF' }, { t: '[写文案, 配音, 剪辑],', c: '#E8EAED' }] },
  { parts: [{ t: 'memory: ', c: '#82AAFF' }, { t: '车源信息,', c: '#E8EAED' }] },
  { parts: [{ t: '})', c: '#E8EAED' }] },
  { parts: [] },
  { parts: [{ t: '口播.run(随手拍的照片)', c: '#C3E88D' }] },
];

const CodeContent: React.FC = () => (
  <div style={{ fontFamily: '"SF Mono", Menlo, monospace', fontSize: 21, lineHeight: 1.75 }}>
    {CODE_LINES.map((l, i) => (
      <div key={i} style={{ display: 'flex', gap: 18 }}>
        <span style={{ color: '#4A505A', width: 22, textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
        <span>
          {l.parts.map((p, j) => (
            <span key={j} style={{ color: p.c }}>{p.t}</span>
          ))}
        </span>
      </div>
    ))}
  </div>
);

// 复刻 refs/04-信息卡与步骤流程/n1_t074：四窗口 2x2 AI 软件卡
export const WindowsDemo: React.FC = () => {
  const W = 864;
  const H = 442;
  return (
    <Bg>
      <div style={{ position: 'absolute', left: 72, top: 36, display: 'grid', gridTemplateColumns: `${W}px ${W}px`, gap: 24 }}>
        <WindowCard title="DeepSeek" icon={<Img src={staticFile('assets/logos/deepseek-color.png')} style={{ width: 26, height: 26, objectFit: 'contain' }} />} chip={{ text: '写作', color: 'blue' }} width={W} height={H}>
          <TypeWriter text="正在为「二手车展厅」生成口播:各位老板看过来,这台 2021 款落地仅 12 万,车况几乎全新,今天直接给到底价,手慢无 ——" />
        </WindowCard>
        <WindowCard title="ChatGPT" icon={<Img src={staticFile('assets/logos/openai-dark.png')} style={{ width: 26, height: 26, objectFit: 'contain' }} />} chip={{ text: '生图', color: 'purple' }} width={W} height={H} enterAt={8}>
          <div style={{ fontFamily: FONT.zh, fontWeight: 500, fontSize: 18, color: '#8B9098', marginBottom: 12 }}>
            /imagine 基准片 × 特朗普 × 乔布斯 · 圆桌会议
          </div>
          <div style={{ position: 'relative' }}>
            <Img src={staticFile('assets/win-roundtable.jpg')} style={{ width: '100%', borderRadius: 10, display: 'block' }} />
            <span style={{ position: 'absolute', top: 12, right: 14, fontFamily: FONT.en, fontWeight: 800, fontSize: 22, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>
              100%
            </span>
          </div>
        </WindowCard>
        <WindowCard title="Seedance 2.0" icon={<Img src={staticFile('assets/logos/bytedance-color.png')} style={{ width: 26, height: 26, objectFit: 'contain' }} />} chip={{ text: '生视频', color: 'yellow' }} width={W} height={H} enterAt={16}>
          <div style={{ fontFamily: FONT.zh, fontWeight: 500, fontSize: 18, color: '#8B9098', marginBottom: 12 }}>
            文生视频 · 安排我跳段社会摇 · 9:16
          </div>
          <div style={{ position: 'relative', width: 180, margin: '0 auto' }}>
            <Img src={staticFile('assets/win-dance.jpg')} style={{ width: '100%', borderRadius: 10, display: 'block' }} />
            <span style={{ position: 'absolute', top: 10, left: 10, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.55)', borderRadius: 6, padding: '3px 10px', fontFamily: FONT.en, fontWeight: 700, fontSize: 15, color: '#fff' }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: '#FF4D4D' }} />
              LIVE
            </span>
          </div>
        </WindowCard>
        <WindowCard title="Claude Code" icon={<Img src={staticFile('assets/logos/claude-color.png')} style={{ width: 26, height: 26, objectFit: 'contain' }} />} chip={{ text: '编程', color: 'green' }} width={W} height={H} enterAt={24}>
          <CodeContent />
        </WindowCard>
      </div>
      <BilingualSub zh="那目前这些功能是" en="The current functions are" />
    </Bg>
  );
};

// 复刻 refs/06-mockup与实录/n1_t181：需求卡片墙 4x6 逐张铺满
export const CardWallDemo: React.FC = () => {
  return (
    <Bg>
      <div style={{ position: 'absolute', left: 85, top: 84 }}>
        <CardWall
          enterAt={0}
          staggerFrames={4}
          items={[
            { name: '王总', text: '能做个口播智能体吗' },
            { name: '李姐', text: '想定制女装详情页' },
            { name: '张工', text: 'ERP 能接智能体吗' },
            { name: '阿强', text: '二手车图能批量出吗' },
            { name: '老陈', text: '帮我做个客服智能体' },
            { name: 'Coco', text: '想要自动回评论的' },
            { name: '老王', text: '装修报价能自动算吗' },
            { name: 'Mike', text: '能本地部署吗' },
            { name: '小敏', text: '餐饮海报智能体' },
            { name: '赵哥', text: '财务对账想自动化' },
            { name: '林姐', text: '教培排课能做吗' },
            { name: '大刘', text: '直播脚本能生成吗' },
            { name: '周总', text: '外贸跟单自动化' },
            { name: '阿杰', text: '建材清单智能体' },
            { name: 'Nina', text: '短视频提文案' },
            { name: '老徐', text: '房产口播能做吗' },
            { name: '美美', text: '美业预约自动回' },
            { name: '陈总', text: '你们能定制智能体吗' },
            { name: 'Leo', text: '想做选品文案' },
            { name: '丽姐', text: '客户管理智能体' },
            { name: '老高', text: 'HR 筛简历能做吗' },
            { name: 'Anna', text: '想要个数字人' },
            { name: '小马', text: '私域运营智能体' },
            { name: '老板', text: '物流单据能自动吗' },
          ]}
        />
      </div>
      <BilingualSub zh="像涉及什么电商外贸电子" en="What kind of e-commerce is involved" />
    </Bg>
  );
};


// ====== 第四批：数据收尾 + 风格件 ======

// 复刻 refs/05-数据可视化/n3_t216：黄色长坡曲线 + BET ON THE LONG RUN
export const CurveDemo: React.FC = () => {
  return (
    <Bg>
      <SideLabel color="yellow" en="DESPITE ALL THIS" zh="顶着争议" sub="还是要推" />
      <div style={{ position: 'absolute', left: SAFE.stackX, top: 200, textShadow: '0 2px 14px rgba(0,0,0,0.6)' }}>
        <div style={{ fontFamily: FONT.enTitle, fontWeight: 400, fontSize: 64, lineHeight: 1.14, color: COLOR.white }}>
          BET ON
          <br />
          THE LONG RUN
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 18 }}>
          <span style={{ fontFamily: FONT.zh, fontWeight: FONT.zhHeavy, fontSize: 40, color: COLOR.yellow }}>押注 10-20 年</span>
          <span style={{ fontFamily: FONT.zh, fontWeight: 700, fontSize: 26, color: COLOR.white }}>科技红利的长坡</span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 110, bottom: 190 }}>
        <CurveOverlay width={1050} height={430} color="yellow" enterAt={20} />
      </div>
      <BilingualSub zh="未来十几二十年的科技红利的长坡了" en="The long slope of the technological dividend" />
    </Bg>
  );
};

// 复刻 refs/08/n4_t244：绿矩阵图标 + 责任型大字 + 蓝信息卡 + 黄结论 chip + 无可替代印章
export const ImmuneDemo: React.FC = () => {
  return (
    <Bg>
      <SideLabel color="green" en="IMMUNE · 02" zh="溶不掉的" sub="智驾这类高风险场景" />
      <div style={{ position: 'absolute', left: SAFE.stackX + 10, top: 210 }}>
        <MatrixIcon color="green" icon={<Scale size={62} strokeWidth={2.2} />} enterAt={0} />
      </div>
      <div style={{ position: 'absolute', left: 470, top: 240 }}>
        <div style={{ fontFamily: FONT.zh, fontWeight: FONT.zhHeavy, fontSize: 92, color: COLOR.white, textShadow: '0 0 34px rgba(255,255,255,0.2), 0 6px 22px rgba(0,0,0,0.7)' }}>责任型</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 10 }}>
          <span style={{ fontFamily: FONT.en, fontWeight: 800, fontSize: SIZE.kicker, letterSpacing: '0.3em', color: COLOR.green }}>
            LIABILITY BEARER
          </span>
          <Chip icon={<UserCheck size={22} strokeWidth={2.5} />} accent="green" outlined segments={[{ t: '有人担责' }]} enterAt={14} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: SAFE.stackX, top: 600 }}>
        <InfoCard icon={<Car size={30} strokeWidth={2.4} />} en="Autonomous Driving" zh="智驾 · 高风险场景" accent="blue" enterAt={28} />
      </div>
      <div style={{ position: 'absolute', left: SAFE.stackX, top: 720 }}>
        <Chip
          icon={<Coins size={24} strokeWidth={2.5} />}
          accent="yellow"
          outlined
          segments={[{ t: '万一出事 ' }, { t: '→ 厂商赔付', color: 'yellow' }]}
          enterAt={42}
        />
      </div>
      <div style={{ position: 'absolute', left: 560, top: 640 }}>
        <Stamp text="无可替代" color="green" enterAt={60} />
      </div>
      <div style={{ position: 'absolute', right: 210, top: 240 }}>
        <BadgeCard
          icon={<Crown size={42} strokeWidth={2.2} />}
          zhTitle="谁担责"
          zhResult="第一梯队"
          enKicker="Tier One"
          accent="yellow"
          enterAt={74}
        />
      </div>
      <BilingualSub zh="谁以后就是智驾的第一梯队" en="Who will be the first echelon of smart driving" />
    </Bg>
  );
};

// 复刻 refs/04/n1_t150：LIVE 三步列表 + 右侧 ChatGPT 实录卡
export const StepsDemo: React.FC = () => {
  return (
    <Bg>
      <SideLabel color="blue" en="LIVE" zh="我直接上手做" sub="听到需求,当场就开干" />
      <div style={{ position: 'absolute', left: SAFE.stackX, top: 200, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 62, height: 62, borderRadius: 14, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Img src={staticFile('assets/logos/openai-light.png')} style={{ width: 42, height: 42, objectFit: 'contain' }} />
        </div>
        <span style={{ fontFamily: FONT.en, fontWeight: 800, fontSize: 40, color: COLOR.white }}>ChatGPT</span>
        <span style={{ fontFamily: FONT.en, fontWeight: 800, fontSize: 30, color: COLOR.blue }}>· image tool</span>
      </div>
      <div style={{ position: 'absolute', left: SAFE.stackX, top: 320 }}>
        <StepList
          accent="blue"
          enterAt={12}
          steps={[
            { icon: <Upload size={26} strokeWidth={2.5} />, text: '把随手拍照片传给它' },
            { icon: <Wand2 size={26} strokeWidth={2.5} />, text: '加上一段提示词' },
            { icon: <SlidersHorizontal size={26} strokeWidth={2.5} />, text: '一两轮微调 → 出图' },
          ]}
        />
      </div>
      <div style={{ position: 'absolute', right: 70, top: 130 }}>
        <ShotCard src={staticFile('assets/chatgpt-cars.jpg')} width={1020} radius={26} glow="purple" enterAt={8} />
      </div>
      <BilingualSub zh="然后再用了一些提示词" en="And then some cue words" />
    </Bg>
  );
};

// 复刻 refs/04/n1_t094：模型对比卡三连
export const CompareDemo: React.FC = () => {
  return (
    <Bg>
      <SideLabel color="blue" en="EACH ITS EDGE" zh="各有所长" sub="举几个例子" />
      <div style={{ position: 'absolute', left: SAFE.stackX, top: 200 }}>
        <CompareCard
          enterAt={0}
          items={[
            { logo: <Img src={staticFile('assets/logos/deepseek-color.png')} style={{ width: 48, height: 48, objectFit: 'contain' }} />, name: 'DeepSeek', weak: '没有图片识别', strong: '写作能力一流', strongColor: 'blue' },
            { logo: <Img src={staticFile('assets/logos/grok-light.png')} style={{ width: 44, height: 44, objectFit: 'contain' }} />, name: 'Grok', weak: '没有本地 Agent', strong: '搜索能力一流', strongColor: 'yellow' },
            { logo: <Img src={staticFile('assets/logos/bytedance-color.png')} style={{ width: 46, height: 46, objectFit: 'contain' }} />, name: '字节 · Seedance 2.0', weak: '其他方面不出彩', strong: '全球都在用 · 文生视频', strongColor: 'green' },
          ]}
        />
      </div>
      <BilingualSub zh="虽然其他方面可能不是那么出彩" en="Although other aspects may not be so outstanding" />
    </Bg>
  );
};

// 复刻 refs/04/n1_t172：打包一次卖给所有同行 + 三节点逻辑链
export const FlowDemo: React.FC = () => {
  return (
    <Bg>
      <SideLabel color="yellow" en="PACKAGE & SELL" zh="打包变现" sub="他不懂 AI,也学不会 —" />
      <div style={{ position: 'absolute', left: SAFE.stackX, top: 200, textShadow: '0 2px 14px rgba(0,0,0,0.6)' }}>
        <div style={{ fontFamily: FONT.zh, fontWeight: FONT.zhHeavy, fontSize: 64, lineHeight: 1.3, color: COLOR.white }}>
          打包一次,
          <br />
          <span style={{ color: COLOR.yellow }}>卖给所有同行</span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: SAFE.stackX, top: 520 }}>
        <FlowChain
          enterAt={10}
          nodes={[
            { icon: <Package size={34} strokeWidth={2.2} />, lines: ['打包成', '易用产品'], accent: 'blue' },
            { icon: <Users size={34} strokeWidth={2.2} />, lines: ['同行都有', '此痛点'], accent: 'yellow' },
            { icon: <Copy size={34} strokeWidth={2.2} />, lines: ['复制 = 变现'], accent: 'green' },
          ]}
        />
      </div>
      <BilingualSub zh="开发的哥们就接下这个活" en="The developer buddies will take this job" />
    </Bg>
  );
};
