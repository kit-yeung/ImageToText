import os
import time
import cv2
from craft_text_detector import Craft, craft_utils
import craft_text_detector
from craft_text_detector import image_utils, torch_utils
from PIL import Image
import numpy as np


# PATCH 1: Fix adjustResultCoordinates
def safe_adjust_coords(polys, ratio_w, ratio_h, ratio_net=2):
    adjusted = []
    for poly in polys:
        if poly is None:
            adjusted.append(None)
            continue
        pts = np.array(poly).reshape(-1, 2)
        pts = pts * (ratio_w * ratio_net, ratio_h * ratio_net)
        adjusted.append(pts)
    return adjusted

craft_utils.adjustResultCoordinates = safe_adjust_coords
# END PATCH 1

# PATCH 2: Rewrite get_prediction to avoid polys_as_ratio crashes
def safe_get_prediction(
    image,
    craft_net,
    refine_net=None,
    text_threshold: float = 0.7,
    link_threshold: float = 0.4,
    low_text: float = 0.4,
    cuda: bool = False,
    long_size: int = 1280,
    poly: bool = True,
):
    t0 = time.time()

    # read/convert image
    image = image_utils.read_image(image)

    # resize
    img_resized, target_ratio, size_heatmap = image_utils.resize_aspect_ratio(
        image, long_size, interpolation=cv2.INTER_LINEAR
    )
    ratio_h = ratio_w = 1 / target_ratio
    resize_time = time.time() - t0
    t0 = time.time()

    # preprocessing
    x = image_utils.normalizeMeanVariance(img_resized)
    x = torch_utils.from_numpy(x).permute(2, 0, 1)  # [h, w, c] to [c, h, w]
    x = torch_utils.Variable(x.unsqueeze(0))  # [c, h, w] to [b, c, h, w]
    if cuda:
        x = x.cuda()
    preprocessing_time = time.time() - t0
    t0 = time.time()

    # forward pass
    with torch_utils.no_grad():
        y, feature = craft_net(x)
    craftnet_time = time.time() - t0
    t0 = time.time()

    # make score and link map
    score_text = y[0, :, :, 0].cpu().data.numpy()
    score_link = y[0, :, :, 1].cpu().data.numpy()

    # refine link
    if refine_net is not None:
        with torch_utils.no_grad():
            y_refiner = refine_net(y, feature)
        score_link = y_refiner[0, :, :, 0].cpu().data.numpy()
    refinenet_time = time.time() - t0
    t0 = time.time()

    # Post-processing
    boxes, polys = craft_utils.getDetBoxes(
        score_text, score_link, text_threshold, link_threshold, low_text, poly
    )

    # coordinate adjustment
    boxes = craft_utils.adjustResultCoordinates(boxes, ratio_w, ratio_h)
    polys = craft_utils.adjustResultCoordinates(polys, ratio_w, ratio_h)
    for k in range(len(polys)):
        if polys[k] is None:
            polys[k] = boxes[k]

    # get image size
    img_height = image.shape[0]
    img_width = image.shape[1]

    # calculate box coords as ratios to image size
    boxes_as_ratio = []
    for box in boxes:
        boxes_as_ratio.append(box / [img_width, img_height])
    boxes_as_ratio = np.array(boxes_as_ratio)

    # calculate poly coords as ratios to image size
    polys_as_ratio = []
    for poly_item in polys:
        polys_as_ratio.append(poly_item / [img_width, img_height])

    # Key modification: Allow each poly shape to be different and use dtype=object to avoid crashes
    polys_as_ratio = np.array(polys_as_ratio, dtype=object)

    text_score_heatmap = image_utils.cvt2HeatmapImg(score_text)
    link_score_heatmap = image_utils.cvt2HeatmapImg(score_link)

    postprocess_time = time.time() - t0

    times = {
        "resize_time": resize_time,
        "preprocessing_time": preprocessing_time,
        "craftnet_time": craftnet_time,
        "refinenet_time": refinenet_time,
        "postprocess_time": postprocess_time,
    }

    return {
        "boxes": boxes,
        "boxes_as_ratios": boxes_as_ratio,
        "polys": polys,
        "polys_as_ratios": polys_as_ratio,
        "heatmaps": {
            "text_score_heatmap": text_score_heatmap,
            "link_score_heatmap": link_score_heatmap,
        },
        "times": times,
    }

craft_text_detector.get_prediction = safe_get_prediction
# END PATCH 2


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
    # Line grouping + sorting
    boxes = sort_into_lines(boxes)
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


def box_stats(box):
    ys = box[:, 1]
    y_min = float(np.min(ys))
    y_max = float(np.max(ys))
    y_center = (y_min + y_max) / 2
    height = y_max - y_min
    return y_center, height


def sort_into_lines(boxes, line_overlap_ratio=0.5):
    """
    Group boxes into lines using vertical center & adaptive threshold
    """
    info = []
    for b in boxes:
        xs = b[:, 0]
        y_center, height = box_stats(b)
        x_min = float(np.min(xs))
        info.append((b, y_center, height, x_min))

    # Sort by vertical center
    info.sort(key=lambda x: x[1])
    lines = []
    current_line = [info[0]]
    for item in info[1:]:
        _, y_c, h, _ = item
        _, last_y, last_h, _ = current_line[-1]
        threshold = line_overlap_ratio * max(h, last_h)
        if abs(y_c - last_y) < threshold:
            current_line.append(item)
        else:
            lines.append(current_line)
            current_line = [item]
    lines.append(current_line)

    # sort inside each line by x
    sorted_boxes = []
    for line in lines:
        line_sorted = sorted(line, key=lambda x: x[3])
        sorted_boxes.extend([b for (b, _, _, _) in line_sorted])

    return sorted_boxes
