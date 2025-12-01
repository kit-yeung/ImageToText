import requests

def llm_translate(text, language_code):
    lang_map = {'en': 'English', 'fr': 'French'}
    target_lang = lang_map.get(language_code, 'English')
    
    system_prompt = (
        'You are a precise translator. Output only the translated text in the target language.'
        'Never add explanations, notes, answers to questions, or extra content.'
        'Preserve formatting, line breaks, and punctuation exactly. Fix obvious OCR/spelling errors naturally.'
    )
    user_prompt = f'Translate the following to {target_lang}:\n\n{text}'
    
    ollama_response = requests.post(
        'http://localhost:11434/api/chat',
        json={
            'model': 'phi4-mini',
            'messages': [
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_prompt}
            ],
            'options': {
                # Deterministic output for translation
                'temperature': 0.0,    
                'num_ctx': 8192,
                'num_predict': 1024
            },
            'stream': False
        },
        timeout=60
    )
    
    ollama_response.raise_for_status()
    return ollama_response.json()['message']['content'].strip()