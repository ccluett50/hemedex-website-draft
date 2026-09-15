"""Crop a headshot to 4:5, resize, and save as compressed WebP (crop/resize/compress only).

    python _team/make_photo.py SOURCE OUT_NAME [--focus-x 0.5] [--focus-y 0.3]
    python _team/make_photo.py SOURCE OUT_NAME --head TOP CHIN CENTER_X [--head-ratio 0.6]

Writes images/team/OUT_NAME.webp at up to 640x800 (2x the largest display size).
OUT_NAME may include a subfolder, e.g. blue/stefanie-cantin.

--focus-x/--focus-y (0-1) center the largest possible 4:5 crop on that point.
--head gives the top of the head, the chin, and the face's horizontal center as
fractions (0-1) of the source. The crop is sized so the head fills --head-ratio of
its height with a little headroom, so faces are framed alike across a set of
photos. Crops never extend past the source (no padding or fill).
"""
import argparse
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
W, H = 640, 800
HEADROOM = 0.07  # head top sits this far below the crop's top edge, when the source allows

ap = argparse.ArgumentParser()
ap.add_argument("source")
ap.add_argument("out_name")
ap.add_argument("--focus-x", type=float, default=0.5)
ap.add_argument("--focus-y", type=float, default=0.3)
ap.add_argument("--head", type=float, nargs=3, metavar=("TOP", "CHIN", "CENTER_X"))
ap.add_argument("--head-ratio", type=float, default=0.6)
args = ap.parse_args()

out = ROOT / "images" / "team" / f"{args.out_name}.webp"
if out.exists():
    raise SystemExit(f"{out} already exists; not overwriting")
out.parent.mkdir(parents=True, exist_ok=True)

im = ImageOps.exif_transpose(Image.open(args.source)).convert("RGB")

if args.head:
    top, chin, cx = args.head[0] * im.height, args.head[1] * im.height, args.head[2] * im.width
    crop_h = min(im.height, im.width * H / W, (chin - top) / args.head_ratio)
    crop_w = crop_h * W / H
    left = min(max(cx - crop_w / 2, 0), im.width - crop_w)
    upper = min(max(top - HEADROOM * crop_h, 0), im.height - crop_h)
    im = im.crop((round(left), round(upper), round(left + crop_w), round(upper + crop_h)))
    # Never upscale.
    scale = min(1.0, im.width / W)
    im = im.resize((round(W * scale), round(H * scale)), Image.LANCZOS)
else:
    # Never upscale: small sources get the largest 4:5 box that fits them.
    scale = min(1.0, im.width / W, im.height / H)
    size = (round(W * scale), round(H * scale))
    im = ImageOps.fit(im, size, method=Image.LANCZOS, centering=(args.focus_x, args.focus_y))

im.save(out, "WEBP", quality=82, method=6)
print(f"{out.relative_to(ROOT)}  {im.size}  {out.stat().st_size // 1024} KB")
