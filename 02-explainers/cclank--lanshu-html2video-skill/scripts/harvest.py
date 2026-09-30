#!/usr/bin/env python3
"""
HARVEST: a URL becomes structured content plus full-resolution assets.

Two things here are not obvious and are the reason this script exists rather than
just calling a fetcher:

1. Image proxies silently degrade the assets. Next.js sites serve
   `/_next/image?url=<original>&w=3840&q=75`, and a fetcher that follows the
   rendered <img src> gets the PROXIED file. Measured on the reference article:
   a 4620x1410 source came back as 3840x1172 AND palette-quantised to 256
   colours. This pipeline's whole premise is that figures have spare pixels to
   push into, so we decode the `url=` parameter and pull the ORIGINAL instead.

2. Captions are primary content, not decoration. On a research page a
   <figcaption> is a finding compressed to one sentence, with its illustration
   already attached — the densest editorial material available. So captions are
   paired to their figure and carried through explicitly.

Stdlib only. Shells out to: bun (baoyu-fetch), sips (macOS, image dimensions),
and optionally agent-browser for design tokens.

Usage:
  python3 harvest.py --url URL --out DIR [--skip-tokens] [--cdp-url URL]
"""

import argparse
import hashlib
import html as html_mod
import json
import os
import re
import shutil
import subprocess
import sys
import urllib.parse
import urllib.request
from pathlib import Path

BAOYU_FETCH = Path.home() / ".agents/skills/baoyu-url-to-markdown/scripts/vendor/baoyu-fetch/src/cli.ts"

UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
)

# Headings that are site furniture rather than article structure. Measured on the
# reference article, 9 of 12 h3s were nav like this.
NOISE_HEADING = re.compile(
    r"^(related content|products|models|solutions|claude platform|resources|programs|"
    r"help and security|company|terms and policies|learn|news|policy|commitments|"
    r"sign up|subscribe|share this|footer)\b",
    re.I,
)


def run(cmd, **kw):
    return subprocess.run(cmd, check=True, capture_output=True, text=True, **kw)


def fetch_article(url: str, out: Path, cdp_url: str | None) -> dict:
    """Structure and text via baoyu-fetch (Defuddle, with Readability fallback)."""
    if not BAOYU_FETCH.exists():
        sys.exit(f"baoyu-fetch not found at {BAOYU_FETCH}")
    if not shutil.which("bun"):
        sys.exit("bun is required to run baoyu-fetch")

    article_json = out / "article.json"
    cmd = [
        "bun", str(BAOYU_FETCH), url,
        "--format", "json",
        "--output", str(article_json),
        "--download-media",
        # page.html lands here and is what figcaptions_from_html() reads. Without
        # it, captions can only be guessed by proximity.
        "--debug-dir", str(out / "debug"),
    ]
    cmd += ["--cdp-url", cdp_url] if cdp_url else ["--headless"]

    print(f"  fetching {url}")
    try:
        run(cmd, cwd=str(out))
    except subprocess.CalledProcessError as e:
        sys.exit(f"baoyu-fetch failed:\n{e.stderr[-2000:]}")

    data = json.loads(article_json.read_text(encoding="utf-8"))

    # The quality heuristics from the smart-fetch skill, applied to the result:
    # a page that yields almost no prose has been blocked or is JS-only, and it is
    # better to say so than to produce a four-word video.
    md = data.get("markdown", "") or ""
    if len(md) < 500:
        sys.exit(
            f"only {len(md)} characters extracted — the page is probably JS-rendered or "
            f"bot-blocked. Retry with --cdp-url http://localhost:9222 to reuse a logged-in Chrome."
        )
    return data


def original_url(u: str) -> str:
    """
    Undo an image proxy. Next.js, Cloudinary, imgix and friends all put the real
    source in a query parameter; returning that gets us the undegraded original.
    """
    parsed = urllib.parse.urlparse(u)
    if "/_next/image" in parsed.path or parsed.path.endswith("/image"):
        qs = urllib.parse.parse_qs(parsed.query)
        for key in ("url", "src", "image"):
            if key in qs and qs[key][0]:
                inner = urllib.parse.unquote(qs[key][0])
                if inner.startswith("http"):
                    return inner
    return u


def dimensions(path: Path) -> tuple[int, int] | None:
    """Pixel size via macOS sips, which handles png/jpeg/webp uniformly."""
    if not shutil.which("sips"):
        return None
    try:
        r = run(["sips", "-g", "pixelWidth", "-g", "pixelHeight", str(path)])
    except subprocess.CalledProcessError:
        return None
    w = h = None
    for line in r.stdout.splitlines():
        line = line.strip()
        if line.startswith("pixelWidth:"):
            w = int(line.split(":")[1])
        elif line.startswith("pixelHeight:"):
            h = int(line.split(":")[1])
    return (w, h) if w and h else None


