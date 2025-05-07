# Paper Reproduction
## Digital Peter: New Dataset, Competition and Handwriting Recognition Methods (2021)
- **Authors**: Mark Potanin, Denis Dimitrov, Vladimir Bataev, Alex Shonenkov, Denis Karachev, Maxim Novopoltsev, and Andrey Chertok
- **Paper**: https://arxiv.org/pdf/2103.09354v2
- **Repository**: https://github.com/MarkPotanin/DigitalPeter
- **Dataset**: https://github.com/ai-forever/digital_peter_aij2020
---
## Original File
- https://github.com/MarkPotanin/DigitalPeter/blob/main/baseline.ipynb

## Modification
- Used PyTorch instead of TensorFlow
- Reduced resized image size from (128, 1024) to (64, 512)
- Reduced number of convolutional layers from 7 to 6
- Reduced number of units in each layer by half
---
## Result Comparison
### Original
- Character error rate: 8.18 %
- Word error rate: 37.88 %
- String accuracy: 26.65 %
### Custom
- Character error rate: 16.32 %
- Word error rate: 66.51 %
- String accuracy: 10.54 %
