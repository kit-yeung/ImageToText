from transformers import MarianMTModel, MarianTokenizer
from functools import lru_cache
import torch
from langdetect import detect, DetectorFactory, LangDetectException


class TranslationNotSupported(Exception):
    pass


@lru_cache(maxsize=8)
def load_model(src_lang: str, tgt_lang: str):
    # Load the MarianMT model for the specified language pair
    model_name = f"Helsinki-NLP/opus-mt-{src_lang}-{tgt_lang}"
    tokenizer = MarianTokenizer.from_pretrained(model_name)
    model = MarianMTModel.from_pretrained(model_name)
    model.eval()
    return tokenizer, model


def translate_text(text: str, src_lang: str, tgt_lang: str):
    if not text.strip():
        return ""
    if src_lang == tgt_lang:
        return text

    # Case 1: direct translation
    try:
        tokenizer, model = load_model(src_lang, tgt_lang)
        batch = tokenizer([text], return_tensors="pt", padding=True, truncation=True)
        with torch.no_grad():
            generated = model.generate(**batch)
        translated_text = tokenizer.decode(generated[0], skip_special_tokens=True)
        return translated_text
    except OSError:
        pass

    # Case 2: pivot via English
    if src_lang != "en" and tgt_lang != "en":
        try:
            # src -> en
            tokenizer1, model1 = load_model(src_lang, "en")
            batch1 = tokenizer1([text], return_tensors="pt", padding=True, truncation=True)
            with torch.no_grad():
                en_ids = model1.generate(**batch1)
            en_text = tokenizer1.decode(en_ids[0], skip_special_tokens=True)

            # en -> tgt
            tokenizer2, model2 = load_model("en", tgt_lang)
            batch2 = tokenizer2([en_text], return_tensors="pt", padding=True, truncation=True)
            with torch.no_grad():
                tgt_ids = model2.generate(**batch2)
            return tokenizer2.decode(tgt_ids[0], skip_special_tokens=True)

        except OSError:
            raise TranslationNotSupported(
                f"Translation to '{tgt_lang}' is not supported."
            )

    raise TranslationNotSupported(
        f"Translation from '{src_lang}' to '{tgt_lang}' is not supported."
    )


DetectorFactory.seed = 0

def detect_text_language_auto(text: str, default: str = "en") -> str:
    """
    Automatically detect language from raw text and return a language code.
    """
    if not text or not text.strip():
        return default

    try:
        lang = detect(text)
        return lang

    except LangDetectException:
        # Text too short or ambiguous
        return default
