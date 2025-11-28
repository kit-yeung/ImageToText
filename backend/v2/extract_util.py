import cv2
import torch
import easyocr
import numpy as np
from transformers import TrOCRProcessor, VisionEncoderDecoderModel

# Load TrOCR
processor = TrOCRProcessor.from_pretrained("microsoft/trocr-base-handwritten")
model = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-base-handwritten")
model.eval()

def run_trocr(image_path):
    """Perform TrOCR inference on a single image."""
    img = cv2.imread(image_path)
    if img is None:
        return ""

    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    pixel_values = processor(images=img, return_tensors="pt").pixel_values

    with torch.no_grad():
        generated_ids = model.generate(pixel_values)

    text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
    return text.strip()


# EasyOCR supported languages (80+ languages)
# EASYOCR_SUPPORTED_LANGS = [
#     'en', 'ch_sim', 'ch_tra', 'ja', 'ko', 'th', 'vi', 'bn', 'ar', 'fa', 'ur', 'ug',
#     'hi', 'mr', 'ne', 'ta', 'te', 'kn', 'ml', 'as', 'ru', 'rs_cyrillic', 'be', 'bg',
#     'uk', 'mn', 'abq', 'ady', 'kbd', 'ava', 'dar', 'inh', 'che', 'lbe', 'lez', 'tab',
#     'fr', 'de', 'es', 'it', 'pt', 'nl', 'pl', 'cs', 'sk', 'hr', 'ro', 'hu', 'tr',
#     'sv', 'da', 'no', 'fi', 'et', 'lv', 'lt', 'is', 'ga', 'cy', 'mt', 'sq', 'az',
#     'uz', 'kk', 'ky', 'tg', 'tk', 'af', 'eu', 'ca', 'gl', 'la', 'oc', 'mi', 'id',
#     'ms', 'tl', 'jv', 'su'
# ]
EASYOCR_SUPPORTED_LANGS = ['en', 'fr', 'ch_sim', 'ru', 'be']

def detect_language_auto(crop_path):
    """
    Traverse all EasyOCR supported languages to determine the highest-scoring language for the text in crop_path[0].
    """
    best_lang = "en"
    best_score = -1
    for lang in EASYOCR_SUPPORTED_LANGS:
        try:
            reader = easyocr.Reader(["en", lang], gpu=False)
            result = reader.readtext(crop_path[0], detail=1)
            if not result:
                continue

            score = result[0][2]
            if score > best_score:
                best_score = score
                best_lang = lang

        except Exception:
            continue

    return best_lang


def detect_text_type_auto(crop_paths):
    """
    Analyzes image crops to automatically classify the text type as 'printed' or 'handwritten'.
    """
    for p in crop_paths:
        img = cv2.imread(p, cv2.IMREAD_GRAYSCALE)
        if img is None:
            continue

        # Noise removal
        blur = cv2.GaussianBlur(img, (3, 3), 0)

        # Sobel edge detection
        sobel_x = cv2.Sobel(blur, cv2.CV_64F, 1, 0, ksize=3)
        sobel_y = cv2.Sobel(blur, cv2.CV_64F, 0, 1, ksize=3)
        sobel_mag = np.sqrt(sobel_x**2 + sobel_y**2)
        # Edge strength mean
        edge_mean = np.mean(sobel_mag)
        # Edge direction variance
        edge_var = np.var(np.arctan2(sobel_y, sobel_x))

        # Number of connected components
        _, bw = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        num_labels, _ = cv2.connectedComponents(bw)

        # printed: strong edges + fewer connected components + low direction variance
        # handwritten: weak edges + more connected components + high direction variance
        handwritten_score = 0
        printed_score = 0

        if edge_mean > 40:
            printed_score += 1
        else:
            handwritten_score += 1

        if num_labels < 120:
            printed_score += 1
        else:
            handwritten_score += 1

        if edge_var < 0.5:
            printed_score += 1
        else:
            handwritten_score += 1

    return "printed" if printed_score >= handwritten_score else "handwritten"
