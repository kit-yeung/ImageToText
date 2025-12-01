import os
import random
import numpy as np
import torch
from torch.utils.data import Dataset
from PIL import Image
from transformers import TrOCRProcessor, VisionEncoderDecoderModel, Seq2SeqTrainer, Seq2SeqTrainingArguments, default_data_collator, GenerationConfig
import evaluate

# Custom dataset for RIMES
class RimesDataset(Dataset):
    def __init__(self, img_dir, txt_dir, split_name, processor, max_target_length):
        self.img_dir = img_dir
        self.txt_dir = txt_dir
        self.split = split_name
        self.processor = processor
        self.max_target_length = max_target_length

    def __len__(self):
        return len(self.split)

    def __getitem__(self, idx):
        name = self.split[idx]
        img_path = os.path.join(self.img_dir, f'{name}.jpg')
        txt_path = os.path.join(self.txt_dir, f'{name}.txt')
        # Image preprocessing
        image = Image.open(img_path).convert('RGB')
        with open(txt_path, 'r', encoding='utf-8') as f:
            text = f.read().strip()
        # Encode text to add labels
        encoding = self.processor(
            image,
            text,
            padding='max_length',
            max_length=self.max_target_length,
            truncation=True,
            return_tensors='pt',
        )
        return {
            'pixel_values': encoding['pixel_values'].squeeze(0),
            'labels': encoding['labels'].squeeze(0)
        }

# Load split files (train, validation, test)
def load_split_file(path):
    with open(path, 'r') as f:
        return [line.strip() for line in f if line.strip()]

# Define paths
data_dir = './data/RIMES-2011-Lines'
img_dir = os.path.join(data_dir, 'Images')
txt_dir = os.path.join(data_dir, 'Transcriptions')
split_dir = os.path.join(data_dir, 'Sets')
test_split  = load_split_file(os.path.join(split_dir, 'TestLines.txt'))

# Load processor and model
processor = TrOCRProcessor.from_pretrained('microsoft/trocr-base-handwritten', use_fast=True)
model = VisionEncoderDecoderModel.from_pretrained('microsoft/trocr-base-handwritten')

# Initialize test dataset
max_len = 128
test_data = RimesDataset(img_dir, txt_dir, test_split, processor, max_len)

# Define CER and WER metrics
cer_metric = evaluate.load('cer')
wer_metric = evaluate.load('wer')

def compute_metrics(eval_preds):
    pred_ids = eval_preds.predictions
    label_ids = eval_preds.label_ids
    # Decode predictions
    pred_str = processor.batch_decode(pred_ids, skip_special_tokens=True)
    # Replace -100 in labels with pad_token_id for decoding
    label_ids = np.where(label_ids != -100, label_ids, processor.tokenizer.pad_token_id)
    label_str = processor.batch_decode(label_ids, skip_special_tokens=True)
    return {
        'cer': cer_metric.compute(predictions=pred_str, references=label_str),
        'wer': wer_metric.compute(predictions=pred_str, references=label_str)
    }

# Set model configurations
model.config.decoder_start_token_id = processor.tokenizer.eos_token_id
model.config.eos_token_id = processor.tokenizer.eos_token_id
model.config.pad_token_id = processor.tokenizer.pad_token_id
model.config.vocab_size = processor.tokenizer.vocab_size

gen_config = GenerationConfig(
    max_length=128,
    eos_token_id=processor.tokenizer.eos_token_id,
    pad_token_id=processor.tokenizer.pad_token_id,
    decoder_start_token_id=processor.tokenizer.eos_token_id,
    num_beams=4,
    early_stopping=True,
    no_repeat_ngram_size=3,
    length_penalty=1.0,
)
model.generation_config = gen_config

# Initialize trainer
trainer = Seq2SeqTrainer(
    model=model,
    args=Seq2SeqTrainingArguments(predict_with_generate=True),
    tokenizer=processor.feature_extractor,
    data_collator=default_data_collator,
    compute_metrics=compute_metrics,
)

# Evaluate on test data
test_result = trainer.evaluate(test_data, metric_key_prefix='test')
with open('test_base.txt', 'w') as f:
    f.write(f"CER: {test_result['test_cer']}\n")
    f.write(f"WER: {test_result['test_wer']}\n")