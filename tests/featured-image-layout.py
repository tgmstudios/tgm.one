#!/usr/bin/env python3
"""Regression test: project featured image must keep natural size/aspect.

Real-browser layout check (Playwright for Python + Chromium). Extracts the
featured <img> class/style from pages/project/[project].vue, compiles Tailwind
CSS for that markup with the repo's tailwind CLI, then measures rendered boxes.
Run: python3 tests/featured-image-layout.py   (after `pnpm install`)
"""
import os, re, subprocess, sys, tempfile
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = open(os.path.join(ROOT, "pages/project/[project].vue")).read()
m = re.search(r'<img[^>]*?:alt="`\$\{projectobj\.title\} featured image`"[^>]*?>', SRC, re.S)
assert m, "featured image <img> not found"
tag = m.group(0)
cls = re.search(r'\sclass="([^"]*)"', tag).group(1)
style = (re.search(r'\sstyle="([^"]*)"', tag) or [None, ""])[1]

tmp = tempfile.mkdtemp()
html_path = os.path.join(tmp, "p.html")
snippet = f'<div class="mb-6"><img id="f" class="{cls}" style="{style}" src="SRC"></div>'
open(html_path, "w").write(snippet)
inp = os.path.join(tmp, "in.css")
open(inp, "w").write("@tailwind base;@tailwind components;@tailwind utilities;")
cfg = os.path.join(tmp, "tw.config.js")
open(cfg, "w").write(f"module.exports={{content:[{html_path!r}]}}")
css = subprocess.run([os.path.join(ROOT, "node_modules/.bin/tailwindcss"), "-c", cfg, "-i", inp],
                     capture_output=True, text=True, check=True, cwd=ROOT).stdout

def svg(w, h):
    s = f"<svg xmlns='http://www.w3.org/2000/svg' width='{w}' height='{h}'><rect width='100%' height='100%' fill='red'/></svg>"
    return "data:image/svg+xml," + s.replace("<", "%3C").replace(">", "%3E").replace("#", "%23")

CASES = [  # name, intrinsic w,h, viewport w
    ("small-desktop", 300, 200, 1280),
    ("large-desktop", 2000, 1500, 1280),
    ("portrait-desktop", 400, 1200, 1280),
    ("small-mobile", 300, 200, 375),
    ("large-mobile", 2000, 1000, 375),
    ("portrait-mobile", 400, 1200, 375),
]
fails = []
with sync_playwright() as p:
    b = p.chromium.launch()
    for name, iw, ih, vw in CASES:
        pg = b.new_page(viewport={"width": vw, "height": 800})
        pg.set_content(f"<style>{css}body{{margin:0}}</style><div style='padding:0 16px'>"
                       + snippet.replace("SRC", svg(iw, ih)) + "</div>")
        pg.wait_for_function("document.getElementById('f').complete")
        r = pg.evaluate("(()=>{const e=document.getElementById('f').getBoundingClientRect();"
                        "return [e.width,e.height,e.left]})()")
        w, h, left = r
        avail = vw - 32
        exp_scale = min(1, avail / iw, 400 / ih)
        ew, eh = iw * exp_scale, ih * exp_scale
        ok = abs(w - ew) < 1.5 and abs(h - eh) < 1.5 and h <= 400.5 and w <= avail + .5
        if iw < avail and ih < 400:  # small image: must not be upscaled, and centered
            ok = ok and abs(left - (vw - w) / 2) < 1.5
        print(f"{'PASS' if ok else 'FAIL'} {name}: rendered {w:.0f}x{h:.0f}, expected {ew:.0f}x{eh:.0f}")
        if not ok: fails.append(name)
    b.close()
sys.exit(1 if fails else 0)
