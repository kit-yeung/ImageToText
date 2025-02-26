# Research Paper Review

## [Advancements and Challenges in Handwritten Text Recognition: A Comprehensive Survey](https://www.mdpi.com/2313-433X/10/1/18)
- **Problem Statement**: Overview of existing handwritten text recognition models
- **Dataset**: RIMES dataset containing French handwriting images of ICDAR (International Conference on Document Analysis and Recognition)
- **Methodologies**: Models including Convolutional Neural Network, Convolutional Recurrent Neural Network, sequence-to-sequence Transformer, Bidirectional Long Short-Term Memory
- **Findings and Contributions**:
  - Convolutional and 1D recurrent layers perform better than MDLSTM models
  - Convolutions are faster than LSTMs, and 1D LSTMs are faster than MDLSTMs
- **Relevance**:
  - Preprocessing: binarization, noise removal, resize, rotation, normalization
  - Segmentation: divide text image into characters, words, lines, and paragraphs
  - Feature Extraction: reduce dimensionality of data (Principal Component Analysis)
  - Classification: compare input feature with predefined pattern
  - Post-processing: enhance overall accuracy (dictionary lookup)

## [Deep Learning in Text Recognition and Text Detection: A Review](https://www.irjet.net/archives/V9/i8/IRJET-V9I802.pdf)
- **Problem Statement**: Addresses the challenges of detecting and recognizing text in natural images with deep learning algorithms
- **Dataset**:
  - IAM database for feature extraction from raw images
  - ShopSign dataset for annotation text recognition
  - MNIST dataset for relaxation convolution
- **Methodologies**:
  - Leveraging CNN to extract local features from images for text identification
  - Utilizing artificial neurons to recognize, classify, and analyze images
- **Findings and Contributions**: CNN improved the accuracy of text detection and recognition in complex images
- **Relevance**:
  - Deep learning algorithms used in text detection and recognition such as CNN
  - Normalization protects the data and makes the database more flexible by eliminating redundancy and inconsistent dependency

## [Advancements and Trends in CNN-Based Handwritten Text Recognition: A Comprehensive Survey](https://www.ijarsct.co.in/Paper17573.pdf)
- **Problem Statement**: Overview of the advancements and challenges in text recognition systems.
- **Dataset**: Uses multiple OCR datasets, including scanned text images and multilingual samples.
- **Methodologies**: Techniques include Convolutional Neural Networks (CNNs), Recurrent Neural Networks (RNNs), and hybrid deep learning models.
- **Findings and Contributions**: Hybrid deep learning methods improve text recognition accuracy compared to traditional OCR models.
- **Relevance**:
  - Preprocessing: Noise removal, binarization, resizing.
  - Classification: Model training on large datasets.
  - Post-processing: Enhancing recognition accuracy through linguistic context analysis.
