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
		<div className='ex-container'>
			
			<h2 className='history-ext text-[40px]'>Extract History</h2>
			{history.length === 0 ? (
				<p>None.</p>
			) : (
				<div className='card'>
					{history.map((item, index) => (
						<div key={`${item.timestamp}-${index}`} >
							<p className='text-white font-[20px] font-semibold my-5'>{new Date(item.timestamp).toLocaleString()}</p>
							<div  className='img-ex'><img src={`http://localhost:5000${item.image_url}`} alt='image' /> </div>
							<p >Extracted text: <span className='font-semibold font-[40px]'>{item.extracted_text}</span></p>
							<p>Type: {item.text_type}</p>
							<p>Language: <span className='font-semibold font-[40px]'>{item.language}</span></p>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export default ExtractHistory;