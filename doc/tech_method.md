# Project Subtasks

## 1. Image Text Extraction
- **Description**:  
  This subtask involves extracting textual content from images using Optical Character Recognition (OCR) or similar technologies. The goal is to accurately identify and retrieve text embedded in images, regardless of font, size, or background complexity.
  
- **Relevance**:  
  Text extraction from images is critical for applications like document digitization, license plate recognition, and assistive technologies for the visually impaired. It serves as the foundation for further processing, such as translation or analysis.

## 2. Text Translation
- **Description**:  
  This subtask focuses on translating extracted text from one language to another. It involves natural language processing (NLP) techniques to ensure accurate and contextually appropriate translations.
  
- **Relevance**:  
  Text translation is essential for breaking language barriers in global communication, enabling cross-lingual information retrieval, and supporting multilingual applications like customer support and content localization.

---

# Evaluation of Existing Solutions for Image Text Extraction Subtask

## 1. Tesseract OCR
- **Strengths/Effectiveness**:  
  - Open-source and widely used.  
  - Supports multiple languages and scripts.  
  - Can handle a variety of image formats.  
  - Continuously improved by the community.  

- **Weaknesses/Limitations**:  
  - Struggles with low-resolution or noisy images.  
  - Limited accuracy for handwritten text.  
  - Performance drops with complex layouts or non-standard fonts.  

- **Applicability**:  
  Suitable for general-purpose text extraction from printed documents and simple images.  

- **Enhancements/Alternatives**:  
  - Use pre-processing techniques like image binarization or noise reduction.  
  - Combine with deep learning-based OCR models like Google Cloud Vision or AWS Textract for better accuracy.  

- **References**:  
  - Tesseract GitHub repository: [https://github.com/tesseract-ocr/tesseract](https://github.com/tesseract-ocr/tesseract)  

## 2. Google Cloud Vision API
- **Strengths/Effectiveness**: High Accuracy, support for multiple languages, scalability
- **Weaknesses/Limitations**: Free for limited usage (first 1000 units/month)
- **Applicability**: Suitable for document scanning and image search
- **Enhancements/Alternatives**: Use open-source deep learning libraries (e.g. TensorFlow) to build own model
- **References**: https://cloud.google.com/vision/docs

---

# Evaluation of Existing Solutions for Text Translation Subtask

## 1. Google Translate API
- **Strengths/Effectiveness**:  
  - Supports over 100 languages.  
  - High translation accuracy for common languages.  
  - Easy to integrate with applications.  

- **Weaknesses/Limitations**:  
  - Struggles with context-specific or domain-specific translations.  
  - Limited support for low-resource languages.  
  - Costly for high-volume usage.  

- **Applicability**:  
  Suitable for general-purpose translation tasks and multilingual applications.  

- **Enhancements/Alternatives**:  
  - Use fine-tuned models for domain-specific translations (e.g., legal or medical texts).  
  - Explore open-source alternatives like OpenNMT or MarianNMT.  

- **References**:  
  - Google Translate API documentation: [https://cloud.google.com/translate](https://cloud.google.com/translate)  

## 2. SentencePiece
- **Strengths/Effectiveness**:
  - Support a wide range of languages
  - Optimized for performance with the capability of processing large volumes of text quickly
- **Weaknesses/Limitations**: Quality of subword segmentation can affect translation accuracy
- **Applicability**: Suitable for real-time translation applications
- **Enhancements/Alternatives**: Combine with other machine translation models
- **References**: https://github.com/google/sentencepiece
