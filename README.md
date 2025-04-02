# ImageToText
Text Extraction from Image and Translation with Deep Learning

## DeepReadTransLate Team
- [kit-yeung](https://github.com/kit-yeung) - Project Manager
- [WenAlgo](https://github.com/WenAlgo) - Developer
- [TAHSIN78425](https://github.com/TAHSIN78425) - Designer

## Description
ImageToText is a web application which extracts text or handwriting in a language from an image file that the users provided, then converts into plain text, and finally translates into other language with the help of AI. Using machine learning, ImageToText attempts to reduce the language barrier by providing the users an accurate, convenient, and efficient translation with a user-friendly interface.

<img src="https://github.com/kit-yeung/ImageToText/blob/main/img/flowchart.png">

## Similar Applications
These are some of the existing websites that offer similar functionalities:
- [Google Translate](https://translate.google.com)
- [Yandex Translate](https://translate.yandex.com)
- [DeepL Translator](https://www.deepl.com/en/translator)

Our project will focus on applying deep learning technique to perform text extraction from image and translation effectively.

# Subtasks
- Text Extraction
- Text Translation

## Technologies
- Python Libraries - TensorFlow <br/>
- Frontend - React,Tesseract<br/>
- Backend - Flask

## Methodologies
- Neural Machine Translation (NMT):
-- uses an artificial neural network to predict the likelihood of a sequence of words
-- models entire sentences in a single integrated model
(Limitation: NMT tends to produce fairly literal translations and sometimes struggles with technical terms when there is limited high-quality data available for certain languages.)

## Tools/Frameworks
- Google Cloud Vision API:
-- recognizes text and extracts information from images using machine learning
-- provides powerful OCR capabilities including text detection and recognition
  
- Tesseract OCR:
-- Open-source and widely used for text recognition in images. It supports multiple languages.
-- It can be integrated into Python with libraries like pytesseract

- Google Cloud Translation API:
-- Translates text from one language to another.
