import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/api';

export default function ExtractHistory() {
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
			const res = await fetch(`${API_BASE_URL}/api/extract_history`, { credentials: 'include' });
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
			<h1>Extraction History</h1>
			{history.length === 0 ? (
				<p className='history-text'>No history yet.</p>
				) : (
				history.map((item) => (
					<div key={item.timestamp} className='history-card'>
						<p>
							{new Date(item.timestamp).toLocaleString()}
						</p>
						{item.image_url && (
							<img src={`${API_BASE_URL}${item.image_url}`} alt='Image' />
						)}
						<p><span className='label'>Text Type:</span> {item.text_type}</p>
						<p><span className='label'>Language:</span> {langMap[item.language] || item.language}</p>
						<p><span className='label'>Extraction:</span></p>
						<p className='result'>{item.extracted_text || '(empty)'}</p>
					</div>
				))
			)}
		</div>
	);
}