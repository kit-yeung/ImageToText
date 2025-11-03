# ImageToText
Text Extraction from Image and Translation with Deep Learning

## DeepReadTransLate Team
- [kit-yeung](https://github.com/kit-yeung) - Project Manager
- [WenAlgo](https://github.com/WenAlgo) - Developer
- [TAHSIN78425](https://github.com/TAHSIN78425) - Designer

## Description
ImageToText is a web application that extracts text or handwriting in a language from an image file that the users provided, then converts it into plain text, and finally translates it into other languages with the help of AI. Using machine learning, ImageToText attempts to reduce the language barrier by providing users with an accurate, convenient, and efficient translation with a user-friendly interface.

<img src="https://github.com/kit-yeung/ImageToText/blob/main/img/flowchart.png">

## Similar Applications
These are some of the existing websites that offer similar functionalities:
- [i2OCR](https://www.i2ocr.com): Convert scanned documents and images into editable text with advanced OCR (Optical Character Recognition) technology.
- [Prepostseo](https://www.prepostseo.com/image-to-text): Obtain text from low-resolution and blurry photos with high accuracy.
- [Google Translate](https://translate.google.com): Extract simple text and complex math equations from images for translation.

Our project will focus on applying deep learning techniques to perform text extraction from images and translation effectively.

## Technologies
- Frontend - React JS,Teseract JS
- Backend - Flask
- Database - SQLite
- Deep Learning - PyTorch
- OCR - EasyOCR (printed), TrOCR (handwritten)
- Language Detection - pycld2
- Translation - M2M100

## Setup Instruction
1. Install project dependencies in backend
```
pip install -r requirements.txt
```
2. Install React in frontend
```
npm install
```

## Run Project
1. Run Flask in backend
```
python app.py
```
2. Run React in frontend
```
npm run dev
```
3. Browse http://localhost:5173

## User Interface (Prototype)
<img src="https://github.com/kit-yeung/ImageToText/blob/main/img/prototype.png">
