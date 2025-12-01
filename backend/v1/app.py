from flask import Flask, request, jsonify, session, send_file
from flask_cors import CORS
from dotenv import load_dotenv
from transformers import TrOCRProcessor, VisionEncoderDecoderModel, M2M100ForConditionalGeneration, M2M100Tokenizer
from PIL import Image
import numpy as np
import torch
import easyocr
import pycld2

import os
import io
from collections import defaultdict
from datetime import datetime

from models.database import db, Users, ExtractHistory, TranslateHistory
from models.llm import llm_translate

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = os.getenv('SECRET_KEY', 'default-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI', 'sqlite:///database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
db.init_app(app)

LANGUAGES = ['en', 'fr']
reader = easyocr.Reader(LANGUAGES, gpu=torch.cuda.is_available())

# Load TrOCR handwritten model
handwritten_processor = TrOCRProcessor.from_pretrained('microsoft/trocr-base-handwritten', use_fast=True)
handwritten_model = VisionEncoderDecoderModel.from_pretrained('microsoft/trocr-base-handwritten')
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
handwritten_model.to(device)

# Load M2M100 model and tokenizer
nmt_model = M2M100ForConditionalGeneration.from_pretrained('facebook/m2m100_418M')
nmt_tokenizer = M2M100Tokenizer.from_pretrained('facebook/m2m100_418M')
nmt_model.to(device)

def preprocess_image(image, line_separation='auto'):
    img_array = np.array(image)
    if line_separation == 'no':
        # Assume image contains only single line of text
        results = reader.readtext(img_array, paragraph=False, detail=1)
        printed_text = [' '.join([text for _, text, _ in results])] if results else []
        confidences = [conf for _, _, conf in results] if results else []
        crop_img = img_array
        if crop_img.shape[0] > 20 and crop_img.shape[1] > 40:
            return printed_text, [Image.fromarray(crop_img).convert('RGB')], confidences
        return printed_text, [], confidences
    else:
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

# Detect language of extracted text
def detect_language(text):
    try:
        _, _, spec = pycld2.detect(text)
        # Use language with highest confidence
        lang = spec[0][1]
        return lang if lang in LANGUAGES else 'en'
    except:
        return 'en'

def compress_image(image_file, max_size=1000):
    image = Image.open(image_file).convert('RGB')
    # Downscale image if too large
    if image.width > max_size or image.height > max_size:
        image.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
    # Save compressed image
    output = io.BytesIO()
    image.save(output, format='WEBP')
    return output.getvalue()

# For user input image from database
@app.route('/api/image/<timestamp>')
def upload_image(timestamp):
    if 'user_name' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    item = ExtractHistory.query.filter_by(
        user_name=session['user_name'],
        timestamp=datetime.fromisoformat(timestamp)
    ).first()
    if not item or not item.image_data:
        return jsonify({'error': 'Image not found'}), 404
    return send_file(
        io.BytesIO(item.image_data),
        mimetype='image/webp',
        as_attachment=False,
        download_name=f'img_{timestamp}.webp'
    )

@app.route('/api/extract', methods=['POST'])
def extract_image_text():
    file = request.files['image']
    text_type = request.form.get('text_type', 'auto')
    input_language = request.form.get('input_language', 'auto')
    line_separation = request.form.get('line_separation', 'auto')
    image = Image.open(file).convert('RGB')
    printed_text, img_lines, confidences = preprocess_image(image, line_separation)
    # Process handwritten text if needed
    handwritten_texts = []
    if text_type in ['auto', 'handwritten'] and img_lines:
        for img_line in img_lines:
            img_line = img_line.resize((384, 384))
            pixel_values = handwritten_processor(img_line, return_tensors='pt').pixel_values.to(device)
            generated_ids = handwritten_model.generate(pixel_values)
            handwritten_text = handwritten_processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
            handwritten_texts.append(handwritten_text)
    # Join lines with newlines
    handwritten_result = '\n'.join(handwritten_texts) if handwritten_texts else ''
    printed_result = '\n'.join(printed_text) if printed_text else ''
    # Determine text type
    if text_type == 'auto':
        # Use EasyOCR for printed text and TrOCR for handwritten text
        avg_confidence = np.mean(confidences) if confidences else 0
        is_handwritten = avg_confidence < 0.8 and handwritten_result.strip() != ''
        extracted_text = handwritten_result if is_handwritten else printed_result
        text_type_detected = 'Handwritten' if is_handwritten else 'Printed'
    else:
        extracted_text = handwritten_result if text_type == 'handwritten' else printed_result
        text_type_detected = 'Handwritten' if text_type == 'handwritten' else 'Printed'
    # Determine language
    language = input_language if input_language != 'auto' else detect_language(extracted_text)
    # Save to history if logged in
    if 'user_name' in session:
        # Read and compress raw data from image
        file.stream.seek(0)
        image_data = file.stream.read()
        image_data = compress_image(io.BytesIO(image_data))
        # Store to database
        history = ExtractHistory(
            user_name=session['user_name'],
            timestamp=datetime.now(),
            image_data=image_data,
            extracted_text=extracted_text,
            text_type=text_type_detected,
            language=language
        )
        db.session.add(history)
        db.session.commit()
    return jsonify({
        'extracted_text': extracted_text,
        'text_type': text_type_detected,
        'detected_language': language
    })

@app.route('/api/translate', methods=['POST'])
def translate_text():
    data = request.get_json()
    text = data.get('text', '').strip()
    language_code = data.get('language', '')
    input_language = data.get('input_language', 'auto')
    translation_model = data.get('translation_model', 'mt')
    if not text or not language_code:
        return jsonify({'error': 'Invalid input'}), 400
    # Determine input language
    detected_language = input_language if input_language != 'auto' else detect_language(text)
    if detected_language not in LANGUAGES:
        return jsonify({'error': f'Unsupported language: {detected_language}'}), 400
    # Return original text if input and output languages are the same
    if detected_language == language_code:
        translated_text = text
    else:
        # Machine translation
        if translation_model == 'nmt':
            nmt_tokenizer.src_lang = detected_language
            # Tokenize input text
            encoded = nmt_tokenizer(
                text,
                return_tensors='pt',
                padding=True,
                truncation=True,
                max_length=1024
            ).to(device)
            # Generate translation
            generated_tokens = nmt_model.generate(
                **encoded,
                forced_bos_token_id=nmt_tokenizer.get_lang_id(language_code),
                max_new_tokens=1024
            )
            translated_text = nmt_tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)[0]
        else:
            # LLM translation
            translated_text = llm_translate(text, language_code)
    # Save to history if logged in
    if 'user_name' in session:
        history = TranslateHistory(
            user_name=session['user_name'],
            timestamp=datetime.now(),
            input_text=text,
            translated_text=translated_text,
            input_language=detected_language,
            output_language=language_code
        )
        db.session.add(history)
        db.session.commit()
    return jsonify({
        'translated_text': translated_text,
        'detected_language': detected_language
    })

