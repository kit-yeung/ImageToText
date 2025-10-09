# Reference: https://github.com/NielsRogge/Transformers-Tutorials/blob/master/TrOCR/Fine_tune_TrOCR_on_IAM_Handwriting_Database_using_Seq2SeqTrainer.ipynb
# Dataset: https://storage.teklia.com/public/rimes2011/RIMES-2011-Lines.zip

import os
import torch
from torch.utils.data import Dataset
from PIL import Image
from transformers import TrOCRProcessor, VisionEncoderDecoderModel, Seq2SeqTrainer, Seq2SeqTrainingArguments, default_data_collator
import evaluate

# Custom dataset for RIMES
class RimesDataset(Dataset):
    def __init__(self, image_dir, text_dir, split, processor, max_target_length=128):
        self.image_dir = image_dir
        self.text_dir = text_dir
        self.split = split
        self.processor = processor
        self.max_target_length = max_target_length

    def __len__(self):
        return len(self.split)

    def __getitem__(self, idx):
        split = self.split[idx]
        image_path = os.path.join(self.image_dir, f'{split}.jpg')
        text_path = os.path.join(self.text_dir, f'{split}.txt')
        # Image preprocessing
        image = Image.open(image_path).convert('RGB')
        pixel_values = self.processor(image, return_tensors='pt').pixel_values.squeeze()
        # Encode text to add labels
        with open(text_path, 'r', encoding='utf-8') as f:
            text = f.read().strip()
        labels = self.processor.tokenizer(
            text,
            padding='max_length',
            max_length=self.max_target_length,
            truncation=True
        ).input_ids
        # Ensure PAD tokens are ignored by loss function
        labels = [label if label != self.processor.tokenizer.pad_token_id else -100 for label in labels]
        return {'pixel_values': pixel_values, 'labels': torch.tensor(labels)}

# Load split files (train, validation, test)
def load_split_file(set_path):
    with open(set_path, 'r') as f:
        split = [line.strip() for line in f if line.strip()]
    return split

# Define paths
data_dir = './data/RIMES-2011-Lines'
image_dir = os.path.join(data_dir, 'Images')
text_dir = os.path.join(data_dir, 'Transcriptions')
split_dir = os.path.join(data_dir, 'Sets')
train_split = load_split_file(os.path.join(split_dir, 'TrainLines.txt'))
val_split = load_split_file(os.path.join(split_dir, 'ValidationLines.txt'))
test_split = load_split_file(os.path.join(split_dir, 'TestLines.txt'))

# Load processor and model
processor = TrOCRProcessor.from_pretrained('microsoft/trocr-base-handwritten', use_fast=True)
model = VisionEncoderDecoderModel.from_pretrained('microsoft/trocr-base-stage1')

# Initialize datasets
train_dataset = RimesDataset(image_dir, text_dir, train_split, processor)
val_dataset = RimesDataset(image_dir, text_dir, val_split, processor)
test_dataset = RimesDataset(image_dir, text_dir, test_split, processor)

# Define CER metric
cer_metric = evaluate.load('cer')

def compute_metrics(pred):
    pred_ids = pred.predictions
    labels_ids = pred.label_ids
    pred_str = processor.batch_decode(pred_ids, skip_special_tokens=True)
    labels_ids[labels_ids == -100] = processor.tokenizer.pad_token_id
    label_str = processor.batch_decode(labels_ids, skip_special_tokens=True)
    result = cer_metric.compute(predictions=pred_str, references=label_str)
    return {'cer': result}

# Set model configurations
model.config.decoder_start_token_id = processor.tokenizer.cls_token_id
model.config.pad_token_id = processor.tokenizer.pad_token_id
model.config.eos_token_id = processor.tokenizer.sep_token_id
model.config.vocab_size = processor.tokenizer.vocab_size
model.config.max_length = 128
model.config.early_stopping = True
model.config.no_repeat_ngram_size = 3
model.config.length_penalty = 2.0
model.config.num_beams = 4

# Define training arguments
training_args = Seq2SeqTrainingArguments(
    predict_with_generate=True,
    eval_strategy='steps',
    per_device_train_batch_size=4,
    per_device_eval_batch_size=4,
    gradient_accumulation_steps=2,
    gradient_checkpointing=True,
    fp16=True,
    output_dir='./trocr-rimes',
    logging_steps=500,
    save_steps=500,
    eval_steps=500,
    num_train_epochs=2,
    learning_rate=5e-5,
    save_total_limit=2,
    load_best_model_at_end=True,
    metric_for_best_model='cer',
    greater_is_better=False,
    save_safetensors=False,
)

# Initialize trainer
trainer = Seq2SeqTrainer(
    model=model,
    processing_class=processor,
    args=training_args,
    compute_metrics=compute_metrics,
    train_dataset=train_dataset,
    eval_dataset=val_dataset,
    data_collator=default_data_collator,
)

# Train model from checkpoint if available
output_dir = './trocr-rimes'
if os.path.exists(output_dir) and any(os.path.isdir(os.path.join(output_dir, f)) and f.startswith('checkpoint-') for f in os.listdir(output_dir)):
    trainer.train(resume_from_checkpoint=True)
else:
    trainer.train()

# Save fine-tuned model and processor
trainer.save_model(output_dir)
processor.save_pretrained(output_dir)

# Evaluate on test data
test_results = trainer.evaluate(test_dataset)
print('Test CER:', test_results['eval_cer'])