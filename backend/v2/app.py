import io
import os
import torch
import easyocr
import shutil
from werkzeug.utils import secure_filename
from datasets import load_metric
from datetime import datetime
from flask import send_file
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
from extract_util import run_trocr, detect_img_language_auto, detect_text_type_auto
from translation_model import translate_text, detect_text_language_auto

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
        "name": user["username"],
        "email": user["email"]
    }), 200


@app.route('/api/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({"message": "Logout successful! Please delete token on client."}), 200


@app.route('/api/status', methods=['GET'])
@jwt_required(optional=True)
def status():
    current_user_id = get_jwt_identity()  # Get user ID from JWT
    if current_user_id:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, username, email FROM users WHERE id = ?",
            (current_user_id,)
        )
        user = cursor.fetchone()
        conn.close()
        
        if user:
            return jsonify({
                'logged_in': True,
                'name': user['username'],
                'email': user['email']
            }), 200

    return jsonify({'logged_in': False}), 200


@app.route('/api/extract', methods=['POST'])
@jwt_required(optional=True)
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

    # Detect + Crop
    crop_paths = detect_and_crop(path, out_dir=CROP_DIR)
    if not crop_paths:
        return jsonify({
            "extracted_text": "",
            "text_type": text_type,
            "detected_language": input_language
        })

    if input_language == "auto":
        input_language = detect_img_language_auto(crop_paths)
    if text_type == "auto":
        text_type = detect_text_type_auto(crop_paths)

    # Run OCR based on text type
    if text_type == 'handwritten':
        trocr_results = {}
        for p in crop_paths:
            trocr_results[p] = run_trocr(p)
        extracted_text = "\n".join(trocr_results.values())
    else:
        easyocr_results = {}
        reader = easyocr.Reader(["en", input_language], gpu=False)
        for p in crop_paths:
            result = reader.readtext(p, detail=0)
            easyocr_results[p] = " ".join(result)
        extracted_text = "\n".join(easyocr_results.values())

    # Save extraction history into SQLite for authenticated users
    current_user_id = get_jwt_identity()
    if current_user_id:     
        with open(path, "rb") as f:
            image_bytes = f.read() # Read image bytes for saving to DB
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO extract_history (user_id, timestamp, image_data, extracted_text, text_type, language)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (current_user_id, datetime.now().isoformat(), image_bytes, extracted_text, text_type, input_language))
        conn.commit()
        conn.close()

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
        'detected_language': input_language
    })


@app.route('/api/translate', methods=['POST'])
@jwt_required(optional=True)
def translate():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON payload provided"}), 400

    text = data.get("text", "")
    src_lang = data.get("input_language", "auto")
    tgt_lang = data.get("language", None)

    if not tgt_lang:
        return jsonify({"error": "tgt_lang is required"}), 400
    if src_lang == "auto":
        src_lang = detect_text_language_auto(text)
    if src_lang in ("ch_sim", "zh-cn"):
        src_lang = "zh"

    try:
        translated = translate_text(text, src_lang, tgt_lang)
    except Exception as e:
        return jsonify({"error": f"Translation failed: {str(e)}"}), 500

    if src_lang == "zh":
        src_lang = "ch_sim"

    # Save translation history into SQLite for authenticated users
    current_user_id = get_jwt_identity()
    if current_user_id:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO translate_history (user_id, timestamp, input_text, translated_text, input_language, output_language)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (current_user_id, datetime.now().isoformat(), text, translated, src_lang, tgt_lang))
        conn.commit()
        conn.close()

    return jsonify({
        "input_text": text,
        "translated_text": translated,
        "detected_language": src_lang
    })


@app.route('/api/extract_history', methods=['GET'])
@jwt_required()
def get_extract_history():
    current_user_id = get_jwt_identity()
    if current_user_id:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT timestamp, extracted_text, text_type, language
            FROM extract_history
            WHERE user_id = ?
            ORDER BY timestamp DESC
        """, (current_user_id, ))
        rows = cursor.fetchall() 
        result = []
        for r in rows:
            result.append({
                "timestamp": r["timestamp"],
                "image_url": f"/api/image/{r['timestamp']}",
                "extracted_text": r["extracted_text"],
                "text_type": r["text_type"],
                "language": r["language"]
            })
        conn.close()
        return jsonify(result), 200
    return jsonify({'error': 'Unauthorized'}), 401


@app.route('/api/translate_history', methods=['GET'])
@jwt_required()
def get_translate_history():
    current_user_id = get_jwt_identity()
    if current_user_id:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT timestamp, input_text, translated_text, input_language, output_language
            FROM translate_history
            WHERE user_id = ?
            ORDER BY timestamp DESC
        """, (current_user_id, ))
        rows = cursor.fetchall() 
        result = []
        for r in rows:
            result.append({
                "timestamp": r["timestamp"],
                "input_text": r["input_text"],
                "translated_text": r["translated_text"],
                "input_language": r["input_language"],
                "output_language": r["output_language"]
            })
        conn.close()
        return jsonify(result), 200
    return jsonify({'error': 'Unauthorized'}), 401


@app.route('/api/image/<timestamp>', methods=['GET'])
@jwt_required()
def get_extracted_image(timestamp):
    current_user_id = get_jwt_identity()
    if current_user_id:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT image_data FROM extract_history
            WHERE user_id = ? AND timestamp = ?
        """, (current_user_id, timestamp))
        row = cursor.fetchone()
        conn.close()
        if row is None or row["image_data"] is None:
            return jsonify({"error": "Image not found"}), 404

        image_bytes = row["image_data"]
        return send_file(
            io.BytesIO(image_bytes),
            mimetype='image/webp',
            as_attachment=False,
            download_name=f'img_{timestamp}.webp'
        )
    return jsonify({'error': 'Unauthorized'}), 401


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5005)
