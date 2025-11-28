import os
from craft_text_detector import Craft
from PIL import Image


def detect_and_crop(input_image_path, out_dir="crops", min_area=100):
    """
    Uses craft_text_detector to detect text regions and saves crops.
    Returns list of crop file paths.
    """
    os.makedirs(out_dir, exist_ok=True)
    craft = Craft(output_dir=None)
    try:
        prediction = craft.detect_text(input_image_path)
    except Exception as e:
        craft = None
        raise RuntimeError(f"CRAFT detect_text failed: {e}")

    if not prediction or "boxes" not in prediction:
        craft = None
        return []

    boxes = prediction.get("boxes", [])
    crop_paths = []
    img = Image.open(input_image_path).convert("RGB")
    width, height = img.size  # PIL Image.size -> (width, height)

    for i, box in enumerate(boxes):
        # Each box contains 4 corner points: [[x1,y1], [x2,y2], [x3,y3], [x4,y4]]
        try:
            xs = [int(float(pt[0])) for pt in box]
            ys = [int(float(pt[1])) for pt in box]
        except Exception:
            continue

        x0, x1 = max(0, min(xs)), min(width, max(xs))
        y0, y1 = max(0, min(ys)), min(height, max(ys))

        if x1 <= x0 or y1 <= y0:
            continue

        if (x1 - x0) * (y1 - y0) < min_area:
            continue

        crop = img.crop((x0, y0, x1, y1))
        crop_path = os.path.join(out_dir, f"crop_{i}.png")
        crop.save(crop_path)
        crop_paths.append(crop_path)

    craft = None
    return crop_paths


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python detect_and_crop.py /path/to/image.jpg")
        sys.exit(1)

    img = sys.argv[1]
    crops = detect_and_crop(img)
    print("Saved crops:", crops)
