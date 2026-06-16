#!/usr/bin/env python3
"""Generate the AGRIFARM premium wood UI asset pack.

The output is intentionally text-free: typography, product data, prices, and
labels should remain HTML/CSS so the assets stay responsive and accessible.
"""

from __future__ import annotations

import argparse
import json
import math
import random
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageOps


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUT = ROOT / "apps" / "web" / "public" / "assets" / "agrifarm-ui-pack"
TEXTURE_SIZE = 4096

WALNUT = (73, 35, 18)
WALNUT_DARK = (30, 14, 8)
MAHOGANY = (104, 48, 23)
CREAM = (244, 235, 215)
CREAM_DARK = (213, 194, 159)
BEIGE = (202, 174, 126)
GOLD = (204, 151, 58)
GOLD_LIGHT = (246, 206, 118)
MOSS = (73, 104, 45)
MOSS_DARK = (45, 69, 28)
SHADOW = (16, 8, 4, 120)


def resampling():
    return getattr(Image, "Resampling", Image).LANCZOS


def fit_rgba(im: Image.Image, size: tuple[int, int]) -> Image.Image:
    return ImageOps.fit(im.convert("RGBA"), size, method=resampling(), centering=(0.5, 0.5))


def mirror_tile(source: Image.Image, size: int = TEXTURE_SIZE) -> Image.Image:
    q = fit_rgba(source, (size // 2, size // 2)).convert("RGB")
    tile = Image.new("RGB", (size, size))
    tile.paste(q, (0, 0))
    tile.paste(ImageOps.mirror(q), (size // 2, 0))
    tile.paste(ImageOps.flip(q), (0, size // 2))
    tile.paste(ImageOps.mirror(ImageOps.flip(q)), (size // 2, size // 2))
    return tile


def procedural_walnut(size: int = TEXTURE_SIZE) -> Image.Image:
    rng = random.Random(2718)
    im = Image.new("RGB", (size, size), WALNUT)
    px = im.load()
    phase_a = rng.random() * math.tau
    phase_b = rng.random() * math.tau
    for y in range(size):
        phase_y = (y / size) * math.tau
        slow = math.sin(phase_y * 7 + phase_a) * 15
        mid = math.sin(phase_y * 41 + phase_b) * 7
        line = slow + mid
        for x in range(size):
            phase_x = (x / size) * math.tau
            wave = math.sin(phase_x * 17 + phase_y * 2) * 4
            ripple = math.sin(phase_x * 5 + phase_y * 11) * 2
            value = int(line + wave + ripple)
            r = max(16, min(118, WALNUT[0] + value))
            g = max(8, min(70, WALNUT[1] + value // 2))
            b = max(5, min(42, WALNUT[2] + value // 3))
            px[x, y] = (r, g, b)
    return im.filter(ImageFilter.GaussianBlur(0.35))


def load_texture(path: Path | None) -> Image.Image:
    base = procedural_walnut(TEXTURE_SIZE)
    if path and path.exists():
        # Use the generated material as color inspiration only. Heavy blur keeps
        # the procedural grain clean and avoids baked-in plank-like streaks.
        source = mirror_tile(Image.open(path), TEXTURE_SIZE).filter(ImageFilter.GaussianBlur(48))
        base = Image.blend(base, source, 0.08)
    base = ImageEnhance.Color(base).enhance(1.18)
    base = ImageEnhance.Contrast(base).enhance(1.15)
    base = ImageEnhance.Brightness(base).enhance(0.82)
    tint = Image.new("RGB", base.size, MAHOGANY)
    base = Image.blend(base, tint, 0.16)

    # Fine horizontal pores. Keep them subtle so the wood frames the products
    # instead of becoming decorative patterning.
    draw = ImageDraw.Draw(base, "RGBA")
    rng = random.Random(6401)
    pore_count = 720
    for i in range(pore_count):
        y = int((i / pore_count) * TEXTURE_SIZE)
        y += int(math.sin(i * 0.37) * 3)
        color = (255, 205, 126, rng.randint(4, 10)) if i % 5 else (18, 9, 4, rng.randint(7, 14))
        draw.line((0, y, TEXTURE_SIZE, y), fill=color, width=1)
    return base


def tiled_texture(texture: Image.Image, size: tuple[int, int], offset: tuple[int, int] = (0, 0)) -> Image.Image:
    w, h = size
    tw, th = texture.size
    out = Image.new("RGB", size)
    ox = offset[0] % tw
    oy = offset[1] % th
    for y in range(-oy, h, th):
        for x in range(-ox, w, tw):
            out.paste(texture, (x, y))
    return out.crop((0, 0, w, h))


def rounded_mask(size: tuple[int, int], bbox: tuple[int, int, int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle(bbox, radius=radius, fill=255)
    return mask


def rect_mask(size: tuple[int, int], bbox: tuple[int, int, int, int]) -> Image.Image:
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rectangle(bbox, fill=255)
    return mask


def ring_mask(
    size: tuple[int, int],
    outer: tuple[int, int, int, int],
    inner: tuple[int, int, int, int],
    outer_radius: int,
    inner_radius: int,
) -> Image.Image:
    mask = rounded_mask(size, outer, outer_radius)
    cut = rounded_mask(size, inner, inner_radius)
    return ImageChops.subtract(mask, cut)


def shifted_alpha(alpha: Image.Image, size: tuple[int, int], offset: tuple[int, int]) -> Image.Image:
    out = Image.new("L", size, 0)
    out.paste(alpha, offset)
    return out


def add_shadow(
    canvas: Image.Image,
    mask: Image.Image,
    offset: tuple[int, int] = (0, 16),
    blur: int = 28,
    color: tuple[int, int, int, int] = SHADOW,
) -> None:
    alpha = mask.filter(ImageFilter.GaussianBlur(blur))
    shifted = shifted_alpha(alpha, canvas.size, offset)
    layer = Image.new("RGBA", canvas.size, color)
    layer.putalpha(ImageChops.multiply(shifted, Image.new("L", canvas.size, color[3])))
    canvas.alpha_composite(layer)


def apply_clip_overlay(canvas: Image.Image, bbox: tuple[int, int, int, int], mask_crop: Image.Image, color: tuple[int, int, int], alpha: Image.Image) -> None:
    a = ImageChops.multiply(mask_crop, alpha)
    layer = Image.new("RGBA", (bbox[2] - bbox[0], bbox[3] - bbox[1]), (*color, 0))
    layer.putalpha(a)
    canvas.alpha_composite(layer, (bbox[0], bbox[1]))


def fill_wood(
    canvas: Image.Image,
    texture: Image.Image,
    bbox: tuple[int, int, int, int],
    mask: Image.Image,
    offset: tuple[int, int] = (0, 0),
    tint_opacity: float = 0.0,
    brightness: float = 1.0,
) -> None:
    x0, y0, x1, y1 = bbox
    w, h = x1 - x0, y1 - y0
    crop = tiled_texture(texture, (w, h), offset)
    if tint_opacity:
        crop = Image.blend(crop, Image.new("RGB", crop.size, WALNUT), tint_opacity)
    crop = ImageEnhance.Brightness(crop).enhance(brightness)
    crop = ImageEnhance.Contrast(crop).enhance(1.08)
    mask_crop = mask.crop(bbox)
    canvas.paste(crop.convert("RGBA"), (x0, y0), mask_crop)

    grad = Image.linear_gradient("L").resize((w, h), resampling())
    light = ImageOps.invert(grad).point(lambda p: int(p * 0.18))
    dark = grad.point(lambda p: int(p * 0.28))
    apply_clip_overlay(canvas, bbox, mask_crop, (255, 221, 160), light)
    apply_clip_overlay(canvas, bbox, mask_crop, (18, 7, 3), dark)


def fill_cream(
    canvas: Image.Image,
    bbox: tuple[int, int, int, int],
    radius: int,
    alpha: int = 255,
    shadow: bool = True,
    glass: bool = False,
) -> Image.Image:
    mask = rounded_mask(canvas.size, bbox, radius)
    if shadow:
        add_shadow(canvas, mask, (0, 10), 22, (42, 21, 9, 78))
    x0, y0, x1, y1 = bbox
    w, h = x1 - x0, y1 - y0
    base = Image.new("RGBA", (w, h), (*CREAM, alpha))
    noise = Image.effect_noise((w, h), 18).convert("L")
    grain = Image.new("RGBA", (w, h), (80, 45, 18, 0))
    grain.putalpha(noise.point(lambda p: max(0, int((p - 125) * 0.12))))
    base.alpha_composite(grain)
    if glass:
        highlight = Image.linear_gradient("L").resize((w, h), resampling())
        overlay = Image.new("RGBA", (w, h), (255, 255, 255, 0))
        overlay.putalpha(ImageOps.invert(highlight).point(lambda p: int(p * 0.24)))
        base.alpha_composite(overlay)
    canvas.paste(base, (x0, y0), mask.crop(bbox))
    return mask


def stroke_round(draw: ImageDraw.ImageDraw, bbox: tuple[int, int, int, int], radius: int, width: int, color: tuple[int, int, int, int]) -> None:
    for i in range(width):
        draw.rounded_rectangle(
            (bbox[0] + i, bbox[1] + i, bbox[2] - i, bbox[3] - i),
            radius=max(0, radius - i),
            outline=color,
        )


def bevel(canvas: Image.Image, bbox: tuple[int, int, int, int], radius: int, width: int = 8, gold: bool = False) -> None:
    draw = ImageDraw.Draw(canvas, "RGBA")
    high = GOLD_LIGHT if gold else (245, 193, 111)
    mid = GOLD if gold else (143, 75, 32)
    low = (20, 8, 3)
    stroke_round(draw, bbox, radius, max(2, width // 2), (*low, 145))
    inset = (bbox[0] + 3, bbox[1] + 3, bbox[2] - 3, bbox[3] - 3)
    stroke_round(draw, inset, max(0, radius - 3), max(2, width // 3), (*high, 120))
    inset2 = (bbox[0] + width, bbox[1] + width, bbox[2] - width, bbox[3] - width)
    stroke_round(draw, inset2, max(0, radius - width), max(1, width // 4), (*mid, 150))


def wood_panel(
    canvas: Image.Image,
    texture: Image.Image,
    bbox: tuple[int, int, int, int],
    radius: int,
    shadow: bool = True,
    gold: bool = False,
    offset: tuple[int, int] = (0, 0),
) -> Image.Image:
    mask = rounded_mask(canvas.size, bbox, radius)
    if shadow:
        add_shadow(canvas, mask, (0, 20), 36)
    fill_wood(canvas, texture, bbox, mask, offset=offset)
    bevel(canvas, bbox, radius, max(6, min(bbox[2] - bbox[0], bbox[3] - bbox[1]) // 34), gold=gold)
    return mask


def wood_rect(
    canvas: Image.Image,
    texture: Image.Image,
    bbox: tuple[int, int, int, int],
    shadow: bool = True,
    offset: tuple[int, int] = (0, 0),
) -> Image.Image:
    mask = rect_mask(canvas.size, bbox)
    if shadow:
        add_shadow(canvas, mask, (0, 18), 28)
    fill_wood(canvas, texture, bbox, mask, offset=offset)
    draw = ImageDraw.Draw(canvas, "RGBA")
    draw.line((bbox[0], bbox[1] + 4, bbox[2], bbox[1] + 4), fill=(245, 190, 108, 110), width=7)
    draw.line((bbox[0], bbox[3] - 8, bbox[2], bbox[3] - 8), fill=(14, 6, 2, 150), width=9)
    return mask


def slot(canvas: Image.Image, bbox: tuple[int, int, int, int], radius: int, fill: tuple[int, int, int, int] = (255, 247, 229, 92), outline: tuple[int, int, int, int] = (118, 74, 39, 125)) -> None:
    draw = ImageDraw.Draw(canvas, "RGBA")
    draw.rounded_rectangle(bbox, radius=radius, fill=fill, outline=outline, width=max(2, (bbox[3] - bbox[1]) // 24))


def carve_line(canvas: Image.Image, points: list[tuple[int, int]], width: int = 4, color: tuple[int, int, int, int] = (25, 12, 6, 105)) -> None:
    draw = ImageDraw.Draw(canvas, "RGBA")
    shifted = [(x + 2, y + 2) for x, y in points]
    draw.line(shifted, fill=(255, 214, 132, 58), width=width)
    draw.line(points, fill=color, width=width)


def draw_leaf(draw: ImageDraw.ImageDraw, cx: int, cy: int, sx: int, sy: int, angle: float, color: tuple[int, int, int, int]) -> None:
    pts = []
    for i in range(18):
        t = (i / 17) * math.tau
        x = math.cos(t) * sx
        y = math.sin(t) * sy * (0.65 + 0.35 * max(0, math.cos(t)))
        xr = x * math.cos(angle) - y * math.sin(angle)
        yr = x * math.sin(angle) + y * math.cos(angle)
        pts.append((cx + xr, cy + yr))
    draw.polygon(pts, fill=color)
    stem = [
        (cx - math.cos(angle) * sx * 0.7, cy - math.sin(angle) * sx * 0.7),
        (cx + math.cos(angle) * sx * 0.7, cy + math.sin(angle) * sx * 0.7),
    ]
    draw.line(stem, fill=(61, 34, 17, color[3]), width=max(1, sx // 7))


def ornamental_vine(canvas: Image.Image, bbox: tuple[int, int, int, int], flip: bool = False, alpha: int = 82) -> None:
    draw = ImageDraw.Draw(canvas, "RGBA")
    x0, y0, x1, y1 = bbox
    w, h = x1 - x0, y1 - y0
    pts = []
    for i in range(42):
        t = i / 41
        x = x0 + int(t * w)
        y = y0 + int(h * (0.55 + 0.18 * math.sin(t * math.tau * 1.5)))
        if flip:
            x = x1 - (x - x0)
        pts.append((x, y))
    carve_line(canvas, pts, width=max(3, h // 18), color=(47, 22, 10, alpha))
    for i, t in enumerate([0.18, 0.34, 0.52, 0.70, 0.84]):
        x = x0 + int(t * w)
        y = y0 + int(h * (0.55 + 0.18 * math.sin(t * math.tau * 1.5)))
        if flip:
            x = x1 - (x - x0)
        angle = (-0.65 if i % 2 else 0.7) * (-1 if flip else 1)
        draw_leaf(draw, x, y - (12 if i % 2 else -10), max(10, h // 8), max(7, h // 12), angle, (215, 159, 72, alpha))


def save_asset(canvas: Image.Image, out_dir: Path, name: str, size: tuple[int, int], registry: list[dict[str, object]]) -> None:
    path = out_dir / name
    path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(path, "PNG", optimize=True)
    registry.append({"file": name, "width": size[0], "height": size[1], "alpha": canvas.mode == "RGBA"})


def asset_nav(texture: Image.Image) -> Image.Image:
    size = (3840, 512)
    im = Image.new("RGBA", size, (0, 0, 0, 0))
    wood_rect(im, texture, (0, 56, 3840, 372), shadow=True, offset=(0, 120))
    draw = ImageDraw.Draw(im, "RGBA")
    draw.rectangle((0, 350, 3840, 372), fill=(14, 6, 2, 120))
    draw.rectangle((0, 62, 3840, 72), fill=(255, 214, 132, 45))
    slot(im, (1430, 132, 2410, 286), 54, fill=(28, 14, 7, 90), outline=(238, 181, 87, 95))
    for x in [260, 710, 2590, 3040]:
        slot(im, (x, 150, x + 350, 258), 36, fill=(255, 244, 220, 20), outline=(231, 181, 99, 60))
    slot(im, (3440, 106, 3664, 314), 52, fill=(244, 235, 215, 210), outline=(126, 75, 35, 160))
    ornamental_vine(im, (1660, 282, 2180, 340), alpha=58)
    for x in [1280, 2560]:
        draw.line((x, 104, x, 322), fill=(24, 10, 4, 88), width=3)
        draw.line((x + 4, 104, x + 4, 322), fill=(246, 203, 121, 38), width=2)
    return im


def asset_logo_plaque(texture: Image.Image) -> Image.Image:
    size = (1200, 400)
    im = Image.new("RGBA", size, (0, 0, 0, 0))
    wood_panel(im, texture, (70, 48, 1130, 352), 82, gold=True, offset=(330, 240))
    fill_cream(im, (196, 136, 1004, 264), 40, alpha=36, shadow=False)
    slot(im, (230, 154, 970, 246), 28, fill=(25, 11, 5, 45), outline=(244, 195, 104, 92))
    ornamental_vine(im, (142, 72, 386, 136), alpha=78)
    ornamental_vine(im, (814, 264, 1058, 328), flip=True, alpha=78)
    return im


def asset_hero_frame(texture: Image.Image) -> Image.Image:
    size = (3840, 1800)
    im = Image.new("RGBA", size, (0, 0, 0, 0))
    outer = (92, 72, 3748, 1708)
    inner = (292, 260, 3548, 1470)
    mask = ring_mask(size, outer, inner, 190, 116)
    add_shadow(im, mask, (0, 34), 58, (12, 5, 2, 135))
    fill_wood(im, texture, outer, mask, offset=(400, 120))
    bevel(im, outer, 190, 34, gold=True)
    bevel(im, inner, 116, 24, gold=False)
    draw = ImageDraw.Draw(im, "RGBA")
    # Modern content rails without blocking the transparent hero stage.
    fill_cream(im, (392, 1320, 1770, 1438), 42, alpha=52, shadow=False, glass=True)
    fill_cream(im, (1950, 1320, 3448, 1438), 42, alpha=32, shadow=False, glass=True)
    for x in [488, 730, 972, 1214, 1456]:
        draw.rounded_rectangle((x, 1358, x + 154, 1400), radius=21, fill=(245, 232, 199, 75), outline=(157, 104, 47, 60), width=2)
    ornamental_vine(im, (318, 126, 960, 210), alpha=62)
    ornamental_vine(im, (2878, 126, 3520, 210), flip=True, alpha=62)
    return im


def asset_search_bar(texture: Image.Image) -> Image.Image:
    size = (1600, 250)
    im = Image.new("RGBA", size, (0, 0, 0, 0))
    wood_panel(im, texture, (40, 34, 1560, 216), 86, gold=True, offset=(800, 600))
    fill_cream(im, (112, 70, 1488, 180), 55, alpha=238, shadow=False)
    slot(im, (132, 86, 240, 164), 39, fill=(255, 255, 255, 32), outline=(126, 80, 43, 95))
    slot(im, (1230, 82, 1464, 168), 43, fill=(*MOSS, 222), outline=(*GOLD_LIGHT, 130))
    draw = ImageDraw.Draw(im, "RGBA")
    draw.line((282, 125, 1136, 125), fill=(121, 83, 49, 52), width=4)
    return im


def asset_section_header(texture: Image.Image) -> Image.Image:
    size = (2000, 300)
    im = Image.new("RGBA", size, (0, 0, 0, 0))
    wood_panel(im, texture, (120, 54, 1880, 246), 62, gold=True, offset=(180, 900))
    slot(im, (560, 102, 1440, 190), 32, fill=(25, 11, 5, 42), outline=(242, 190, 96, 80))
    draw = ImageDraw.Draw(im, "RGBA")
    draw.line((714, 214, 1286, 214), fill=(*GOLD_LIGHT, 130), width=6)
    ornamental_vine(im, (214, 96, 452, 166), alpha=82)
    ornamental_vine(im, (1548, 96, 1786, 166), flip=True, alpha=82)
    return im


def product_card(texture: Image.Image, hover: bool = False) -> Image.Image:
    size = (600, 900)
    im = Image.new("RGBA", size, (0, 0, 0, 0))
    shadow_color = (13, 5, 2, 170 if hover else 105)
    base_mask = rounded_mask(size, (48, 40 if hover else 54, 552, 840 if hover else 854), 38)
    add_shadow(im, base_mask, (0, 34 if hover else 22), 44 if hover else 30, shadow_color)
    fill_cream(im, (56, 44 if hover else 58, 544, 828 if hover else 842), 34, alpha=248, shadow=False)
    wood_panel(im, texture, (54, 42 if hover else 56, 546, 462 if hover else 476), 34, shadow=False, gold=hover, offset=(900, 190))
    # Transparent product image well with a carved wood lip.
    ImageDraw.Draw(im, "RGBA").rounded_rectangle((86, 86 if hover else 100, 514, 420 if hover else 434), radius=24, fill=(0, 0, 0, 0), outline=(*GOLD_LIGHT, 120 if hover else 70), width=5)
    fill_cream(im, (72, 492 if hover else 506, 528, 812 if hover else 826), 26, alpha=242, shadow=False)
    for i, y in enumerate([548, 592, 686]):
        w = [310, 198, 150][i]
        ImageDraw.Draw(im, "RGBA").rounded_rectangle((104, y if hover else y + 14, 104 + w, (y if hover else y + 14) + 20), radius=10, fill=(101, 63, 35, 66))
    slot(im, (104, 744 if hover else 758, 258, 794 if hover else 808), 18, fill=(255, 247, 229, 72), outline=(129, 83, 44, 120))
    slot(im, (298, 734 if hover else 748, 478, 804 if hover else 818), 26, fill=((*MOSS, 225) if not hover else (*GOLD, 230)), outline=(*GOLD_LIGHT, 150))
    if hover:
        draw = ImageDraw.Draw(im, "RGBA")
        draw.rounded_rectangle((50, 38, 550, 834), radius=38, outline=(*GOLD_LIGHT, 165), width=8)
    return im


def asset_category(texture: Image.Image) -> Image.Image:
    size = (700, 500)
    im = Image.new("RGBA", size, (0, 0, 0, 0))
    wood_panel(im, texture, (42, 42, 658, 458), 46, gold=True, offset=(1200, 460))
    fill_cream(im, (78, 88, 622, 424), 30, alpha=236, shadow=False)
    ImageDraw.Draw(im, "RGBA").rounded_rectangle((136, 124, 564, 312), radius=28, outline=(125, 80, 42, 95), width=5)
    slot(im, (182, 348, 518, 386), 19, fill=(98, 62, 35, 54), outline=(0, 0, 0, 0))
    return im


def asset_farmer_spotlight(texture: Image.Image) -> Image.Image:
    size = (1400, 700)
    im = Image.new("RGBA", size, (0, 0, 0, 0))
    wood_panel(im, texture, (44, 44, 1356, 656), 54, gold=True, offset=(420, 1320))
    fill_cream(im, (86, 84, 1314, 616), 36, alpha=244, shadow=False)
    ImageDraw.Draw(im, "RGBA").rounded_rectangle((120, 120, 650, 580), radius=30, outline=(97, 59, 29, 125), width=7)
    fill_cream(im, (706, 140, 1248, 560), 28, alpha=60, shadow=False, glass=True)
    draw = ImageDraw.Draw(im, "RGBA")
    for y, w in [(188, 300), (244, 420), (302, 472), (360, 394), (444, 250)]:
        draw.rounded_rectangle((752, y, 752 + w, y + 22), radius=11, fill=(94, 57, 30, 56))
    ornamental_vine(im, (1048, 396, 1252, 520), flip=True, alpha=56)
    return im


def asset_stats(texture: Image.Image) -> Image.Image:
    size = (500, 300)
    im = Image.new("RGBA", size, (0, 0, 0, 0))
    wood_panel(im, texture, (34, 42, 466, 258), 32, gold=True, offset=(1700, 120))
    fill_cream(im, (58, 64, 442, 236), 24, alpha=176, shadow=False, glass=True)
    draw = ImageDraw.Draw(im, "RGBA")
    draw.rounded_rectangle((86, 88, 180, 182), radius=28, fill=(255, 255, 255, 42), outline=(*GOLD_LIGHT, 92), width=3)
    draw.rounded_rectangle((214, 98, 394, 128), radius=15, fill=(55, 31, 17, 68))
    draw.rounded_rectangle((214, 156, 362, 178), radius=11, fill=(55, 31, 17, 42))
    draw.rounded_rectangle((214, 196, 330, 214), radius=9, fill=(55, 31, 17, 30))
    return im


def asset_footer(texture: Image.Image) -> Image.Image:
    size = (3840, 700)
    im = Image.new("RGBA", size, (0, 0, 0, 0))
    wood_rect(im, texture, (0, 40, 3840, 680), shadow=True, offset=(0, 2600))
    draw = ImageDraw.Draw(im, "RGBA")
    draw.rectangle((0, 56, 3840, 66), fill=(255, 214, 132, 42))
    col_x = [330, 1320, 2140, 2960]
    for x in col_x:
        slot(im, (x, 168, x + 520, 232), 18, fill=(255, 246, 226, 34), outline=(229, 176, 88, 56))
        for i in range(4):
            draw.rounded_rectangle((x, 282 + i * 52, x + 380 - i * 34, 304 + i * 52), radius=11, fill=(246, 219, 164, 48))
    for i in range(5):
        cx = 3050 + i * 118
        wood_panel(im, texture, (cx, 382, cx + 70, 452), 35, shadow=False, gold=True, offset=(cx, 200))
    draw.rounded_rectangle((1430, 594, 2410, 626), radius=16, fill=(246, 219, 164, 45))
    ornamental_vine(im, (134, 104, 548, 168), alpha=68)
    return im


def button_asset(texture: Image.Image, kind: str, state: str) -> Image.Image:
    size = (520, 160)
    im = Image.new("RGBA", size, (0, 0, 0, 0))
    bbox = (34, 32, 486, 128)
    radius = 42
    disabled = state == "disabled"
    hover = state == "hover"
    active = state == "active"
    if kind == "outline":
        fill_cream(im, bbox, radius, alpha=80 if not disabled else 46, shadow=not disabled, glass=True)
        draw = ImageDraw.Draw(im, "RGBA")
        draw.rounded_rectangle(bbox, radius=radius, outline=(*GOLD_LIGHT, 170 if hover else 110), width=5)
    elif kind == "secondary":
        fill_cream(im, bbox, radius, alpha=232 if not disabled else 118, shadow=not disabled)
        draw = ImageDraw.Draw(im, "RGBA")
        draw.rounded_rectangle(bbox, radius=radius, outline=(104, 66, 36, 120), width=4)
    else:
        color = MOSS if kind == "success" else MAHOGANY
        if active:
            color = MOSS_DARK if kind == "success" else WALNUT_DARK
        alpha = 230 if not disabled else 84
        mask = rounded_mask(size, bbox, radius)
        add_shadow(im, mask, (0, 14 if not hover else 20), 22 if not hover else 30, (22, 9, 4, 86 if not disabled else 28))
        solid = Image.new("RGBA", size, (*color, alpha))
        im.paste(solid, (0, 0), mask)
        bevel(im, bbox, radius, 8, gold=hover or kind == "primary")
    draw = ImageDraw.Draw(im, "RGBA")
    if hover and not disabled:
        draw.rounded_rectangle((28, 26, 492, 134), radius=48, outline=(*GOLD_LIGHT, 135), width=4)
    if active and not disabled:
        draw.rounded_rectangle((42, 40, 478, 120), radius=36, fill=(15, 6, 2, 42))
    # Text/icon slot only; no embedded copy.
    draw.rounded_rectangle((168, 66, 352, 94), radius=14, fill=(255, 245, 220, 70 if not disabled else 36))
    return im


def corner_asset(position: str) -> Image.Image:
    size = (512, 512)
    im = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(im, "RGBA")
    flip_x = "right" in position
    flip_y = "bottom" in position
    sx = -1 if flip_x else 1
    sy = -1 if flip_y else 1
    origin = (424 if flip_x else 88, 424 if flip_y else 88)
    for r, alpha, width in [(330, 92, 5), (246, 68, 4), (166, 54, 3)]:
        bbox = (
            origin[0] - (r if not flip_x else 0),
            origin[1] - (r if not flip_y else 0),
            origin[0] + (0 if not flip_x else r),
            origin[1] + (0 if not flip_y else r),
        )
        draw.arc(bbox, start=0 if flip_x else 180, end=90 if flip_y else 270, fill=(*GOLD_LIGHT, alpha), width=width)
    for i, t in enumerate([0.28, 0.45, 0.62]):
        cx = origin[0] + sx * int(190 * t)
        cy = origin[1] + sy * int(70 + i * 62)
        draw_leaf(draw, cx, cy, 28, 15, sx * sy * 0.6, (204, 151, 58, 118))
    draw.line((origin[0], origin[1] + sy * 310, origin[0], origin[1]), fill=(79, 42, 20, 76), width=6)
    draw.line((origin[0] + sx * 310, origin[1], origin[0], origin[1]), fill=(79, 42, 20, 76), width=6)
    return im


def icon_medallion(texture: Image.Image) -> Image.Image:
    size = (256, 256)
    im = Image.new("RGBA", size, (0, 0, 0, 0))
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).ellipse((22, 22, 234, 234), fill=255)
    add_shadow(im, mask, (0, 12), 18, (16, 7, 3, 96))
    fill_wood(im, texture, (22, 22, 234, 234), mask, offset=(2200, 900))
    draw = ImageDraw.Draw(im, "RGBA")
    draw.ellipse((22, 22, 234, 234), outline=(*GOLD_LIGHT, 145), width=5)
    draw.ellipse((36, 36, 220, 220), outline=(28, 12, 5, 95), width=3)
    return im


def icon_stroke(draw: ImageDraw.ImageDraw, points: list[tuple[int, int]], width: int = 10, closed: bool = False) -> None:
    pts_shadow = [(x + 3, y + 3) for x, y in points]
    if closed:
        draw.line(pts_shadow + [pts_shadow[0]], fill=(255, 218, 143, 52), width=width, joint="curve")
        draw.line(points + [points[0]], fill=(27, 12, 5, 176), width=width, joint="curve")
    else:
        draw.line(pts_shadow, fill=(255, 218, 143, 52), width=width, joint="curve")
        draw.line(points, fill=(27, 12, 5, 176), width=width, joint="curve")


def icon_asset(texture: Image.Image, name: str) -> Image.Image:
    im = icon_medallion(texture)
    d = ImageDraw.Draw(im, "RGBA")
    dark = (27, 12, 5, 176)
    hi = (255, 218, 143, 70)
    if name == "search":
        d.ellipse((75, 70, 148, 143), outline=hi, width=13)
        d.ellipse((72, 67, 145, 140), outline=dark, width=10)
        icon_stroke(d, [(137, 134), (178, 176)], 12)
    elif name == "cart":
        icon_stroke(d, [(66, 82), (88, 82), (102, 154), (174, 154), (190, 104), (96, 104)], 10)
        d.ellipse((104, 170, 126, 192), fill=dark)
        d.ellipse((162, 170, 184, 192), fill=dark)
    elif name == "user":
        d.ellipse((98, 64, 158, 124), outline=dark, width=10)
        d.arc((70, 122, 186, 214), 200, 340, fill=dark, width=11)
    elif name == "farmer":
        d.arc((54, 70, 202, 146), 190, 350, fill=dark, width=10)
        d.line((74, 108, 182, 108), fill=dark, width=10)
        d.ellipse((98, 104, 158, 164), outline=dark, width=9)
        icon_stroke(d, [(91, 179), (128, 156), (165, 179)], 10)
    elif name == "harvest":
        icon_stroke(d, [(128, 184), (128, 76)], 8)
        for x, y, a in [(104, 104, -0.7), (152, 106, 0.7), (100, 144, -0.7), (154, 146, 0.7)]:
            draw_leaf(d, x, y, 30, 16, a, (27, 12, 5, 176))
    elif name == "marketplace":
        icon_stroke(d, [(66, 116), (78, 82), (178, 82), (190, 116)], 10)
        d.line((78, 118, 78, 184, 178, 184, 178, 118), fill=dark, width=10)
        for x in [96, 128, 160]:
            d.line((x, 84, x, 120), fill=dark, width=8)
    elif name == "delivery":
        d.rounded_rectangle((58, 105, 148, 162), radius=12, outline=dark, width=9)
        icon_stroke(d, [(148, 122), (178, 122), (198, 148), (198, 162), (148, 162)], 9)
        d.ellipse((80, 166, 104, 190), fill=dark)
        d.ellipse((164, 166, 188, 190), fill=dark)
    elif name == "secure-payment":
        icon_stroke(d, [(128, 62), (184, 86), (174, 154), (128, 194), (82, 154), (72, 86)], 10, closed=True)
        icon_stroke(d, [(102, 130), (122, 150), (158, 108)], 10)
    elif name == "chat":
        d.rounded_rectangle((64, 72, 192, 160), radius=28, outline=dark, width=10)
        icon_stroke(d, [(104, 160), (88, 192), (136, 162)], 8)
        for x in [100, 128, 156]:
            d.ellipse((x - 6, 113, x + 6, 125), fill=dark)
    elif name == "analytics":
        icon_stroke(d, [(72, 182), (72, 78)], 8)
        icon_stroke(d, [(72, 182), (186, 182)], 8)
        for x, h in [(96, 42), (128, 72), (160, 104)]:
            d.rounded_rectangle((x, 182 - h, x + 18, 182), radius=6, fill=dark)
    return im


def write_readme(out_dir: Path, registry: list[dict[str, object]]) -> None:
    lines = [
        "# AGRIFARM UI Asset Pack",
        "",
        "Generated production PNG assets for the AGRIFARM premium agricultural marketplace UI.",
        "",
        "- Style: dark walnut, mahogany, cream, harvest gold, moss green.",
        "- Lighting: shared soft top-left highlights with grounded lower shadows.",
        "- Copy policy: no embedded UI text; render labels, prices, and navigation in HTML/CSS.",
        "- Suggested path in Next.js: `/assets/agrifarm-ui-pack/<file>`.",
        "",
        "## Files",
        "",
    ]
    for item in registry:
        alpha = "alpha" if item["alpha"] else "opaque"
        lines.append(f"- `{item['file']}` - {item['width']}x{item['height']} {alpha}")
    (out_dir / "README.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--wood-source", type=Path, default=None, help="Optional generated walnut source image")
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    args = parser.parse_args()

    out_dir = args.out
    out_dir.mkdir(parents=True, exist_ok=True)
    registry: list[dict[str, object]] = []
    texture = load_texture(args.wood_source)

    texture.save(out_dir / "13-background-texture.png", "PNG", optimize=True)
    registry.append({"file": "13-background-texture.png", "width": TEXTURE_SIZE, "height": TEXTURE_SIZE, "alpha": False})

    exports = {
        "01-top-navigation-bar.png": (asset_nav(texture), (3840, 512)),
        "02-logo-plaque.png": (asset_logo_plaque(texture), (1200, 400)),
        "03-hero-frame.png": (asset_hero_frame(texture), (3840, 1800)),
        "04-search-bar-frame.png": (asset_search_bar(texture), (1600, 250)),
        "05-featured-products-section-header.png": (asset_section_header(texture), (2000, 300)),
        "06-product-card.png": (product_card(texture, hover=False), (600, 900)),
        "07-product-card-hover.png": (product_card(texture, hover=True), (600, 900)),
        "08-category-card.png": (asset_category(texture), (700, 500)),
        "09-farmer-spotlight-card.png": (asset_farmer_spotlight(texture), (1400, 700)),
        "10-statistics-card.png": (asset_stats(texture), (500, 300)),
        "12-footer.png": (asset_footer(texture), (3840, 700)),
    }
    for name, (im, size) in exports.items():
        save_asset(im, out_dir, name, size, registry)

    for kind in ["primary", "secondary", "success", "outline"]:
        for state in ["default", "hover", "active", "disabled"]:
            name = f"11-cta-{kind}-{state}.png"
            save_asset(button_asset(texture, kind, state), out_dir, name, (520, 160), registry)

    for pos in ["top-left", "top-right", "bottom-left", "bottom-right"]:
        name = f"14-corner-{pos}.png"
        save_asset(corner_asset(pos), out_dir, name, (512, 512), registry)

    for icon in [
        "search",
        "cart",
        "user",
        "farmer",
        "harvest",
        "marketplace",
        "delivery",
        "secure-payment",
        "chat",
        "analytics",
    ]:
        name = f"15-icon-{icon}.png"
        save_asset(icon_asset(texture, icon), out_dir, name, (256, 256), registry)

    manifest = {
        "name": "AGRIFARM Premium Wood UI Asset Pack",
        "version": 1,
        "generatedBy": "scripts/generate-agrifarm-ui-assets.py",
        "sourceTexture": str(args.wood_source) if args.wood_source else "procedural",
        "assets": registry,
    }
    (out_dir / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    write_readme(out_dir, registry)
    print(f"Generated {len(registry)} PNG assets in {out_dir}")


if __name__ == "__main__":
    main()
