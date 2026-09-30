/**
 * Spoken duration of Chinese narration, estimated from text.
 *
 * Needed because 口播 mode ships a script rather than audio: the video has to be
 * cut to the length the words will actually take, or the script is useless to
 * record against. With no waveform to measure, the estimate has to be good enough
 * that a speaker reading at a normal pace lands inside the scene.
 *
 * The estimate counts SYLLABLES, not characters, and that distinction is the whole
 * point. Mandarin is delivered at a fairly stable syllable rate, and the mapping
 * from written characters to syllables is not 1:1 for exactly the material this
 * pipeline favours — numbers and Latin technical terms:
 *
 *     "26%"        3 chars  →  百分之二十六        6 syllables
 *     "1 Tbps"     6 chars  →  一 T-b-p-s ≈        4-5 syllables
 *     "SWE-bench"  9 chars  →  ≈                   5 syllables
 *
 * A character count underestimates a data-heavy script badly, which would cut
 * every stat scene short. Hence the expansions below.
 *
 * Accuracy is roughly ±15%. That is fine for laying out scenes — `holdOut` absorbs
 * the slack — but the generated script prints the assumed rate so a speaker who
 * runs fast or slow can re-render with a different one.
 */

/** Syllables per second. ~258 characters/minute, a normal explainer pace. */
export const DEFAULT_SPEECH_SPS = 4.3;

/** Breath and punctuation pauses, in seconds. */
const PAUSE: Record<string, number> = {
  "，": 0.18,
  "、": 0.15,
  "；": 0.28,
  "：": 0.24,
  "。": 0.4,
  "！": 0.4,
  "？": 0.42,
  "…": 0.35,
  "—": 0.2,
  ",": 0.18,
  ".": 0.4,
  "!": 0.4,
  "?": 0.42,
  ";": 0.28,
  ":": 0.24,
  "\n": 0.35,
};

const isCJK = (cp: number) =>
  (cp >= 0x4e00 && cp <= 0x9fff) || // unified ideographs
  (cp >= 0x3400 && cp <= 0x4dbf) ||
  (cp >= 0xf900 && cp <= 0xfaff);

/**
 * Syllable count. Digit runs expand irregularly in Mandarin — 26 is 三 syllables
 * (二十六) but 2026 read as a year is 四 (二零二六) and as a quantity is 七
 * (两千零二十六). `n + floor(n/2)` sits between those readings, which is the best
 * a text-only estimate can honestly do.
 */
export const syllables = (text: string): number => {
  let total = 0;
  let digits = 0;
  let latin = 0;

  const flushDigits = () => {
    if (digits) {
      total += digits + Math.floor(digits / 2);
      digits = 0;
    }
  };
  const flushLatin = () => {
    if (latin) {
      // Read as a word or spelled out; either way roughly half its length.
      total += Math.max(1, Math.ceil(latin / 2));
      latin = 0;
    }
  };

  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    if (ch >= "0" && ch <= "9") {
      flushLatin();
      digits++;
      continue;
    }
    if (/[A-Za-zÀ-ɏ]/.test(ch)) {
      flushDigits();
      latin++;
      continue;
    }
    flushDigits();
    flushLatin();

    if (isCJK(cp)) {
      total += 1;
    } else if (ch === "%" || ch === "％") {
      total += 3; // 百分之
    } else if (ch === "×") {
      total += 1; // 倍 / 乘
    } else if (ch === "~" || ch === "～" || ch === "-" || ch === "—") {
      total += 1; // 到
    }
    // Punctuation and whitespace contribute pause time, not syllables.
  }
  flushDigits();
  flushLatin();
  return total;
};

/** Total pause time contributed by punctuation and line breaks. */
export const pauseSeconds = (text: string): number => {
  let s = 0;
  for (const ch of text) s += PAUSE[ch] ?? 0;
  return s;
};

/**
 * Spoken length of one narration line, in seconds.
 *
 * `leadIn` is the beat before speech starts, so a scene does not open on a voice
 * already mid-sentence.
 */
export const estimateSpeechSeconds = (
  text: string,
  sps: number = DEFAULT_SPEECH_SPS,
  leadIn = 0.35,
): number => {
  const clean = text.trim();
  if (!clean) return 0;
  return leadIn + syllables(clean) / sps + pauseSeconds(clean);
};

/** Characters per minute implied by a syllable rate, for reporting to a speaker. */
export const charsPerMinute = (sps: number = DEFAULT_SPEECH_SPS): number =>
  Math.round(sps * 60);
