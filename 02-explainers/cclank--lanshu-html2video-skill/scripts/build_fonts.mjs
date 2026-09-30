#!/usr/bin/env node
/**
 * Subset the CJK faces down to exactly the characters this storyboard uses.
 *
 * Why this exists: routing Chinese through @remotion/google-fonts means ~101
 * unicode-range subsets x 9 weights, each its own FontFace and its own
 * render-blocking delayRender handle — 200+ network fetches per frame-tab. This
 * replaces all of that with two local woff2 files and zero network at render time.
 *
 * The sources are VARIABLE fonts and pyftsubset preserves the wght axis, so two
 * files cover every weight in the type scale.
 *
 * Usage:
 *   node build_fonts.mjs --storyboard path/to/storyboard.json --out path/to/public/fonts
 *   node build_fonts.mjs --text "任意字符" --out ...
 */

import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { homedir, tmpdir } from "node:os";
import path from "node:path";

const CACHE = path.join(homedir(), ".cache", "html2video", "fonts");

/**
 * Source faces. Variable, SIL OFL, and pinned by URL so every machine subsets
 * from byte-identical input — which is what makes line breaking reproducible.
 * System fonts would differ between macOS versions and quietly change metrics.
 */
const SOURCES = {
  sans: {
    file: "NotoSansSC-VF.otf",
    url: "https://github.com/notofonts/noto-cjk/raw/main/Sans/Variable/OTF/Subset/NotoSansSC-VF.otf",
    out: "h2v-sans.woff2",
    /** Used only to fail with a useful message if a truncated download slips through. */
    minBytes: 8_000_000,
    fallback: "/System/Library/Fonts/Supplemental/Songti.ttc",
  },
  serif: {
    file: "NotoSerifSC-VF.otf",
    url: "https://github.com/notofonts/noto-cjk/raw/main/Serif/Variable/OTF/Subset/NotoSerifSC-VF.otf",
    out: "h2v-serif.woff2",
    minBytes: 8_000_000,
    fallback: "/System/Library/Fonts/Supplemental/Songti.ttc",
  },
};

/**
 * Always included regardless of content, so punctuation, digits and units never
 * fall back mid-line. CJK punctuation is full-width and metrically load-bearing
 * (the hardMax character counts in design.ts assume a 1.000em advance), so a
 * fallback glyph here would break layout, not just look wrong.
 */
const BASE_CHARS = [
  // ASCII printable
  ...Array.from({ length: 0x7e - 0x20 + 1 }, (_, i) => String.fromCodePoint(0x20 + i)),
  // Full-width punctuation and brackets
  ..."，。、；：？！（）「」『』【】《》〈〉“”‘’—…·～％‰℃＋−×÷＝／＜＞",
  // Full-width digits
  ..."０１２３４５６７８９",
  // Arrows and marks used by shots
  ..."↑↓→←↔●○◆◇■□▲▼✓✗№",
] .join("");

const parseArgs = () => {
  const a = process.argv.slice(2);
  const get = (flag) => {
    const i = a.indexOf(flag);
    return i >= 0 ? a[i + 1] : undefined;
  };
  return {
    storyboard: get("--storyboard"),
    text: get("--text"),
    out: get("--out"),
    quiet: a.includes("--quiet"),
  };
};

/** Every string value anywhere in the storyboard, so nothing on screen is missed. */
const collectStrings = (node, acc = []) => {
  if (typeof node === "string") acc.push(node);
  else if (Array.isArray(node)) node.forEach((n) => collectStrings(n, acc));
  else if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      // Paths and URLs are never rendered as text; including them would bloat the
      // subset with Latin we already cover via BASE_CHARS.
      if (k === "src" || k === "sourceUrl" || k === "bed" || k === "voiceDir") continue;
      collectStrings(v, acc);
    }
  }
  return acc;
};

