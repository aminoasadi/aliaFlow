from pathlib import Path
from PIL import Image

source = Path("work/pdf-pages/aliaflow-reference.png")
out = Path("work/reference-crops")
out.mkdir(parents=True, exist_ok=True)

with Image.open(source) as image:
    chunk_height = 2400
    for index, top in enumerate(range(0, image.height, chunk_height), start=1):
        bottom = min(top + chunk_height, image.height)
        crop = image.crop((0, top, image.width, bottom))
        crop.save(out / f"reference-{index:02d}-{top:05d}-{bottom:05d}.png", optimize=True)
        crop.save(
            out / f"reference-{index:02d}-{top:05d}-{bottom:05d}.webp",
            format="WEBP",
            lossless=True,
            method=6,
        )
