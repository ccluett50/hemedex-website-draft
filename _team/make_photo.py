"""Crop a headshot to 4:5, resize, and save as compressed WebP (crop/resize/compress only).

    python _team/make_photo.py SOURCE SLUG [--focus-x 0.5] [--focus-y 0.3]

Writes images/team/SLUG.webp at 640x800 (2x the largest display size).
--focus-x/--focus-y (0-1) pick which part of the source the crop centers on.
"""
import argparse
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
W, H = 640, 800

ap = argparse.ArgumentParser()
ap.add_argument("source")
ap.add_argument("slug")
ap.add_argument("--focus-x", type=float, default=0.5)
ap.add_argument("--focus-y", type=float, default=0.3)
args = ap.parse_args()

out = ROOT / "images" / "team" / f"{args.slug}.webp"
if out.exists():
    raise SystemExit(f"{out} already exists; not overwriting")

im = ImageOps.exif_transpose(Image.open(args.source)).convert("RGB")
# Never upscale: small sources get the largest 4:5 box that fits them.
scale = min(1.0, im.width / W, im.height / H)
size = (round(W * scale), round(H * scale))
im = ImageOps.fit(im, size, method=Image.LANCZOS, centering=(args.focus_x, args.focus_y))
im.save(out, "WEBP", quality=82, method=6)
print(f"{out.relative_to(ROOT)}  {im.size}  {out.stat().st_size // 1024} KB")
