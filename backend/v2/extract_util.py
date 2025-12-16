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
EASYOCR_SUPPORTED_LANGS = ['en', 'ch_sim', 'ru']

def detect_img_language_auto(crop_path):
    """
    Traverse all EasyOCR supported languages to determine the highest-scoring language for the text in crop_path[0].
    """
    best_lang = "en"
    best_score = -1
    for lang in EASYOCR_SUPPORTED_LANGS:
        try:
            reader = easyocr.Reader([lang], gpu=False)
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
    Classifies text crops as 'printed' or 'handwritten' using three image-based features:
    average edge strength, Laplacian variance, and gradient magnitude energy
    """
    total_handwritten_score = 0
    total_printed_score = 0
    for p in crop_paths:
        img = cv2.imread(p, cv2.IMREAD_GRAYSCALE)
        if img is None:
            continue

        # Feature 1: Average edge strength via Sobel
        # Printed: sharp, uniform edges; Handwritten: softer, irregular edges
        blur = cv2.GaussianBlur(img, (3, 3), 0)
        sobel_x = cv2.Sobel(blur, cv2.CV_64F, 1, 0, ksize=3)
        sobel_y = cv2.Sobel(blur, cv2.CV_64F, 0, 1, ksize=3)
        sobel_mag = np.sqrt(sobel_x**2 + sobel_y**2)
        edge_mean = np.mean(sobel_mag)

        # Feature 2: Laplacian variance (stroke irregularity)
        # Printed: high contrast boundaries; Handwritten: smooth transitions
        lap = cv2.Laplacian(img, cv2.CV_64F)
        lap_var = lap.var()

        # Feature 3: Gradient magnitude energy
        # Printed: steep intensity changes at boundaries; Handwritten: gradual strokes
        gx = cv2.Sobel(img, cv2.CV_32F, 1, 0)
        gy = cv2.Sobel(img, cv2.CV_32F, 0, 1)
        mag = cv2.magnitude(gx, gy)
        grad_energy = np.mean(mag)
 
        # Score based on empirical thresholds
        handwritten_score = 0
        printed_score = 0

        if edge_mean > 108:
            printed_score += 1
        else:
            handwritten_score += 1

        if lap_var > 1800:
            printed_score += 1
        else:
            handwritten_score += 1

        if grad_energy > 165:
            printed_score += 1
        else:
            handwritten_score += 1
        
        if printed_score > handwritten_score:
            total_printed_score += 1  
        else:
            total_handwritten_score += 1

    return "printed" if total_printed_score >= total_handwritten_score else "handwritten"