@app.route('/api/extract_history', methods=['GET'])
def get_extract_history():
    if 'user_name' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    items = ExtractHistory.query.filter_by(user_name=session['user_name']).order_by(ExtractHistory.timestamp.desc()).all()
    return jsonify([{
        'timestamp': i.timestamp.isoformat(),
        'image_url': f'/api/image/{i.timestamp.isoformat()}',
        'extracted_text': i.extracted_text,
        'text_type': i.text_type,
        'language': i.language
    } for i in items])


@app.route('/api/translate_history', methods=['GET'])
def get_translate_history():
    if 'user_name' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    items = TranslateHistory.query.filter_by(user_name=session['user_name']).order_by(TranslateHistory.timestamp.desc()).all()
    return jsonify([{
        'timestamp': i.timestamp.isoformat(),
        'input_text': i.input_text,
        'translated_text': i.translated_text,
        'input_language': i.input_language,
        'output_language': i.output_language
    } for i in items])

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    name = data.get('name')
    password = data.get('password')
    user = db.session.get(Users, name)
    # Log in if name and password match in database
    if user and user.check_password(password):
        session['user_name'] = user.name
        return jsonify({'message': 'Logged in', 'name': user.name})
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    # Sign up if name not in database
    if db.session.get(Users, name):
        return jsonify({'error': 'Name already used'}), 400
    user = Users(name=name, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'Signed up'})

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out'})

# Return user login status
# Return user login status
@app.route('/api/status', methods=['GET'])
def status():
    if 'user_name' in session:
        user = db.session.get(Users, session['user_name'])
        if user is None:
            session.clear()
            return jsonify({'logged_in': False})
        
        return jsonify({
            'logged_in': True,
            'name': user.name,
            'email': user.email   # <-- ADD THIS
        })

    return jsonify({'logged_in': False})


# Create database tables
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)