import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const navigate = useNavigate();
	
	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		const res = await fetch('http://localhost:5000/api/signup', {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name, email, password }),
		});
		const data = await res.json();
		if (res.ok) {
			navigate('/login');
		}
		else {
			setError(data.error || 'Signup failed');
		}
	};
	
	return (
		<div className='container'>
			<button className='hiddenbutton' onClick={() => navigate('/')}>ImageToText</button>
			<div className='fillform'>
				<h2>Sign Up</h2>
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
						type='email'
						placeholder='Email'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
					<input
						type='password'
						placeholder='Password'
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
					<button type='submit' className='button'>Sign Up</button>
					<button className='button' onClick={() => navigate('/login')}>Login</button>
				</form>
			</div>
		</div>
	);
}