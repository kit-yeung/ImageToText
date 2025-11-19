# OCR + Spelling Correction

This project implements:

-   CRAFT text detection (using craft-text-detector)
-   TrOCR recognition (HuggingFace transformers)
-   Edit-distance candidate generation + BERT-MLM scoring for correction
-   WER / CER evaluation (jiwer + editdistance)
-   Flask API for image upload and returning raw & corrected text

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
