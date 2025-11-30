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
		<div className='translate-container'>
			
			<h2 className='font-bold text-[40px]'>Translate History</h2>
			{history.length === 0 ? (
				<p>None.</p>
			) : (
				<div>
					{history.map((item, index) => (
						<div key={`${item.timestamp}-${index}`}>
							<p>{new Date(item.timestamp).toLocaleString()}</p>
							<p>Language: <span className='font-semibold font-[40px]'>{item.input_language} to {item.output_language}</span></p>
							<p>Original text:  <span className='font-semibold font-[40px]'>{item.input_text}</span></p>
							<p>Translated text:  <span className='font-semibold font-[40px]'>{item.translated_text}</span></p>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export default TranslateHistory;