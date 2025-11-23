import io, os, traceback
from flask import Flask, request, jsonify
from PIL import Image
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager, create_access_token,
    jwt_required, get_jwt_identity
)
from database import get_db
import sqlite3
from ocr.craft_detect import detect_boxes_from_pil
from ocr.trocr_recognize import TrocrRecognizer
from ocr.easyocr_fallback import easyocr_detect_and_recognize
from utils.sort_and_crop import sort_boxes, crop_from_boxes
from utils.image_preprocess import enhance_for_detection
from corrector.edit_distance import SimpleCandidateGenerator
from corrector.bert_mlm_corrector import BertMLMCorrector
from evaluation.metrics import compute_wer, cer
from translation.translation_model import translate_text
from config import OCR_DEVICE, CROP_PADDING
from wordfreq import top_n_list

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = "super-secret-key"
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# OCR models
recognizer = TrocrRecognizer()
mlm = BertMLMCorrector(device=OCR_DEVICE)

# The vocabulary list uses the top 50,000 most frequent English words from wordfreq
vocab = top_n_list("en", 50000)

# Candidate generator
candidate_gen = SimpleCandidateGenerator(vocab)


@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"error": "Username, email, and password required"}), 400

    password_hash = bcrypt.generate_password_hash(password).decode()

    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
            (username, email, password_hash)
        )
        conn.commit()

    except sqlite3.IntegrityError:
        return jsonify({"error": "Username or email already exists"}), 400

    return jsonify({"message": "Signup successful!"}), 201


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username_or_email = data.get("username")
    password = data.get("password")

    if not username_or_email or not password:
        return jsonify({"error": "Missing username/email or password"}), 400

    conn = get_db()
    cursor = conn.cursor()

    # Allow login by username or email
    cursor.execute("""
        SELECT id, username, email, password_hash
        FROM users
        WHERE username = ? OR email = ?
    """, (username_or_email, username_or_email))

    user = cursor.fetchone()

    if user is None:
        return jsonify({"error": "User not found"}), 404

    if not bcrypt.check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Incorrect password"}), 401

    token = create_access_token(identity=str(user["id"]))

    return jsonify({
        "message": "Login successful!",
        "token": token,
        "username": user["username"],
        "email": user["email"]
    }), 200


@app.route('/api/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({"message": "Logout successful! Please delete token on client."}), 200


@app.route('/api/extract', methods=['POST'])
def api_ocr():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'no image uploaded'}), 400

        file = request.files['image']
        img = Image.open(io.BytesIO(file.read())).convert('RGB')

        # Enhance image for detection
        img_for_detect = enhance_for_detection(img)

        # Run CRAFT text detection
        boxes = detect_boxes_from_pil(img_for_detect)
        raw_texts = []

        # If CRAFT found something
        if boxes:
            boxes_sorted = sort_boxes(boxes)
            crops = crop_from_boxes(img, boxes_sorted, padding=CROP_PADDING)

            for crop in crops:
                try:
                    raw = recognizer.recognize(crop)
                except Exception:
                    raw = ''
                raw_texts.append(raw)

        # Fallback to EasyOCR if CRAFT fails
        if not boxes or all(not t for t in raw_texts):
            try:
                fb_boxes, fb_texts = easyocr_detect_and_recognize(img)
                if fb_texts:
                    raw_texts = fb_texts
            except Exception:
                pass

        # Merge OCR results
        raw_sentence = ' '.join([t for t in raw_texts if t]).strip()

        # Correction
        tokens = raw_sentence.split()
        corrected_tokens = mlm.correct_sentence(tokens, candidate_gen) if tokens else []
        corrected_sentence = ' '.join(corrected_tokens).strip()

        # Metrics 
        ground = request.form.get('ground_truth', None)
        metrics = {}

        if ground:
            metrics['wer_before'] = compute_wer(ground, raw_sentence)
            metrics['wer_after'] = compute_wer(ground, corrected_sentence)
            metrics['cer_before'] = cer(ground, raw_sentence)
            metrics['cer_after'] = cer(ground, corrected_sentence)

        return jsonify({
            'raw': raw_sentence,
            'corrected': corrected_sentence,
            'metrics': metrics
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': 'internal error', 'details': str(e)}), 500


@app.route('/api/translation', methods=['POST'])
def translation_api():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No JSON payload provided"}), 400

    text = data.get("text", "")
    src_lang = data.get("src_lang", "en")
    tgt_lang = data.get("tgt_lang", None)  # zh, fr, de, es, it, ru ...

    if not text.strip():
        return jsonify({"error": "Text cannot be empty"}), 400

    if not tgt_lang:
        return jsonify({"error": "tgt_lang is required"}), 400

    try:
        translated = translate_text(text, src_lang, tgt_lang)
        return jsonify({
            "input_text": text,
            "translated_text": translated,
            "src_lang": src_lang,
            "tgt_lang": tgt_lang
        })

    except Exception as e:
        return jsonify({"error": f"Translation failed: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5005)
