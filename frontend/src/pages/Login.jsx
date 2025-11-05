import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
	const [name, setName] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		const res = await fetch('http://localhost:5000/api/login', {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name, password }),
		});
		const data = await res.json();
		if (res.ok) {
			navigate('/');
		}
		else {
			setError(data.error || 'Login failed');
		}
	};

	return (
		<div className='container'>
			<button className='hiddenbutton' onClick={() => navigate('/')}>ImageToText</button>
			<div className='fillform'>
				<h2>Login</h2>
				{error && <p className='error'>{error}</p>}
				<form onSubmit={handleSubmit}>
					<input
						type='text'
						placeholder='Name'
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
					/>
					<input
						type='password'
						placeholder='Password'
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
					<button type='submit'>Login</button>
					<button type='button' onClick={() => navigate('/signup')}>Sign Up</button>
				</form>
			</div>
		</div>
	);
}