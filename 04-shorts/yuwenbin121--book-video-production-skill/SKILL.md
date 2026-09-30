---
name: book-video-production
description: Research, script, storyboard, illustrate, cover-design, voice, caption, score, build, inspect, and render fact-based Chinese book short videos for Douyin, Xiaohongshu, TikTok, or other vertical platforms. Use when Codex is asked to create or reproduce a book-review, book-introduction, knowledge, or reading-account video; turn a book, reference video, narration, transcript, images, or MP4 into a vertical social video; choose book-specific vintage scenery or cartoon illustrations; create a publishing cover; add restrained background music; or establish a reusable HyperFrames or Remotion production pipeline.
---

# Book Video Production

Produce a reviewable video package first, then render only after factual, editorial, timing, and visual gates pass. Treat Codex as the coordinator and the user as final editor.

## Establish the brief

Resolve from the request or infer conservative defaults:

- platform, duration, aspect ratio, language, audience, goal, and cover requirements;
- book edition, author, cover, and allowed source material;
- reference video or desired visual and vocal qualities;
- desired deliverable: research, narration, storyboard, preview, final MP4, or reusable template.

Use defaults of 30 seconds, 9:16, Chinese, knowledge-oriented book introduction, a separate publishing cover, quiet supporting music, and 4–6 scenes when unspecified. For Douyin, use 1080×1920 at 30 fps unless the user supplies another specification. Record assumptions and continue unless a missing choice would materially change the result.

Create a production manifest using `references/production-schema.md`. Update it as decisions and asset paths become known.

## Select the production route

- Prefer HyperFrames for editorial typography, explainers, data motion, HTML/CSS layouts, and rapid visual iteration. Read and use the installed `hyperframes:hyperframes` and `hyperframes:hyperframes-cli` skills before authoring or invoking the CLI.
- Prefer Remotion for React-based reusable series, strong data-driven templating, or repeated batch rendering. Read and use `remotion:remotion-best-practices` before writing Remotion code.
- If the user explicitly chooses a route, honor it.
- Do not install tools or plugins unless the user requests installation. If a required capability is unavailable, report the exact missing dependency and continue with upstream deliverables where possible.

## Analyze references

When a reference video is supplied:

1. Inspect duration, dimensions, frame rate, audio, and scene changes with available media tools.
2. Sample frames across the timeline and transcribe the audio when possible.
3. Extract reusable structural traits: hook timing, information density, scene rhythm, image treatment, cover language, caption behavior, transitions, music role, and vocal qualities.
4. Separate general techniques from protected expression. Reproduce pacing and design principles, not distinctive wording, artwork, branding, or a creator’s exact voice.

Create a reference-style report before building. Include timestamps, representative frames, palette, typography, image categories, caption zones, transition vocabulary, music mood and approximate speech-to-music balance. Treat the report as a design constraint, not permission to copy protected assets.

When the user asks for a quiet, premium literary treatment based on full-screen scenery and restrained captions, read `references/premium-literary-style.md` and adapt it to the specific book.

If no reference video exists, use a restrained editorial knowledge-video structure.

## Research the book

Browse when the user requests research or when current or precise source attribution matters. Prefer:

1. publisher, author, official edition, or library records;
2. the supplied book text, notes, or licensed excerpts;
3. reputable interviews and established reviews;
4. reader comments and highlights only as attributed audience signals.

For WeRead or another private service, use its connector only if available and authorized. Otherwise ask for exported highlights or omit that evidence. Never imply access that did not occur.

Maintain an evidence table with claim, source, confidence, and intended use. Clearly distinguish:

- verified bibliographic facts;
- paraphrased ideas from the book;
- attributed reviewer or reader opinions;
- the scriptwriter’s interpretation.

Do not invent quotations, page numbers, popularity, awards, reviews, or reader highlights. Use short quotations only when necessary and permitted.

## Write and approve narration

Write narration before building visuals. Read `references/editorial-style.md` and follow its drafting and audit rules.

Structure a typical 30-second script as:

1. a concrete curiosity or tension in the first 1–3 seconds;
2. immediate identification of the book;
3. one or two specific ideas or observations;
4. a grounded reason the idea matters;
5. a natural closing thought or light call to action.

Estimate duration from the intended delivery rate, then revise to fit. Preserve breathing room. Label any uncertain claim instead of smoothing it into certainty.