const ensureSource = (key, quiet) => {
  const s = SOURCES[key];
  const dest = path.join(CACHE, s.file);
  mkdirSync(CACHE, { recursive: true });

  if (existsSync(dest) && statSync(dest).size >= s.minBytes) return dest;

  if (existsSync(dest)) {
    if (!quiet) {
      console.warn(
        `  cached ${s.file} is ${statSync(dest).size}B, below the ${s.minBytes}B floor — ` +
          `treating as a truncated download and refetching`,
      );
    }
  }

  if (!quiet) console.log(`  fetching ${s.file} (one time, ~15-25MB)…`);
  try {
    // -C - resumes a partial file; --retry-all-errors because a dropped CJK
    // download is common and silently produces an unparseable font.
    execFileSync(
      "curl",
      ["-sL", "--retry", "4", "--retry-all-errors", "-m", "900", "-C", "-", s.url, "-o", dest],
      { stdio: "inherit" },
    );
  } catch {
    /* fall through to the size check below */
  }

  if (existsSync(dest) && statSync(dest).size >= s.minBytes) return dest;

  if (s.fallback && existsSync(s.fallback)) {
    console.warn(
      `  could not fetch ${s.file}; falling back to the system font ${path.basename(s.fallback)}.\n` +
        `  NOTE: system fonts differ between macOS versions, so text metrics — and therefore line\n` +
        `  breaks — are no longer guaranteed identical on another machine.`,
    );
    return s.fallback;
  }

  throw new Error(
    `no usable source for the "${key}" face: ${s.url} could not be fetched and no system fallback exists.`,
  );
};

const subset = (srcPath, outPath, charsFile, quiet) => {
  const args = [
    srcPath,
    `--text-file=${charsFile}`,
    // vert/vrt2/palt/halt matter for CJK even in horizontal setting; kern/liga
    // for the Latin runs mixed into Chinese sentences.
    "--layout-features=kern,liga,palt,halt,vert,vrt2",
    "--flavor=woff2",
    "--no-hinting",
    "--output-file=" + outPath,
  ];
  if (srcPath.endsWith(".ttc")) args.push("--font-number=0");

  const res = execFileSync("pyftsubset", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  if (!quiet && res.trim()) {
    // The only expected warning is the `meta` table being dropped, which is fine.
    const lines = res.split("\n").filter((l) => l.trim() && !/meta NOT subset/.test(l));
    lines.forEach((l) => console.warn(`    ${l}`));
  }
};

const main = () => {
  const { storyboard, text, out, quiet } = parseArgs();
  if (!out) {
    console.error("--out <dir> is required");
    process.exit(2);
  }

  let content = "";
  if (storyboard) {
    const sb = JSON.parse(readFileSync(storyboard, "utf8"));
    content = collectStrings(sb).join("");
  } else if (text) {
    content = text;
  } else {
    console.error("one of --storyboard or --text is required");
    process.exit(2);
  }

  const chars = [...new Set(Array.from(BASE_CHARS + content))]
    .filter((c) => c !== "\n" && c !== "\r")
    .sort()
    .join("");

  mkdirSync(out, { recursive: true });
  const charsFile = path.join(tmpdir(), `h2v-chars-${process.pid}.txt`);
  writeFileSync(charsFile, chars, "utf8");

  if (!quiet) {
    const cjk = Array.from(chars).filter((c) => c.codePointAt(0) > 0x2e80).length;
    console.log(`html2video fonts: ${chars.length} unique codepoints (${cjk} CJK)`);
  }

  const report = [];
  for (const key of Object.keys(SOURCES)) {
    const src = ensureSource(key, quiet);
    const outPath = path.join(out, SOURCES[key].out);
    subset(src, outPath, charsFile, quiet);
    report.push({ face: key, file: SOURCES[key].out, kb: (statSync(outPath).size / 1024).toFixed(1) });
  }

  if (!quiet) {
    for (const r of report) {
      console.log(`  ${r.file.padEnd(20)} ${r.kb.padStart(7)} KB   (${r.face})`);
    }
    const total = report.reduce((a, r) => a + Number(r.kb), 0);
    console.log(`  total ${total.toFixed(1)} KB — versus ~36 MB for the full faces`);
  }
};

main();
