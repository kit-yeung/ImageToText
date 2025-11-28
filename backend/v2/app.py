import os
import torch
import easyocr
import shutil
from werkzeug.utils import secure_filename
from datasets import load_metric
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager, create_access_token,
    jwt_required, get_jwt_identity
)
from database import get_db
import sqlite3
from detect_and_crop import detect_and_crop
from extract_util import run_trocr, detect_language_auto, detect_text_type_auto
from translation_model import translate_text

app = Flask(__name__)

CORS(app, supports_credentials=True)
app.config["JWT_SECRET_KEY"] = "super-secret-key"
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get("name")
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
    username_or_email = data.get("name")
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


@app.route('/api/status', methods=['GET'])
@jwt_required(optional=True)
def status():
    try:
        current_user_id = get_jwt_identity()
        if current_user_id:
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute(
                "SELECT id, username, email FROM users WHERE id = ?",
                (current_user_id,)
            )
            user = cursor.fetchone()  
            if user:
                return jsonify({
                    'logged_in': True,
                    'name': user['username']
                }), 200
        return jsonify({'logged_in': False}), 200
        
    except Exception as e:
        return jsonify({'logged_in': False}), 200


@app.route('/api/extract', methods=['POST'])
def detect_extract():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    input_language = request.form.get('input_language', 'auto')
    text_type = request.form.get('text_type', 'auto')

    # Create temp folders
    UPLOAD_DIR = "uploads"
    CROP_DIR = "crops"
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    os.makedirs(CROP_DIR, exist_ok=True)
    
    file = request.files["image"]
    filename = secure_filename(file.filename)
    path = os.path.join(UPLOAD_DIR, filename)
    file.save(path)

    # 1. Detect + Crop
    crop_paths = detect_and_crop(path, out_dir=CROP_DIR)

    if input_language == "auto":
        input_language = detect_language_auto(crop_paths)
    if text_type == "auto":
        text_type = detect_text_type_auto(crop_paths)

    # 2. EasyOCR
    easyocr_results = {}
    reader = easyocr.Reader(["en", input_language], gpu=False)
    for p in crop_paths:
        result = reader.readtext(p, detail=0)
        easyocr_results[p] = " ".join(result)

    # 3. TrOCR
    trocr_results = {}
    for p in crop_paths:
        trocr_results[p] = run_trocr(p)

    easyocr_full_text = " ".join(easyocr_results.values())
    trocr_full_text = " ".join(trocr_results.values())

    # 4. Compute CER / WER only if ground_truth is provided
    ground_truth = request.form.get('ground_truth', None)
    metrics = {}
    extracted_text = None
    if ground_truth:
        cer_metric = load_metric("cer")
        wer_metric = load_metric("wer")
        metrics['easyocr_cer'] = cer_metric.compute(predictions=[easyocr_full_text], references=[ground_truth])
        metrics['easyocr_wer'] = wer_metric.compute(predictions=[easyocr_full_text], references=[ground_truth]) 
        metrics['trocr_cer'] = cer_metric.compute(predictions=[trocr_full_text], references=[ground_truth])
        metrics['trocr_wer'] = wer_metric.compute(predictions=[trocr_full_text], references=[ground_truth])
        extracted_text = trocr_full_text if metrics['easyocr_cer'] > metrics['trocr_cer'] else easyocr_full_text
    else:
        extracted_text = trocr_full_text if input_language == 'en' and text_type == 'handwritten' else easyocr_full_text

    # Cleanup temp folders
    try:
        if os.path.exists(UPLOAD_DIR):
            shutil.rmtree(UPLOAD_DIR)
        if os.path.exists(CROP_DIR):
            shutil.rmtree(CROP_DIR)
    except Exception as e:
        print(f"Error during cleanup: {e}")

    return jsonify({
        "extracted_text": extracted_text,
        'text_type': text_type,
        'detected_language': input_language,
        "metrics": metrics,
        "easyocr": easyocr_results,
        "trocr": trocr_results 
    })


@app.route('/api/translate', methods=['POST'])
def translate():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No JSON payload provided"}), 400

    text = data.get("text", "")
    src_lang = data.get("input_language", "en")
    tgt_lang = data.get("language", None)  # zh, fr, de, es, it, ru ...

    if not text.strip():
        return jsonify({"error": "Text cannot be empty"}), 400

    if not tgt_lang:
        return jsonify({"error": "tgt_lang is required"}), 400

    try:
        print(f"text:{text},src_lang:{src_lang},tgt_lang:{tgt_lang}")
        translated = translate_text(text, src_lang, tgt_lang)
        return jsonify({
            "input_text": text,
            "translated_text": translated,
            "detected_language": src_lang
        })

    except Exception as e:
        return jsonify({"error": f"Translation failed: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5005)
