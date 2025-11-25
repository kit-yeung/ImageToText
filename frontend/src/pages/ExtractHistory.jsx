import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ExtractHistory() {
	const [history, setHistory] = useState([]);
	const navigate = useNavigate();
	
	useEffect(() => {
		const fetchHistory = async () => {
			const res = await fetch('http://localhost:5000/api/extract_history', {
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
			<h2>Extract History</h2>
			{history.length === 0 ? (
				<p>None.</p>
			) : (
				<div>
					{history.map((item, index) => (
						<div key={`${item.timestamp}-${index}`}>
							<p>{new Date(item.timestamp).toLocaleString()}</p>
							<img src={`http://localhost:5000${item.image_url}`} alt='image' />
							<p>Extracted text: {item.extracted_text}</p>
							<p>Type: {item.text_type}</p>
							<p>Language: {item.language}</p>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export default ExtractHistory;