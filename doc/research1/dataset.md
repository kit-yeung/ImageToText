# Dataset Collection and Analysis

## Extended MNIST
- **Source**: https://www.kaggle.com/datasets/crawford/emnist
- **Description**: Handwritten English uppercase and lowercase letters and digits derived from NIST database and converted to 28x28 pixel image format
- **Usability**:
  - Preprocessing:
    - Image reshaping and rotation
    - Normalize pixel values to range of 0 to 1
  - Limitations: Contains English letters and digits only, does not cover math symbols, words, or other languages
- **Comparative Analysis**: EMNIST balanced dataset, which has equal number of samples per class, appears to be the most applicable

## Handwritten Math Symbols
- **Source**: https://www.kaggle.com/datasets/xainano/handwrittenmathsymbols
- **Description**:
  - Greek letters, math symbols including arithmetic and set operators, math functions
  - 45x45 jpg files extracted and modified from CROHME dataset
- **Usability**:
  - Preprocessing:
    - Normalize pixel values to range of 0 to 1
    - Split dataset into training and testing
  - Limitations: Class imbalance that lead to the model being biased towards the majority classes
- **Comparative Analysis**: The dataset covers math symbols which EMNIST dataset does not include

## Tab-delimited Bilingual Sentence Pairs
- **Source**: https://www.manythings.org/anki/
- **Description**: Tab-delimited text files containing bilingual sentence pairs (English and other language translations) from Tatoeba Project
- **Usability**:
  - Preprocessing:
    - Split sentences into tokens (individual words)
    - Normalize text by converting to lowercase, removing punctuation, etc.
    - Split dataset into training and testing
  - Limitations: Training translation model requires significant computational power and memory
- **Comparative Analysis**: The dataset covers good amount of data for English and other major language sentence pairs (> 100000)

## Tatoeba Translation Challenge
- **Source**: https://huggingface.co/datasets/Helsinki-NLP/tatoeba_mt
- **Description**: Multilingual dataset derived from Tatoeba.org user-contributed translations. Contains sentence pairs for hundreds of language combinations.
- **Usability**:
  - Preprocessing:
    - Text normalization (lowercasing, punctuation removal).
    - Sentence tokenization and language detection.
    - Splitting into training, validation, and testing subsets for translation model training.
  - Limitations: Some translations may have inconsistencies or user errors. Data coverage varies significantly across different language pairs.
- **Comparative Analysis**: Extensive multilingual dataset useful for training and evaluating OCR-based text extraction and translation systems. High diversity and broad language coverage provide robust training material for image-to-text tasks.

## TextOCR
- **Source**: https://www.kaggle.com/datasets/robikscube/textocr-text-extraction-from-images-dataset
- **Description**:
  - Comprehensive dataset for text extraction from natural images.
  - Contains about 1M high-quality word annotations from various scenes.
  - Key Features: image id, text annotation, point location of text
- **Usability**:
  - Preprocessing: Resizing images and adjusting pixel values
  - Challenges: Handling diverse fonts and obscured text in images
  - Limitations: Not generalizing effectively to multilingual recognition
- **Comparative Analysis**:
  - Data Quality: Arbitrary images with precise annotations
  - Coverage: Large-scale dataset with 1M English word instances
  - Applicability: Requiring additional datasets to support multilingual
