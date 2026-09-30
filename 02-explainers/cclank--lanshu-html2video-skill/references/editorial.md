# READ: deciding what belongs on screen

This is the stage with no script, and the one that decides whether the video is
worth watching. Everything downstream is execution.

The method below builds on the local `baoyu-slide-deck` skill's analysis
framework and content rules, adapted for a timeline rather than a deck.

## Start from the figures, not the prose

On a research or engineering page, a `<figcaption>` is a finding compressed into
one sentence, with its illustration already attached. The author did the hardest
editorial work for you. Naive extractors drop captions as decoration; this
pipeline carries them through, and they are usually the shortest path to a good
video.

So read `harvest.json`'s `figures[]` first, and only then the prose. A figure plus
its caption is already a shot.

**But check `captionSource` before you believe a caption.** Only `figcaption` is
authoritative — it came from the page's own `<figure>` markup. `proximity` means the
text merely followed the image, and it is wrong more often than not: on one real
article all three proximity captions were ordinary body prose, and one of them
described the *next* chart. `none` means the page gave nothing at all, which is
common — plenty of sites wrap images in `<figure>` with no caption.

When it is `proximity` or `none`, **open the image and read the finding off it.** A
chart's own embedded title is usually the best single sentence available; re-author
that as a Chinese headline and keep the English in `asset.sourceCaption`. Treating an
unverified caption as a finding is the one way this stage can produce something
confidently wrong.

## Find what the article half-buries

This is the part that separates the output from every automated blog-to-video
tool, and it is worth being deliberate about. Those tools optimise for coverage
and end up producing marketing. Go looking for:

- **The limitation the author admits.** Real work states what it cannot do. The
  reference article's own caption says "NLAs can hallucinate. For instance, here
  an NLA claims the context contained phrases like 'Wearing my white jacket' when
  it did not." That is the most persuasive material on the page, precisely because
  nobody promoting the work would lead with it. Promote it to act three.
- **The number that contradicts expectation.** Not the biggest number — the one
  that reframes. "26% on SWE-bench versus under 1% in real usage" is a story; "26%"
  alone is a statistic.
- **The one concrete example that makes it click.** A model planning to end a
  couplet on "rabbit" teaches more than a paragraph defining activations.
- **The mechanism, once.** Readers forgive not knowing how something works, but a
  video that never shows the mechanism feels like an advert.

If a page has none of these, it may not be worth a video. Say so rather than
producing filler.

## The spine

**Core message, 40 Chinese characters or fewer.** If the viewer remembers one
sentence, this is it. Write it before anything else; it becomes the outro.

**Three to five supporting points, ordered by audience relevance — not by where
they appear in the article.** Source order optimises for a reader who will finish;
a video has to earn each next second. Reordering is the single highest-leverage
editorial move available, and the reference board uses it: the hallucination
caption sits mid-article and becomes the third-act turn.

**Pick an arc** and put it in `meta.arc`:

| Arc | Fits |
|---|---|
| `problem-solution` | a new tool or method |
| `situation-complication-resolution` | an incident, a debugging story |
| `what-why-how` | teaching a concept |
| `past-present-future` | a shift over time |
| `claim-evidence-implication` | research results |

## Triage everything

Four buckets, and be willing to use the fourth:

- **Keep** — the core argument, unique data, a quotable sentence, an admitted limitation
- **Simplify** — technical detail becomes a visual summary; five examples become the best one
- **Visualise** — a table becomes a stat; a process becomes a diagram walk; a comparison becomes a split
- **Omit** — tangential background, redundant examples, related-content blocks, anything the audience already knows

A 95-second video from a 10,000-character article keeps maybe 8% of the words. The
discipline is in the omitting.

## Write for the frame, not the page

**Narrative headlines.** A headline should make a claim, not label a section.

| Weak | Strong |
|---|---|
| 评测结果 | 26% 的题目它知道自己在被测 |
| 方法介绍 | 一个负责说，一个负责猜 |
| 局限性 | NLA 也会编造 |

**Never use these** — they mark generated copy and add nothing:

深入探讨 · 让我们看看 · 带你了解 · 一探究竟 · 惊艳 · 革命性 · 颠覆 · 赋能 ·
总而言之 · 综上所述 · dive into · explore · journey · in conclusion

**One idea per frame.** If there is more to say it is another scene. Crowding is
solved with time, not with a smaller font.

**Translate, don't machine-translate.** Chinese lines have to land as Chinese. A
faithful rendering of an English sentence is usually a bad Chinese headline —
tighten it until it reads like it was written that way. Keep technical terms in
their original form (NLA, SWE-bench, Opus 4.6); translating them costs precision
and looks unserious. Keep the original figcaption in `asset.sourceCaption` for
provenance regardless.

## Map content to shots

| Content | Shot |
|---|---|
| Opening, the subject and its source | `title` |
| A single claim with nothing to compete | `statement` |
| One number that reframes | `stat` |
| A sentence worth quoting verbatim | `quote` |
| A finding plus its figure | `figure` |
| Two states of one thing | `compare` |
| A mechanism with sequential parts | `diagram` |
| The limitation, the "but" | `caveat` |
| Three or four takeaways | `ladder` |
| The core message, and credit | `outro` |

Vary the shape. Four `figure` shots in a row read as a slideshow no matter how
good each one is. Alternate figure-led and text-led scenes, and let the `caveat`
inversion land as the structural break it is.

Aim for 8 to 11 scenes at 85 to 100 seconds. Fewer than 6 feels thin; more than 12
means the article should be two videos.

## Then check yourself

Before writing the storyboard, answer these:

1. Does the first scene give a reason to watch the second?
2. Is there a moment a viewer would screenshot?
3. Does anything appear on screen that the audience already knew?
4. Would the frame still make sense if seen for less than one second?
5. Is the most persuasive fact on the page actually in the video?

Question 5 is the one that usually fails.
