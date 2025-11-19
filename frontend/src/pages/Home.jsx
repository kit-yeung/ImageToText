import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
	// User login
	const navigate = useNavigate();
	
	const [loggedIn, setLoggedIn] = useState(false);
	const [name, setName] = useState('');
	
	const checkAuth = async () => {
		const res = await fetch('http://localhost:5000/api/status', {
			credentials: 'include',
		});
		const data = await res.json();
		setLoggedIn(data.logged_in);
		if (data.logged_in)
			setName(data.name);
	};
	
	const logout = async () => {
		await fetch('http://localhost:5000/api/logout', {
			method: 'POST',
			credentials: 'include',
		});
		setLoggedIn(false);
		setEmail('');
	};
	
	useEffect(() => {
		checkAuth();
	}, []);
	
	// Text extraction and translation
	const [image, setImage] = useState(null);
	const [text, setText] = useState('');
	const [textType, setTextType] = useState('');
	const [languageOut, setLanguageOut] = useState('');
	const [languageIn, setLanguageIn] = useState('');
	const [language, setLanguage] = useState('');
	const [inputLanguage, setInputLanguage] = useState('auto');
	const [selectedTextType, setSelectedTextType] = useState('auto');
	const [lineSeparation, setLineSeparation] = useState('auto');
	const [translationModel, setTranslationModel] = useState('nmt');
	const [translation, setTranslation] = useState(null);
	const [loading, setLoading] = useState(false);
	const [uploaded, setUploaded] = useState(false);
	const [error, setError] = useState(null);

	const languageMap = {
		'auto': 'auto',
		'en': 'English',
		'fr': 'French',
	};

	const textTypeOptions = ['auto', 'printed', 'handwritten'];
	const lineSeparationOptions = ['auto', 'no'];

	const handleImage = async (e) => {
		// Get file input
		const file = e.target.files[0];
		if (file) {
			setImage(URL.createObjectURL(file));
			setLoading(true);
			setError(null);
			const formData = new FormData();
			formData.append('image', file);
			formData.append('text_type', selectedTextType);
			formData.append('input_language', inputLanguage);
			formData.append('line_separation', lineSeparation);
			// Extract text from image
			try {
				const response = await fetch('http://localhost:5000/api/extract', {
					method: 'POST',
					body: formData,
				});
				const data = await response.json();
				if (data.extracted_text) {
					setText(data.extracted_text);
					setTextType(data.text_type);
					setLanguageOut(languageMap[data.detected_language] || 'Unknown');
					setUploaded(true);
				}
				else {
					setError('No text extracted');
				}
			}
			catch (err) {
				setError('Error occurred');
			}
			setLoading(false);
		}
	};

	const handleTranslate = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setTranslation(null);
		if (!text.trim() || !language) {
			setError('Enter text and select language');
			setLoading(false);
			return;
		}
		try {
			// Convert selected language to code
			const languageCode = Object.keys(languageMap).find(key => languageMap[key] === language);
			// Split long text into parts for machine translation
			const parts = translationModel === 'llm' ? [text] : splitText(text);
			let translations = [];
			// Translate text
			for (let i = 0; i < parts.length; i++) {
				const response = await fetch('http://localhost:5000/api/translate', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						text: parts[i],
						language: languageCode,
						input_language: inputLanguage,
						method: translationModel
					}),
				});
				const data = await response.json();
				if (!response.ok) {
					throw new Error(data.error || 'Translation failed');
				}
				translations.push(data.translated_text);
				if (data.detected_language && languageIn !== (languageMap[data.detected_language] || 'Unknown')) {
					setLanguageIn(languageMap[data.detected_language] || 'Unknown');
				}
			}
			// Join translated parts
			setTranslation({ translated_text: translations.join('') });
		}
		catch (err) {
			setError(err.message || 'Error occurred');
		}
		setLoading(false);
	};

	const splitText = (text) => {
		const maxLength = 512;
		const parts = [];
		for (let i = 0; i < text.length; i += maxLength) {
			parts.push(text.substring(i, Math.min(i + maxLength, text.length)));
		}
		return parts;
	};

	return (
		<div className='container'>
			<div className='header'>
				<h2>{loading ? 'Loading...' : 'ImageToText'}</h2>
				<div>
					{loggedIn ? (
						<>
							<span>{name}</span>
							<button className='button' onClick={logout}>Logout</button>
						</>
					) : (
					<button className='button' onClick={() => navigate('/login')}>Login</button>
					)}
				</div>
			</div>
			
			<div className='main'>
				<div className='extraction'>
					<h2>Extract Text from Image</h2>
					<div>
						<label htmlFor='textTypeSelect'>Input Type</label>
						<select
							id='textTypeSelect'
							value={selectedTextType}
							onChange={(e) => setSelectedTextType(e.target.value)}
							className='select'
						>
							{textTypeOptions.map((item) => (
								<option key={item} value={item}>{item}</option>
							))}
						</select>
					</div>
					<div>
						<label htmlFor='inputLanguageSelect'>Input Language</label>
						<select
							id='inputLanguageSelect'
							value={inputLanguage}
							onChange={(e) => setInputLanguage(e.target.value)}
							className='select'
						>
							{Object.keys(languageMap).map((key) => (
								<option key={key} value={key}>{languageMap[key]}</option>
							))}
						</select>
					</div>
					<div>
						<label htmlFor='lineSeparationSelect'>Line Separation</label>
						<select
							id='lineSeparationSelect'
							value={lineSeparation}
							onChange={(e) => setLineSeparation(e.target.value)}
							className='select'
						>
							{lineSeparationOptions.map((item) => (
								<option key={item} value={item}>{item}</option>
							))}
						</select>
					</div>
					<input type='file' accept='image/*' onChange={handleImage} disabled={loading} />
					{image && <img src={image} alt='Uploaded Image' />}
					{uploaded && (
						<div>
							<p>Detected Type: {textType}</p>
							<p>Detected Language: {languageOut}</p>
						</div>
					)}
				</div>
				
				<div className='translation'>
					<h2>Translate Text</h2>
					<form onSubmit={handleTranslate}>
						<label htmlFor='inputText'>Input Text</label>
						<textarea
							id='inputText'
							value={text}
							onChange={(e) => setText(e.target.value)}
							rows='10'
							placeholder='Enter text to translate'
							className='textarea'
							required
						/>
						<label htmlFor='languageSelect'>Output Language</label>
						<select
							id='languageSelect'
							value={language}
							onChange={(e) => setLanguage(e.target.value)}
							className='select'
							required
						>
							<option value='' disabled>Select language</option>
							{Object.values(languageMap).filter(lang => lang !== 'auto').map((lang) => (
								<option key={lang} value={lang}>{lang}</option>
							))}
						</select>
						<label htmlFor='modelSelect'>Translation Model</label>
						<select
							id='modelSelect'
							value={translationModel}
							onChange={(e) => setTranslationModel(e.target.value)}
							className='select'
						>
							<option value='nmt'>NMT</option>
							<option value='llm'>LLM</option>
						</select>
						<button type='submit' className='button' disabled={loading}>Translate</button>
					</form>
					{translation && (
						<div>
							<textarea
								id='translatedText'
								value={translation.translated_text}
								rows='10'
								className='textarea'
							/>
							<p>Detected Language: {languageIn}</p>
						</div>
					)}
				</div>
			</div>
			{error && (
				<div className='error'>
					{error}
				</div>
			)}
		</div>
	);
}

export default Home;