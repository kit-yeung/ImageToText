# ImageToText Translator

This project implements:

-   Text Detection: Use CRAFT to detect text regions and crop image patches for recognition.
-   Text Extraction: Use EasyOCR and TrOCR engines to extract text from detected regions. Automatically selects the best OCR result based on accuracy metrics or predefined rules.
-   Evaluation Metrics: Measure performance using Word Error Rate (WER) and Character Error Rate (CER).
-   Text Translation: Translate extracted text to the user-selected target language using Helsinki-NLP MarianMTModel.
-   Frameworks: The Web API is built with Flask.

## Setup Instructions

### Virtual Environment Setup

```bash
# Create virtual environment with Python 3.10
python3.10 -m venv .venv

# Activate virtual environment
source .venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt
```

### Database Initialization

```bash
# Initialize the SQLite database
python database.py
```

### Running the Application

```bash
# Start the Flask app
python app.py
```

### Troubleshooting

If you encounter the following error:

```
AttributeError: partially initialized module 'cv2' has no attribute 'gapi_wip_gst_GStreamerPipeline' (most likely due to a circular import)
```

This is likely due to conflicting OpenCV versions. Fix it by uninstalling all OpenCV versions and reinstalling a stable version:

```bash
pip uninstall -y opencv-python opencv-contrib-python opencv-python-headless
pip install opencv-contrib-python==4.7.0.72
```

## API Endpoints

### 1. Text Extraction

**Endpoint:** `POST /api/extract`

**Request:**

-   Content-Type: `multipart/form-data`
-   Parameters:
    -   `image` (file, required): Image file containing text
    -   `input_language` (text, optional): Language code (e.g., en, fr, ru). Default: auto for automatic detection
    -   `text_type` (text, optional): Text type (handwritten or printed). Default: auto for automatic detection
    -   `ground_truth` (text, optional): Ground truth text for evaluation

**Response:**

```json
{
    "extracted_text": "...",
    "text_type": "handwritten",
    "detected_language": "en",
    "metrics": {
        "easyocr_cer": 0.3888888888888889,
        "easyocr_wer": 0.6363636363636364,
        "trocr_cer": 0.0,
        "trocr_wer": 0.0
    },
    "easyocr": {
        "crops/image_crop_1.jpg": "...",
        "crops/image_crop_2.jpg": "..."
    },
    "trocr": {
        "crops/image_crop_1.jpg": "...",
        "crops/image_crop_2.jpg": "..."
    }
}
```

### 2. Text Translation

**Endpoint:** `POST /api/translate`

**Request:**

-   Content-Type: `application/json`
-   Body:

```json
{
    "text": "This is the test text.",
    "src_lang": "en",
    "tgt_lang": "zh"
}
```

**Response:**

```json
{
    "input_text": "This is the test text.",
    "src_lang": "en",
    "tgt_lang": "zh",
    "translated_text": "这是测试文本。"
}
```

### 3. User Signup

**Endpoint:** `POST /api/signup`

**Request:**

-   Content-Type: `application/json`
-   Body:

```json
{
    "username": "your_username",
    "email": "your_email@example.com",
    "password": "your_password"
}
```

**Response:**

-   Success (201):

```json
{
    "message": "Signup successful!"
}
```

-   Error (400):

```json
{
    "error": "Username, email, and password required"
}
```

or

```json
{
    "error": "Username or email already exists"
}
```

### 4. User Login

**Endpoint:** `POST /api/login`

**Request:**

-   Content-Type: `application/json`
-   Body:

```json
{
    "username": "your_username_or_email",
    "password": "your_password"
}
```

**Response:**

-   Success (200):

```json
{
    "message": "Login successful!",
    "token": "...",
    "username": "your_username_or_email",
    "email": "your_email@example.com"
}
```

-   Error (400):

```json
{
    "error": "Missing username/email or password"
}
```

-   Error (404):

```json
{
    "error": "User not found"
}
```

-   Error (401):

```json
{
    "error": "Incorrect password"
}
```

### 5. User Logout

**Endpoint:** `POST /api/logout`

**Request:**

-   Headers:
    -   `Authorization: Bearer <your_jwt_token>`

**Response:**

-   Success (200):

```json
{
    "message": "Logout successful! Please delete token on client."
}
```

-   Error (401):

```json
{
    "msg": "Missing Authorization Header"
}
```
