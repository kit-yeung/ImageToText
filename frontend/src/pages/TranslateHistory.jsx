import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/api';

export default function TranslateHistory() {
	const [history, setHistory] = useState([]);
	const navigate = useNavigate();
	
	const langMap = {
		en: 'English',
		es: 'Spanish',
		fr: 'French',
		de: 'German'
	};
	
	useEffect(() => {
		const fetchHistory = async () => {
			const res = await fetch(`${API_BASE_URL}/api/translate_history`, { credentials: 'include' });
			if (res.ok) {
				const data = await res.json();
				setHistory(data);
			}
			else {
				navigate('/');
			}
		};
		fetchHistory();
	}, [navigate]);
	
	return (
		<div className='container'>
			<h1>Translation History</h1>
			{history.length === 0 ? (
				<p className='history-text'>No history yet.</p>
			) : (
				history.map((item) => (
					<div key={item.timestamp} className='history-card'>
						<p>
							{new Date(item.timestamp).toLocaleString()}
						</p>
						<p>
							<span className='label'>From:</span> {langMap[item.input_language] || item.input_language} {' '}
							<span className='label'>To:</span> {langMap[item.output_language] || item.output_language}
						</p>
						<p><span className='label'>Original:</span></p>
						<p className='result'>{item.input_text}</p>
						<p style={{ marginTop: '1rem' }}><span className='label'>Translation:</span></p>
						<p className='result'>{item.translated_text}</p>
					</div>
				))
			)}
		</div>
	);
}