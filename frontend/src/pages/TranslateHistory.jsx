import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function TranslateHistory() {
	const [history, setHistory] = useState([]);
	const navigate = useNavigate();
	
	useEffect(() => {
		const fetchHistory = async () => {
			const res = await fetch('http://localhost:5000/api/translate_history', {
				credentials: 'include'
			});
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
			<button className='hiddenbutton' onClick={() => navigate('/')}>ImageToText</button>
			<h2>Translate History</h2>
			{history.length === 0 ? (
				<p>None.</p>
			) : (
				<div>
					{history.map((item, index) => (
						<div key={`${item.timestamp}-${index}`}>
							<p>{new Date(item.timestamp).toLocaleString()}</p>
							<p>Language: {item.input_language} to {item.output_language}</p>
							<p>Original text: {item.input_text}</p>
							<p>Translated text: {item.translated_text}</p>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export default TranslateHistory;