from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import M2M100ForConditionalGeneration, M2M100Tokenizer
from PIL import Image
import numpy as np
import torch
import easyocr

app = Flask(__name__)
CORS(app)

reader = easyocr.Reader(['en'], gpu=torch.cuda.is_available())

# Load M2M100 model and tokenizer
translation_model = M2M100ForConditionalGeneration.from_pretrained('facebook/m2m100_418M')
translation_tokenizer = M2M100Tokenizer.from_pretrained('facebook/m2m100_418M')
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
translation_model.to(device)

LANGUAGES = {
    'English': 'en',
    'Japanese': 'ja'
}

def preprocess_image(image):
    img_array = np.array(image)
    # Detect text regions with EasyOCR
    results = reader.readtext(img_array, paragraph=True)
    extracted_text = [text for _, text in results]
    return extracted_text

@app.route('/extract', methods=['POST'])
def extract_image_text():
    file = request.files['image']
    image = Image.open(file).convert('RGB')
    text = preprocess_image(image)
    # Join lines with newlines
    extracted_text = '\n'.join(text) if text else ''
    return jsonify({'extracted_text': extracted_text})

@app.route('/translate', methods=['POST'])
def translate_text():
    data = request.get_json()
    text = data.get('text', '')
    language = data.get('language', '')
    if not text or not language:
        return jsonify({'error': 'Invalid input'}), 400
    code = LANGUAGES.get(language)
    if not code:
        return jsonify({'error': f'Unsupported language: {language}'}), 400
    try:
        # Set source language
        translation_tokenizer.src_lang = 'en'
        # Tokenize input text
        encoded = translation_tokenizer(text, return_tensors='pt', padding=True, truncation=True).to(device)
        # Generate translation
        generated_tokens = translation_model.generate(
            **encoded,
            forced_bos_token_id=translation_tokenizer.get_lang_id(code)
        )
        translated_text = translation_tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)[0]
    except Exception as e:
        return jsonify({'error': f'Translation failed: {str(e)}'}), 500
    return jsonify({'translated_text': translated_text})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)