Deliver the narration with an evidence table and an editorial audit. Do not begin expensive rendering before the script is approved when the user is actively reviewing the project.

## Generate and finish voice

Use the user’s preferred TTS provider when available. Chinese pronunciation accuracy takes priority over timbre. Keep the raw generation and processed master separate.

When given a reference voice, analyze transferable acoustic properties such as pace, pauses, pitch range, loudness, EQ balance, compression, and room tone. Do not claim to clone a person’s identity or promise an exact match.

Apply only measured processing needed for clarity and tone. Check clipping, noise, intelligibility, pronunciation, and final loudness. If the user supplies an MP4 containing narration, extract the audio losslessly where possible.

Treat the final processed narration as the timing source of truth.

## Transcribe and storyboard

Transcribe the final narration rather than guessing subtitle timing. Use word- or phrase-level timestamps when the available transcriber supports them.

Build 4–6 scenes around semantic beats. For every scene specify:

- exact start and end;
- matching narration phrase;
- visual purpose and composition;
- on-screen copy and highlighted keyword;
- asset source;
- animation and transition;
- caption-safe region.

Do not place a visual cut merely at a fixed interval; align it to meaning, emphasis, or pause. Keep the cover readable and avoid turning every spoken sentence into duplicate on-screen prose.

## Design the cover and source visuals

Read `references/visual-assets-and-cover.md`. Produce a separate 9:16 publishing cover in addition to the video opening frame.

Derive the visual world from the individual book rather than applying one fixed aesthetic. Select among archival or vintage scenery, period objects, documentary textures, maps, symbolic still life, painterly illustrations, or cartoon images according to genre, setting, era, emotional register, and audience.

Build an asset plan mapping each visual to a narration beat and source. Prefer user-owned, public-domain, properly licensed, or newly generated assets. Do not use a published book cover, film/TV still, illustrator’s recognizable style, or copyrighted character unless authorized. If generating images, keep characters, palette, era, and aspect ratio consistent across scenes.

Make the cover readable at phone-thumbnail size. Include the book title as the primary text, one short curiosity line or emotional promise, and a clear focal image. Avoid misleading clickbait, dense synopsis text, and platform UI collision.

## Add restrained background music

Read `references/music-mix.md`. Choose or generate music only after the narration’s emotional arc is known.

Use a light, slow supporting bed by default. Keep speech clearly dominant; use the music to establish atmosphere and bridge pauses, not to create a second focal point. Duck music under narration, fade cleanly at both ends, and verify the final mix for clipping, intelligibility, and sudden loudness changes.

## Build the composition

Create a deterministic project with local or properly licensed assets. Keep content data separate from the visual template so another book can reuse the composition.

For HyperFrames:

- author valid scene elements with correct `data-start`, `data-duration`, and `data-track-index`;
- derive timing from the transcript and final audio duration;
- lint, inspect, and preview with the HyperFrames CLI skill;
- verify the exact installed CLI syntax rather than guessing flags.

For Remotion:

- store book metadata, scenes, captions, and assets in typed data;
- derive duration and sequences from timestamps;
- follow the installed Remotion skill for current APIs, animation, media, and rendering.

Use licensed fonts that contain all required Chinese glyphs. Keep critical content inside platform-safe margins.

## Preview, inspect, and repair

Read `references/quality-gates.md`. Complete all relevant gates:

1. factual and editorial;
2. audio and pronunciation;
3. timing and caption synchronization;
4. layout and typography;
5. motion and continuity;
6. technical output.

Inspect representative frames at scene starts, middles, transitions, and caption-dense moments. Frame inspection verifies visuals; use waveform or transcript alignment to verify speech synchronization.

Repair issues, regenerate the preview, and repeat inspection. Do not describe a preview as validated until the checks were actually run.

## Render and hand off

Render MP4 only after validation. Confirm duration, resolution, aspect ratio, frame rate, audio stream, and playback.

Deliver:

- final MP4 or the furthest completed artifact;
- separate publishing cover image;
- approved narration and evidence table;
- transcript/captions;
- storyboard and production manifest;
- asset and music source record;
- reusable source/template;
- concise validation results and any unresolved limitations.

State which steps were automated, which sources were used, and which decisions still require human judgment.
