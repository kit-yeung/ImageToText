# ImageToText
Text Extraction from Image and Translation with Deep Learning

## DeepReadTransLate Team
| Member | Role |
| --- | --- |
| [kit-yeung](https://github.com/kit-yeung) | Project Manager |
| [WenAlgo](https://github.com/WenAlgo) | Developer |
| [TAHSIN78425](https://github.com/TAHSIN78425) | Designer |

## Description
ImageToText is a web application that extracts text or handwriting in a language from an image file that the users provided, then converts it into plain text, and finally translates it into other languages with the help of AI. Using machine learning, ImageToText attempts to reduce the language barrier by providing users with an accurate, convenient, and efficient translation with a user-friendly interface. Our project will focus on applying deep learning techniques to perform text extraction from images and translation effectively.

<img src="https://github.com/kit-yeung/ImageToText/blob/main/img/flowchart.png">

## Features
- Extract printed/handwritten text and detect text language from image uploaded by users
- Translate users input text using NMT/LLM
- Check text extraction/translation history for users
- Support multiple languages

## Technologies
| Component | Description |
| --- | --- |
| Frontend | React (Vite) |
| Backend | Flask |
| Database | SQLite |
| Deep Learning | PyTorch |
| OCR | EasyOCR (printed) |
| | TrOCR (handwritten) |
| Language Detection | pycld2 |
| Translation | M2M100 (NMT) |
| | Phi-4-mini (LLM) |

## Setup Instruction
1. Create and activate virtual environment
```
python -m venv .venv
source .venv/bin/activate
```
2. Install project dependencies in backend
```
pip install -r requirements.txt
```
3. Install React in frontend
```
npm install
```
4. Install Ollama
- Linux
```
curl -fsSL https://ollama.com/install.sh | sh
```
- [Windows](https://ollama.com/download/windows)
- [macOS](https://ollama.com/download/mac)

5. Install model
```
ollama pull phi4-mini
```

## Run Project
1. Activate virtual environment
```
source .venv/bin/activate
```
2. Run Flask in backend
```
python app.py
```
3. Run React in frontend
```
npm run dev
```
4. Browse http://localhost:5173

## User Interface (Prototype)
<img src="https://github.com/kit-yeung/ImageToText/blob/main/img/prototype.png">
