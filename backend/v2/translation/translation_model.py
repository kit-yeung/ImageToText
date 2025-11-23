from transformers import MarianMTModel, MarianTokenizer
from functools import lru_cache


@lru_cache()
def load_model(src_lang: str, tgt_lang: str):
    # Load the MarianMT model for the specified language pair
    model_name = f"Helsinki-NLP/opus-mt-{src_lang}-{tgt_lang}"
    tokenizer = MarianTokenizer.from_pretrained(model_name)
    model = MarianMTModel.from_pretrained(model_name)
    return tokenizer, model


def translate_text(text: str, src_lang: str, tgt_lang: str):
    tokenizer, model = load_model(src_lang, tgt_lang)
    batch = tokenizer([text], return_tensors="pt", padding=True, truncation=True)
    generated = model.generate(**batch)
    translated_text = tokenizer.decode(generated[0], skip_special_tokens=True)
    return translated_text
