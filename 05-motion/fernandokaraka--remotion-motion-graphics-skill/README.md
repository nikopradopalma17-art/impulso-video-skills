# Remotion Motion Graphics — a Claude Code skill

Turn Claude Code into a motion-graphics studio. This skill teaches Claude to build
animated graphics as real video with [Remotion](https://www.remotion.dev) — title cards,
lower thirds, logo stings, badges, stat reveals, countdowns, end screens, social reels —
and to export them as MP4 or as **transparent** ProRes / PNG sequences you can drop
straight into Premiere, Final Cut, CapCut, DaVinci or After Effects.

No motion-design software required. You describe what you want in plain language; Claude
writes the React components that render it.

## Why this exists

Modern Claude already writes decent motion code unprompted — springs, staggered
entrances, clean enter/exit, zod-schema props. We benchmarked it: with the craft rules
alone, the skill scored *identically* to no skill at all. So this skill spends its budget
on the three things that don't come for free:

- **Diagnosing before decorating.** "It feels flat" is often a real bug. A stat callout
  that "counts up and just sits there" turned out to have an unclamped `interpolate` —
  the number never landed on its target, it climbed to 30.793 instead of 12.400. Adding
  a bouncier entrance would have shipped a beautiful graphic showing a false number.
- **Verifying.** Check a still at the key frames before burning minutes on a render, and
  actually look at the image.
- **The silent traps.** A `backgroundColor` on the root kills your alpha channel with no
  warning. `remotion.config.ts` defaults to JPEG, which has no alpha. A hook inside
  `.map()` breaks the first time someone edits text in the Studio. `scaleX` on a panel
  stretches the text inside it. These look fine in the source and nothing throws.

The craft rules are still in there — as a checklist, not a lecture.

## Install

**Claude Code** — clone into your skills directory:

```bash
git clone https://github.com/fernandokaraka/remotion-motion-graphics-skill.git
cp -r remotion-motion-graphics-skill/skills/remotion-motion-graphics ~/.claude/skills/
```

Or, to scope it to a single project, copy it into `<your-project>/.claude/skills/` instead.

Restart Claude Code and the skill will be picked up automatically. It triggers on its
own whenever you ask for motion graphics, video overlays, or animation work — you don't
have to invoke it by name.

## Use

Just ask, in whatever words are natural:

- *"empty folder here — set me up so I can make overlays for my YouTube channel, needs transparent export for Premiere"*
- *"make a lower third for the podcast: name on top, role underneath, sliding in from the left, about 6 seconds"*
- *"this stat callout is flat, the number counts up and just sits there — make it look professional"*
- *"export that badge as a transparent .mov so I can put it over my footage"*

The skill decides whether it's scaffolding a project, building a new graphic, or doing a
polish pass, and proceeds accordingly.

## What's inside

```
skills/remotion-motion-graphics/
├── SKILL.md              diagnose-first workflow + craft checklist
└── references/
    ├── traps.md          silent failures — read before writing animation code
    ├── patterns.md       working code: enter/exit, spring, stagger, alpha, audio, fonts
    ├── polish.md         upgrade passes for a graphic that feels flat, by leverage
    └── scaffold.md       creating a Remotion project from scratch
```

## Export commands it sets up

```bash
# Full scene → MP4
npx remotion render <CompId> out/<name>.mp4 --codec=h264 --crf=18

# Overlay with real alpha → Premiere / FCP / DaVinci / AE
npx remotion render <CompId> out/<name>.mov --codec=prores \
  --prores-profile=4444 --pixel-format=yuva444p10le --image-format=png

# Overlay → PNG sequence (CapCut and friends)
npx remotion render <CompId> out/<name>/frame-%04d.png --image-format=png

# Check one frame before committing to a full render
npx remotion still <CompId> out/check.png --frame=45
```

## Credit

The craft principles here are adapted from **"Claude Code × Remotion — The Motion-Graphics
Starter Kit"** by [Pouya Eti](https://youtube.com/@pouyaeti), brought to you by
[Rangy AI](https://rangy.ai). That guide is a two-part prompt collection; this skill turns
it into something Claude reaches for on its own, with the Remotion API patterns filled in.

Built with [skill-creator](https://github.com/anthropics/claude-plugins-official).

## License

MIT — see [LICENSE](LICENSE).
