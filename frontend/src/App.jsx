import React, { useState } from 'react';
import './App.css';

function App() {
	const [image, setImage] = useState(null);
	const [text, setText] = useState('');
	const [model, setModel] = useState('');
	const [language, setLanguage] = useState('');
	const [translation, setTranslation] = useState(null);
	const [loading, setLoading] = useState(false);
	const [uploaded, setUploaded] = useState(false);
	const [error, setError] = useState(null);
	const languages = ['English', 'Japanese'];
	
	const handleImage = async (e) => {
		const file = e.target.files[0];
		if (file) {
			setImage(URL.createObjectURL(file));
			setLoading(true);
			setError(null);
			const formData = new FormData();
			formData.append('image', file);
			try {
				const response = await fetch('http://localhost:5000/extract', {
					method: 'POST',
					body: formData,
				});
				const data = await response.json();
				if (data.extracted_text) {
					setText(data.extracted_text);
					setModel(data.source);
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
			setError("Enter text and select a language");
			setLoading(false);
			return;
		}
		try {
			// Split long text into parts
			const parts = splitText(text);
			let translations = [];
			for (let i = 0; i < parts.length; i++) {
				const response = await fetch('http://localhost:5000/translate', {
					method: 'POST',
					headers: {'Content-Type': 'application/json'},
					body: JSON.stringify({
						text: parts[i],
						language: language
					}),
				});
				const data = await response.json();
				if (!response.ok) {
					throw new Error(data.error || 'Translation failed');
				}
				translations.push(data.translated_text);
			}
			setTranslation({translated_text: translations.join('')});
		}
		catch (err) {
			setError('Error occurred');
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
			<h2>{loading ? 'Loading...' : 'ImageToText'}</h2>
			<div className='main'>
				<div className='extraction'>
					<h2>Extract Text from Image</h2>
					<input type='file' accept='image/*' onChange={handleImage} disabled={loading}/>
					{image && <img src={image} alt='Uploaded Image' />}
					{uploaded && (
						<p>{model}</p>
					)}
				</div>
				<div className='translation'>
					<h2>Translate Text</h2>
					<form onSubmit={handleTranslate}>
						<label htmlFor='text'>Input Text</label>
						<textarea
							id='text'
							value={text}
							onChange={(e) => setText(e.target.value)}
							rows='10'
							placeholder='Enter text'
							className='textarea'
							required
						/>
						<label htmlFor='language'>Language</label>
						<select id='language' value={language} onChange={(e) => setLanguage(e.target.value)} className='select' required>
							<option value='' disabled>Select a language</option>
							{languages.map((lang) => (
								<option key={lang} value={lang}>{lang}</option>
							))}
						</select>
						<button type='submit' className='button' disabled={loading}>Translate</button>
					</form>
					{translation && (
						<textarea
							id='translated-text'
							value={translation.translated_text}
							rows='10'
							className='textarea'
						/>
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

export default App;