def download(url: str, dest: Path) -> bool:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=60) as r, open(dest, "wb") as f:
            shutil.copyfileobj(r, f)
        return dest.stat().st_size > 1024
    except Exception as e:
        print(f"    ! {url[:80]}: {e}")
        return False


def figcaptions_from_html(html: str) -> dict[str, str]:
    """
    Authoritative image → caption pairing, taken from the page's own <figure>
    structure and keyed by a distinctive fragment of the image URL.

    Necessary because the markdown fallback below is only proximity-based, and
    proximity lies. Measured on a real page: 7 of 10 figures had no caption at all
    and the other 3 picked up the following BODY paragraph — one of them describing
    the *next* chart. A caption attached to the wrong figure is worse than a missing
    one, because it looks authoritative and the editorial stage is built on trusting
    captions.
    """
    out: dict[str, str] = {}
    for m in re.finditer(r"<figure\b[^>]*>(.*?)</figure>", html, re.S | re.I):
        block = m.group(1)
        cap_m = re.search(r"<figcaption\b[^>]*>(.*?)</figcaption>", block, re.S | re.I)
        if not cap_m:
            continue
        caption = html_mod.unescape(re.sub(r"<[^>]+>", " ", cap_m.group(1)))
        caption = re.sub(r"\s+", " ", caption).strip()
        if not caption:
            continue
        for img_m in re.finditer(r"<img\b[^>]*\bsrc=[\"']([^\"']+)[\"']", block, re.I):
            key = caption_key(original_url(html_mod.unescape(img_m.group(1))))
            if key:
                out[key] = caption
    return out


def caption_key(url: str) -> str:
    """
    A stable, distinctive slice of an image URL for cross-referencing.

    Uses the filename stem, which survives the proxy-unwrapping and the CDN query
    strings. Data URIs get a hash of their leading bytes instead, since they have
    no filename — that is enough to tell two inline charts apart.
    """
    if url.startswith("data:"):
        # hashlib, not hash(): Python randomises string hashing per process, so a
        # built-in hash would only be consistent within one run.
        return "data:" + hashlib.md5(url[:512].encode()).hexdigest()[:16]
    stem = os.path.basename(urllib.parse.urlparse(url).path)
    return os.path.splitext(stem)[0][:48]


def parse_figures(markdown: str) -> list[dict]:
    """
    Fallback pairing: each image with the paragraph that follows it.

    Defuddle flattens `<figure>`/`<figcaption>` to `![](url)`, a blank line, then
    the caption text — so proximity works when the page really uses figcaptions.
    It does NOT work on pages that just place images between paragraphs, which is
    why figcaptions_from_html() takes precedence and why anything found only by
    proximity is flagged as such.
    """
    lines = markdown.split("\n")
    figs = []
    img_re = re.compile(r"^!\[([^\]]*)\]\(([^)]+)\)\s*$")

    for i, line in enumerate(lines):
        m = img_re.match(line.strip())
        if not m:
            continue
        alt, src = m.group(1), m.group(2)
        caption = ""
        for j in range(i + 1, min(i + 4, len(lines))):
            nxt = lines[j].strip()
            if not nxt:
                continue
            if nxt.startswith(("#", "-", "*", "!", ">", "|")):
                break
            caption = nxt
            break
        figs.append({"alt": alt, "src": src, "caption": caption, "line": i})
    return figs


