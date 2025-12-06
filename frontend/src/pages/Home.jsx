import React, { useState, useRef } from 'react';
import Load from '../assets/download.gif';
import API_BASE_URL from '../config/api';

function Home() {
	// For text extraction
	const [image, setImage] = useState(null);
	const [text, setText] = useState('');
	const [textType, setTextType] = useState('');
	const [selectTextType, setSelectTextType] = useState('auto');
	const [inputLangExtract, setInputLangExtract] = useState('auto');
	const [lineSeparation, setLineSeparation] = useState('auto');
	const [detectLangExtract, setDetectLangExtract] = useState('');
	const [loadExtract, setLoadExtract] = useState(false);
	const [showDetectionInfo, setShowDetectionInfo] = useState(false);
	// For translation
	const [translation, setTranslation] = useState('');
	const [detectLangTranslate, setDetectLangTranslate] = useState('');
	const [translateLang, setTranslateLang] = useState('English');
	const [translateModel, setTranslateModel] = useState('nmt');
	const [loadTranslate, setLoadTranslate] = useState(false);
	
	const [error, setError] = useState('');
	// Create a ref for the file input
	const fileInputRef = useRef(null);
	
	const ocrLangMap = {
        auto: "auto",
        abq: "Abaza",
        ady: "Adyghe",
        af: "Afrikaans",
        sq: "Albanian",
        as: "Assamese",
        ava: "Avaric",
        az: "Azerbaijani",
        eu: "Basque",
        be: "Belarusian",
        bn: "Bengali",
        bg: "Bulgarian",
        ca: "Catalan",
        che: "Chechen",
        ch_sim: "Chinese (Simplified)",
        ch_tra: "Chinese (Traditional)",
        hr: "Croatian",
        cs: "Czech",
        da: "Danish",
        dar: "Dargwa",
        nl: "Dutch",
        en: "English",
        et: "Estonian",
        fi: "Finnish",
        fr: "French",
        gl: "Galician",
        de: "German",
        hi: "Hindi",
        hu: "Hungarian",
        is: "Icelandic",
        id: "Indonesian",
        inh: "Ingush",
        ga: "Irish (Gaelic)",
        it: "Italian",
        ja: "Japanese",
        jv: "Javanese",
        kbd: "Kabardian",
        kn: "Kannada",
        kk: "Kazakh",
        ko: "Korean",
        ky: "Kyrgyz",
        lbe: "Lak",
        la: "Latin",
        lv: "Latvian",
        lez: "Lezghian",
        lt: "Lithuanian",
        ms: "Malay",
        ml: "Malayalam",
        mt: "Maltese",
        mi: "Maori",
        mr: "Marathi",
        mn: "Mongolian",
        ne: "Nepali",
        no: "Norwegian",
        oc: "Occitan",
        pl: "Polish",
        pt: "Portuguese",
        ro: "Romanian",
        ru: "Russian",
        rs_cyrillic: "Serbian (Cyrillic)",
        sk: "Slovak",
        es: "Spanish",
        su: "Sundanese",
        sv: "Swedish",
        tab: "Tabassaran",
        tl: "Tagalog",
        tg: "Tajik",
        ta: "Tamil",
        te: "Telugu",
        th: "Thai",
        tk: "Turkmen",
        tr: "Turkish",
        uk: "Ukrainian",
        uz: "Uzbek",
        vi: "Vietnamese",
        cy: "Welsh",
    };
	
    const translateLangMap = {
        abq: "Abaza",
        ady: "Adyghe",
        af: "Afrikaans",
        sq: "Albanian",
        as: "Assamese",
        ava: "Avaric",
        az: "Azerbaijani",
        eu: "Basque",
        be: "Belarusian",
        bn: "Bengali",
        bg: "Bulgarian",
        ca: "Catalan",
        che: "Chechen",
        zh: "Chinese",
        hr: "Croatian",
        cs: "Czech",
        da: "Danish",
        dar: "Dargwa",
        nl: "Dutch",
        en: "English",
        et: "Estonian",
        fi: "Finnish",
        fr: "French",
        gl: "Galician",
        de: "German",
        hi: "Hindi",
        hu: "Hungarian",
        is: "Icelandic",
        id: "Indonesian",
        inh: "Ingush",
        ga: "Irish (Gaelic)",
        it: "Italian",
        ja: "Japanese",
        jv: "Javanese",
        kbd: "Kabardian",
        kn: "Kannada",
        kk: "Kazakh",
        ko: "Korean",
        ky: "Kyrgyz",
        lbe: "Lak",
        la: "Latin",
        lv: "Latvian",
        lez: "Lezghian",
        lt: "Lithuanian",
        ms: "Malay",
        ml: "Malayalam",
        mt: "Maltese",
        mi: "Maori",
        mr: "Marathi",
        mn: "Mongolian",
        ne: "Nepali",
        no: "Norwegian",
        oc: "Occitan",
        pl: "Polish",
        pt: "Portuguese",
        ro: "Romanian",
        ru: "Russian",
        rs_cyrillic: "Serbian (Cyrillic)",
        sk: "Slovak",
        es: "Spanish",
        su: "Sundanese",
        sv: "Swedish",
        tab: "Tabassaran",
        tl: "Tagalog",
        tg: "Tajik",
        ta: "Tamil",
        te: "Telugu",
        th: "Thai",
        tk: "Turkmen",
        tr: "Turkish",
        uk: "Ukrainian",
        uz: "Uzbek",
        vi: "Vietnamese",
        cy: "Welsh",
    };
	
	const handleImage = async (e) => {
		// Get file input
		const file = e.target.files[0];
		if (!file) return;
		setImage(URL.createObjectURL(file));
		setLoadExtract(true);
		setError('');
		setText('');
		setTextType('');
		setDetectLangExtract('');
		setTranslation('');
		setShowDetectionInfo(false);
		
		const formData = new FormData();
		formData.append('image', file);
		formData.append('text_type', selectTextType);
		formData.append('input_language', inputLangExtract);
		formData.append('line_separation', lineSeparation);
		
		// Extract text from image
		try {
			const res = await fetch(`${API_BASE_URL}/api/extract`, {
				method: 'POST',
				credentials: 'include',
				body: formData,
			});
			const data = await res.json();
			
			if (data.extracted_text) {
				setText(data.extracted_text);
				setTextType(data.text_type || 'Unknown');
				setDetectLangExtract(ocrLangMap[data.detected_language] || data.detected_language || 'Unknown');
				setShowDetectionInfo(true);
			}
			else {
				setError('No text detected');
			}
		}
		catch (err) {
			setError('Extraction failed');
		}
		finally {
			setLoadExtract(false);
		}
	};
	
	const handleTranslate = async (e) => {
		e.preventDefault();
		if (!text.trim() || !translateLang) {
			setError('Text and target language required');
			return;
		}
		setLoadTranslate(true);
		setError('');
		setTranslation('');
		// Convert selected language to code
		const langCode = Object.keys(translateLangMap).find(k => translateLangMap[k] === translateLang);
		// Split long text into parts for machine translation
		const parts = splitText(text);
		try {
			const translations = [];
			for (let i = 0; i < parts.length; i++) {
				const res = await fetch(`${API_BASE_URL}/api/translate`, {
					method: 'POST',
					credentials: 'include',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						text: parts[i],
						language: langCode,
						input_language: inputLangExtract,
						translation_model: translateModel
					}),
				});
				const data = await res.json();
				translations.push(data.translated_text || 'Translation failed');
				if (data.detected_language && detectLangTranslate !== (translateLangMap[data.detected_language] || 'Unknown')) {
					setDetectLangTranslate(translateLangMap[data.detected_language] || 'Unknown');
				}
			}
			// Join translated parts
			setTranslation(translations.join(''));
		}
		catch (err) {
			setError('Translation failed');
		}
		finally {
			setLoadTranslate(false);
		}
	};
	
	const splitText = (text) => {
		const maxLength = 512;
		const parts = [];
		for (let i = 0; i < text.length; i += maxLength) {
			parts.push(text.substring(i, Math.min(i + maxLength, text.length)));
		}
		return parts;
	};
	
	const copyTranslation = () => {
		if (translation.trim()) {
			setText(translation.trim());
			setTranslation('');
			setError('');
		}
	};
	
	// Clear all forms' inputs, including file input
	const clearAll = () => {
		setImage(null);
		setText('');
		setTranslation('');
		setError('');
		setTextType('');
		setDetectLangExtract('');
		setShowDetectionInfo(false);
		setSelectTextType('auto');
		setInputLangExtract('auto');
		setLineSeparation('auto');
		setTranslateLang('English');
		setTranslateModel('nmt');
		// Reset the file input field
		if (fileInputRef.current)
			fileInputRef.current.value = '';
	};
	
	return (
		<div className='container'>
			<div className='main'>
				{/* Extraction */}
				<div className='card'>
					<h2>Extract Text from Image</h2>
				
				<div className='form-group'>
					<label className='select-label'>Text Type</label>
					<select value={selectTextType} onChange={e => setSelectTextType(e.target.value)} className='select'>
						<option value='auto'>Auto</option>
						<option value='printed'>Printed</option>
						<option value='handwritten'>Handwritten</option>
					</select>
				</div>
				
				<div className='form-group'>
					<label className='select-label'>Input Language</label>
					<select value={inputLangExtract} onChange={e => setInputLangExtract(e.target.value)} className='select'>
						<option value='auto'>Auto</option>
						{Object.entries(ocrLangMap).map(([k, v]) => (
							<option key={k} value={k}>{v}</option>
						))}
					</select>
				</div>
				
				<div className='form-group'>
					<label className='select-label'>Crop Handwriting by Line</label>
					<select value={lineSeparation} onChange={e => setLineSeparation(e.target.value)} className='select'>
						<option value='auto'>On</option>
						<option value='no'>Off</option>
					</select>
				</div>
				
				<input
					ref={fileInputRef}
					type='file'
					accept='image/*'
					onChange={handleImage}
					className='input-file'
				/>
				
				{loadExtract && (
					<div className='loading-container'>
						<img src={Load} alt='Processing...' className='loading-icon' />
						<p>Extracting text...</p>
					</div>
				)}
				
				{image && !loadExtract && (
					<div className='image-preview'>
						<img src={image} alt='Image' />
					</div>
				)}
				
				{showDetectionInfo && (
					<div className='result'>
						<p><strong>Detected Type:</strong> {textType}</p>
						<p><strong>Detected Language:</strong> {detectLangExtract}</p>
					</div>
				)}
			</div>
			
				{/* Translation */}
				<div className='card'>
					<h2>Translate Text</h2>
					<form onSubmit={handleTranslate}>
						<label className='select-label'>Input Text</label>
						<textarea
							value={text}
							onChange={e => setText(e.target.value)}
							placeholder='Extracted text will show here'
							className='textarea'
							rows='8'
						/>
						
						<label className='select-label'>Output Language</label>
						<select
							value={translateLang}
							onChange={e => setTranslateLang(e.target.value)}
							className='select'
							required
						>
							<option value='English'>English</option>
							{Object.values(translateLangMap).filter(lang => lang !== 'English').map(lang => (
								<option key={lang} value={lang}>{lang}</option>
							))}
						</select>
						
						<label className='select-label'>Translation Model</label>
						<select value={translateModel} onChange={e => setTranslateModel(e.target.value)} className='select'>
							<option value='nmt'>Machine Translation</option>
							<option value='llm'>Generative AI</option>
						</select>
						
						<button
							type='submit'
							className='translate-button'
							disabled={loadExtract || loadTranslate || !text.trim() || !translateLang}
						>
							Translate
						</button>
					</form>
					
					{loadTranslate && (
						<div className='loading-container'>
							<img src={Load} alt='Translating...' className='loading-icon' />
							<p>Translating...</p>
						</div>
					)}
					
					{translation && !loadTranslate && (
						<div style={{ marginTop: '1.5rem' }}>
							<label className='select-label'>Translation</label>
							<textarea value={translation} readOnly className='textarea' rows='8' />
							{detectLangTranslate && (
							<div className='result'>
								<p><strong>Detected Language:</strong> {detectLangTranslate}</p>
							</div>
							)}
							<button
								type='button'
								onClick={copyTranslation}
								className='translate-button'
							>
								Copy Translation to Input
							</button>
						</div>
					)}
				</div>
			</div>
			{error && <div className='error'>{error}</div>}
			<button onClick={clearAll} className='clear-button'>Clear All</button>
		</div>
	);
}

export default Home;