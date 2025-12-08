# Reference: https://github.com/NielsRogge/Transformers-Tutorials/blob/master/TrOCR/Fine_tune_TrOCR_on_IAM_Handwriting_Database_using_Seq2SeqTrainer.ipynb
# Dataset: https://storage.teklia.com/public/rimes2011/RIMES-2011-Lines.zip

import os
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
data_dir = '../../../backend/v1/data/RIMES-2011-Lines'
img_dir = os.path.join(data_dir, 'Images')
txt_dir = os.path.join(data_dir, 'Transcriptions')
split_dir = os.path.join(data_dir, 'Sets')
train_split = load_split_file(os.path.join(split_dir, 'TrainLines.txt'))
val_split   = load_split_file(os.path.join(split_dir, 'ValidationLines.txt'))
test_split  = load_split_file(os.path.join(split_dir, 'TestLines.txt'))

# Load processor and model
processor = TrOCRProcessor.from_pretrained('microsoft/trocr-base-handwritten', use_fast=True)
model = VisionEncoderDecoderModel.from_pretrained('microsoft/trocr-base-stage1')

# Initialize datasets
max_len = 128
train_data = RimesDataset(img_dir, txt_dir, train_split, processor, max_len)
val_data = RimesDataset(img_dir, txt_dir, val_split, processor, max_len)
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
    decoder_start_token_id=processor.tokenizer.eos_token_id,
    eos_token_id=processor.tokenizer.eos_token_id,
    pad_token_id=processor.tokenizer.pad_token_id,
    num_beams=4,
    early_stopping=True,
    no_repeat_ngram_size=3,
    length_penalty=1.0,
)
model.generation_config = gen_config

# Define training arguments
training_args = Seq2SeqTrainingArguments(
    output_dir='../../../backend/v1/data/trocr-fr-handwritten',
    predict_with_generate=True,
    eval_strategy='steps',
    eval_steps=250,
    save_steps=250,
    logging_steps=250,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    gradient_accumulation_steps=2,
    num_train_epochs=2,
    learning_rate=5e-6,
    warmup_steps=500,
    lr_scheduler_type='cosine',
    weight_decay=0.01,
    fp16=True,
    gradient_checkpointing=True,
    dataloader_num_workers=2,
    save_total_limit=2,
    load_best_model_at_end=True,
    metric_for_best_model='cer',
    greater_is_better=False,
    save_safetensors=False,
)

# Initialize trainer
trainer = Seq2SeqTrainer(
    model=model,
    args=training_args,
    train_dataset=train_data,
    eval_dataset=val_data,
    tokenizer=processor.feature_extractor,
    data_collator=default_data_collator,
    compute_metrics=compute_metrics,
)

# Train model from checkpoint if available
output_dir = training_args.output_dir
if os.path.exists(output_dir) and any(os.path.isdir(os.path.join(output_dir, f)) and f.startswith('checkpoint-') for f in os.listdir(output_dir)):
    trainer.train(resume_from_checkpoint=True)
else:
    trainer.train()

# Save fine-tuned model and processor
trainer.save_model(training_args.output_dir)
processor.save_pretrained(training_args.output_dir)

# Evaluate on test data
test_result = trainer.evaluate(test_data, metric_key_prefix='test')
with open('test_finetune.txt', 'w') as f:
    f.write(f"CER: {test_result['test_cer']}\n")
    f.write(f"WER: {test_result['test_wer']}\n")