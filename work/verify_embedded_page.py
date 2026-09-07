import base64
import io
import re
from pathlib import Path

from PIL import Image, ImageChops

root = Path("/Users/mac/Documents/Codex/2026-09-05/hdk-x20")
html = (root / "outputs/aliaflow-figma-exact.html").read_text()
payloads = re.findall(r"data:image/webp;base64,([A-Za-z0-9+/=]+)", html)
assert len(payloads) == 15, f"expected 15 embedded slices, found {len(payloads)}"

decoded = [Image.open(io.BytesIO(base64.b64decode(payload))).convert("RGB") for payload in payloads]
assert all(image.width == 1440 for image in decoded)
assert sum(image.height for image in decoded) == 33697

stitched = Image.new("RGB", (1440, 33697))
top = 0
for image in decoded:
    stitched.paste(image, (0, top))
    top += image.height

with Image.open(root / "work/pdf-pages/aliaflow-reference.png") as reference:
    reference = reference.convert("RGB")
    diff = ImageChops.difference(reference, stitched)
    assert diff.getbbox() is None, f"embedded image differs: {diff.getbbox()}"

print("verified: 15 lossless embedded slices, 1440x33697, pixel-identical to reference render")
