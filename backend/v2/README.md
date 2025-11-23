# ImageToText Translator

This project implements:

-   Text Detection: Use CRAFT to detect text regions and crop image patches for recognition.
-   Text Recognition: Apply TrOCR for English printed/handwritten text.
-   Text Correction: Edit-distance candidate generation with BERT-MLM scoring for correction
-   Evaluation Metrics: Measure performance using Word Error Rate (WER) and Character Error Rate (CER) with jiwer and editdistance.
-   Dataset: Bentham Handwritten Dataset for training the TrOCR model on English handwritten text recognition tasks.
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