def harvest_tokens(url: str, out: Path, cdp_url: str | None) -> dict | None:
    """
    Design tokens from a real browser.

    Necessary rather than nice-to-have: on the reference article neither the CSS
    custom properties nor the font-family appear anywhere in the static HTML, so
    regex over the source returns nothing. Only getComputedStyle sees them.
    """
    if not shutil.which("agent-browser"):
        print("  agent-browser not on PATH — skipping tokens (supply art.* by hand)")
        return None

    # NOTE: agent-browser's `eval` takes an EXPRESSION, not a function declaration.
    # Passing `() => ({...})` hands it a function object, which serialises to `{}`
    # — it looks like the page returned nothing rather than like a usage error.
    # Hence the IIFE.
    js = r"""
    (() => {
      const cs = (el) => el ? getComputedStyle(el) : null;
      const body = cs(document.body);
      const pick = (sel) => document.querySelector(sel);
      const h1 = pick('h1');
      // The paragraph with the most text, not the first one. `querySelector('p')`
      // routinely lands on a nav or cookie-banner paragraph, and the two pages
      // tested disagreed on which font that reported — one gave the body serif,
      // the other a nav sans, which then propagated into art.bodyFace.
      const p = Array.from(document.querySelectorAll('article p, main p, p'))
        .filter((el) => (el.textContent || '').trim().length > 80)
        .sort((a, b) => (b.textContent || '').length - (a.textContent || '').length)[0]
        || pick('p');
      // Count colours actually used by text, so the accent is measured rather
      // than guessed from a palette variable that may be unused.
      const freq = {};
      document.querySelectorAll('a, strong, em, h1, h2, h3, p, span, li').forEach((el) => {
        const c = getComputedStyle(el).color;
        freq[c] = (freq[c] || 0) + (el.textContent || '').trim().length;
      });
      const byUse = Object.entries(freq).sort((a, b) => b[1] - a[1]);
      // CSS custom properties. Collect the declared names from the stylesheets,
      // then read each one back off documentElement so `var()` indirections are
      // RESOLVED — sites routinely declare `--accent: var(--color-brand-orange)`,
      // and the raw declaration is useless on its own.
      const names = new Set();
      for (const sheet of Array.from(document.styleSheets)) {
        let rules; try { rules = sheet.cssRules; } catch { continue; }
        for (const r of Array.from(rules || [])) {
          if (!r.style) continue;
          for (const name of Array.from(r.style)) {
            if (name.startsWith('--')) names.add(name);
          }
        }
      }
      const rootStyle = getComputedStyle(document.documentElement);
      const vars = {};
      for (const name of names) {
        const v = rootStyle.getPropertyValue(name).trim();
        if (v) vars[name] = v;
      }

      const radii = {};
      document.querySelectorAll('button, .card, [class*=card], img, figure').forEach((el) => {
        const r = getComputedStyle(el).borderRadius;
        // Skip 0 and skip pill radii: a 9999px (or 3.35e7px) value is "fully
        // rounded", not a corner radius, and copying it into art.radius would
        // round every figure into a lozenge.
        if (!r || r === '0px') return;
        const px = parseFloat(r);
        if (!Number.isFinite(px) || px > 64) return;
        radii[r] = (radii[r] || 0) + 1;
      });
      return {
        bodyBg: body && body.backgroundColor,
        bodyColor: body && body.color,
        bodyFont: body && body.fontFamily,
        h1Font: h1 && cs(h1).fontFamily,
        h1Weight: h1 && cs(h1).fontWeight,
        h1Size: h1 && cs(h1).fontSize,
        pFont: p && cs(p).fontFamily,
        pSize: p && cs(p).fontSize,
        textColorsByUse: byUse.slice(0, 8),
        linkColor: pick('a') && cs(pick('a')).color,
        cssVars: vars,
        radii: Object.entries(radii).sort((a,b)=>b[1]-a[1]).slice(0,4),
        fonts: Array.from(document.fonts || []).map((f) => f.family + ' ' + f.weight).slice(0, 20),
      };
    })()
    """
    # Unique per run, and closed unconditionally afterwards. A fixed session name
    # inherits whatever state a previous (possibly crashed) run left behind, and
    # then `open` fails with a bare non-zero exit and no useful message — which
    # looks like the site blocking us rather than a stale tab.
    session = f"h2v-tokens-{os.getpid()}"
    try:
        subprocess.run(["agent-browser", "--session", session, "close"],
                       capture_output=True, text=True, timeout=30)
    except Exception:
        pass
    # agent-browser defaults to a 25s timeout, which a chart-heavy page blows
    # through easily (one real case inlines ten base64 PNGs, so the DOM is several
    # MB before any layout happens).
    env = {**os.environ, "AGENT_BROWSER_DEFAULT_TIMEOUT": "90000"}

    try:
        args = ["agent-browser", "--session", session]
        if cdp_url:
            args += ["--cdp", cdp_url.rsplit(":", 1)[-1]]

        # `open` and `wait` are best-effort, NOT fatal. A page can time out against
        # whatever ready state they wait for and still be perfectly evaluable — and
        # their exit codes are not reliable anyway (observed: the same timeout
        # message exiting 1 on one run and 0 on the next). What matters is whether
        # the eval returns usable data, so that is the only thing we check.
        subprocess.run(args + ["open", url], capture_output=True, text=True,
                       timeout=150, env=env)
        subprocess.run(["agent-browser", "--session", session, "wait", "--load", "networkidle"],
                       capture_output=True, text=True, timeout=120, env=env)
        r = subprocess.run(
            ["agent-browser", "--session", session, "eval", "--stdin"],
            input=js, capture_output=True, text=True, timeout=150, env=env,
        )
        subprocess.run(["agent-browser", "--session", session, "close"],
                       capture_output=True, text=True)
        raw = r.stdout.strip()
        start = raw.find("{")
        if start < 0:
            print(f"  tokens: unexpected output from agent-browser; skipping")
            return None
        tokens = json.loads(raw[start:])
        (out / "tokens.json").write_text(
            json.dumps(tokens, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        return tokens
    except Exception as e:
        print(f"  tokens: {e} — skipping (supply art.* by hand)")
        return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--skip-tokens", action="store_true")
    ap.add_argument("--cdp-url", default=None,
                    help="reuse a running Chrome, e.g. http://localhost:9222")
    a = ap.parse_args()

    out = Path(a.out).expanduser().resolve()
    media = out / "media"
    out.mkdir(parents=True, exist_ok=True)
    media.mkdir(exist_ok=True)

    data = fetch_article(a.url, out, a.cdp_url)
    doc = data.get("document", {}) or {}
    md_body = ""
    for block in doc.get("content", []) or []:
        if block.get("type") == "markdown":
            md_body += block.get("markdown", "")

    front = data.get("markdown", "") or ""
    cover = ""
    mcover = re.search(r'^coverImage:\s*"([^"]+)"', front, re.M)
    if mcover:
        cover = os.path.basename(mcover.group(1))

    # Authoritative caption pairing from the page's own <figure> markup, when the
    # raw HTML is available. Proximity is only a fallback.
    fig_caps: dict[str, str] = {}
    page_html = out / "debug" / "page.html"
    if page_html.exists():
        try:
            fig_caps = figcaptions_from_html(page_html.read_text(encoding="utf-8", errors="ignore"))
        except Exception as e:
            print(f"  note: could not parse <figure> blocks ({e}); falling back to proximity")
    if fig_caps:
        print(f"  {len(fig_caps)} caption(s) paired from <figure> markup")

    # Figures, from the body markdown where the URLs are still absolute.
    figures = []
    for idx, fig in enumerate(parse_figures(md_body), start=1):
        src = original_url(fig["src"])
        if cover and os.path.basename(urllib.parse.urlparse(src).path) in cover:
            continue  # og:image / logo, not article content
        ext = os.path.splitext(urllib.parse.urlparse(src).path)[1] or ".png"
        dest = media / f"fig-{idx:02d}{ext}"
        print(f"  figure {idx}: {src[:88]}")
        if not download(src, dest):
            continue
        dim = dimensions(dest)
        if not dim:
            print(f"    ! could not read dimensions, skipping")
            continue
        key = caption_key(src)
        authoritative = fig_caps.get(key, "")
        figures.append({
            "id": f"fig-{idx:02d}",
            "file": f"media/{dest.name}",
            "originalUrl": src,
            "intrinsic": {"w": dim[0], "h": dim[1]},
            "alt": fig["alt"],
            "caption": authoritative or fig["caption"],
            # VERIFY proximity captions against the image before using one as a
            # finding. A caption paired by proximity may belong to a neighbouring
            # figure, or be ordinary body prose that merely follows the image.
            "captionSource": "figcaption" if authoritative else ("proximity" if fig["caption"] else "none"),
        })

    # Structure: h2 sections with the noise filtered out.
    sections = [
        h.strip() for h in re.findall(r"^##\s+(.+)$", md_body, re.M)
        if not NOISE_HEADING.match(h.strip())
    ]
    paragraphs = [
        p.strip() for p in re.split(r"\n\s*\n", md_body)
        if len(p.strip()) > 80 and not p.strip().startswith(("#", "!", "|"))
    ]

    tokens = None if a.skip_tokens else harvest_tokens(a.url, out, a.cdp_url)

    harvest = {
        "sourceUrl": a.url,
        "title": doc.get("title", ""),
        "author": doc.get("author", "") or "",
        "publishedAt": doc.get("publishedAt", "") or "",
        "summary": (doc.get("metadata", {}) or {}).get("summary", "")
        or (re.search(r'^summary:\s*"([^"]*)"', front, re.M).group(1)
            if re.search(r'^summary:\s*"([^"]*)"', front, re.M) else ""),
        "language": (doc.get("metadata", {}) or {}).get("language", ""),
        "sections": sections,
        "figures": figures,
        "paragraphCount": len(paragraphs),
        "paragraphs": paragraphs,
        "tokens": tokens,
    }
    (out / "harvest.json").write_text(
        json.dumps(harvest, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # Fail loudly when a page did not yield enough to edit from. A four-scene
    # video built out of nothing is worse than an honest refusal.
    if len(figures) < 1 and len(paragraphs) < 8:
        sys.exit(
            f"this page yielded too little structure to edit: {len(figures)} figures, "
            f"{len(paragraphs)} paragraphs. Pick a richer article or harvest by hand."
        )

    print(f"\n  {out / 'harvest.json'}")
    print(f"  {len(sections)} sections, {len(paragraphs)} paragraphs, {len(figures)} figures")
    for f in figures:
        cap = (f["caption"][:64] + "…") if len(f["caption"]) > 64 else f["caption"]
        print(f"    {f['id']}  {f['intrinsic']['w']}x{f['intrinsic']['h']}  {cap}")


if __name__ == "__main__":
    main()
