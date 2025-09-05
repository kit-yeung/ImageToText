from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import TrOCRProcessor, VisionEncoderDecoderModel, M2M100ForConditionalGeneration, M2M100Tokenizer
from PIL import Image
from collections import defaultdict
import numpy as np
import torch
import easyocr
import pycld2

app = Flask(__name__)
CORS(app)

LANGUAGES = ['en', 'ja']
reader = easyocr.Reader(LANGUAGES, gpu=torch.cuda.is_available())

# Load TrOCR handwritten model
handwritten_processor = TrOCRProcessor.from_pretrained('microsoft/trocr-base-handwritten', use_fast=True)
handwritten_model = VisionEncoderDecoderModel.from_pretrained('microsoft/trocr-base-handwritten')
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
handwritten_model.to(device)

# Load M2M100 model and tokenizer
translation_model = M2M100ForConditionalGeneration.from_pretrained('facebook/m2m100_418M')
translation_tokenizer = M2M100Tokenizer.from_pretrained('facebook/m2m100_418M')
translation_model.to(device)

def preprocess_image(image):
    img_array = np.array(image)
    # Detect text regions with EasyOCR
    results = reader.readtext(img_array, paragraph=False, detail=1)
    # Group regions by lines based on y-coordinate
    line_list = defaultdict(list)
    confidences = []
    for box, text, conf in results:
        y_avg = (box[0][1] + box[2][1]) / 2
        # Round to nearest 10 pixels
        key = round(y_avg / 10) * 10
        line_list[key].append((box, text, conf))
        confidences.append(conf)
    printed_text = []
    img_lines = []
    # Sort lines by y-coordinate
    for key in sorted(line_list.keys()):
        # Sort bounding boxes within the line by x-coordinate
        items = sorted(line_list[key], key=lambda b: b[0][0][0])
        boxes = [item[0] for item in items]
        line_text = ' '.join(item[1] for item in items)
        printed_text.append(line_text)
        # Compute bounding box for each line
        x_min = min(box[0][0] for box in boxes)
        x_max = max(box[1][0] for box in boxes)
        y_min = min(box[0][1] for box in boxes)
        y_max = max(box[2][1] for box in boxes)
        # Apply padding
        x_min = max(0, int(x_min - 10))
        y_min = max(0, int(y_min - 10))
        x_max = min(img_array.shape[1], int(x_max + 10))
        y_max = min(img_array.shape[0], int(y_max + 10))
        # Crop each line for handwritten text
        crop_img = img_array[y_min:y_max, x_min:x_max]
        # Filter out small regions
        if crop_img.shape[0] > 20 and crop_img.shape[1] > 40:
            img_line = Image.fromarray(crop_img).convert('RGB')
            img_lines.append(img_line)
    return printed_text, img_lines, confidences

def detect_language(text):
    _, _, spec = pycld2.detect(text)
    # Use language with highest confidence
    lang = spec[0][1]
    return lang

@app.route('/extract', methods=['POST'])
def extract_image_text():
    file = request.files['image']
    image = Image.open(file).convert('RGB')
    printed_text, img_lines, confidences = preprocess_image(image)
    # For handwritten model
    handwritten_texts = []
    for img_line in img_lines:
        img_line = img_line.resize((384, 384))
        pixel_values = handwritten_processor(img_line, return_tensors='pt').pixel_values.to(device)
        generated_ids = handwritten_model.generate(pixel_values)
        handwritten_text = handwritten_processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
        handwritten_texts.append(handwritten_text)
    # Join lines with newlines
    handwritten_result = '\n'.join(handwritten_texts) if handwritten_texts else ''
    printed_result = '\n'.join(printed_text) if printed_text else ''
    # Use EasyOCR for printed text and TrOCR for handwritten text
    avg_confidence = np.mean(confidences) if confidences else 0
    is_handwritten = avg_confidence < 0.8 and handwritten_result.strip() != ''
    extracted_text = handwritten_result if is_handwritten else printed_result
    # Detect language of extracted text
    language = detect_language(extracted_text)
    return jsonify({
        'extracted_text': extracted_text,
        'text_type': 'Handwritten' if is_handwritten else 'Printed',
        'detected_language': language
    })

@app.route('/translate', methods=['POST'])
def translate_text():
    data = request.get_json()
    text = data.get('text', '')
    language_code = data.get('language', '')
    if not text or not language_code:
        return jsonify({'error': 'Invalid input'}), 400
    try:
        # Detect input language
        detected_language = detect_language(text)
        # Check if input language is supported
        if detected_language not in LANGUAGES:
            return jsonify({'error': f'Unsupported language: {detected_language}'}), 400
        translation_tokenizer.src_lang = detected_language
        # Tokenize input text
        encoded = translation_tokenizer(text, return_tensors='pt', padding=True, truncation=True).to(device)
        # Generate translation
        generated_tokens = translation_model.generate(
            **encoded,
            forced_bos_token_id=translation_tokenizer.get_lang_id(language_code)
        )
        translated_text = translation_tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)[0]
    except Exception as e:
        return jsonify({'error': f'Translation failed: {str(e)}'}), 500
    return jsonify({
        'translated_text': translated_text,
        'detected_language': detected_language
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)