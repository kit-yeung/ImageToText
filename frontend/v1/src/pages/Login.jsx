import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API_BASE_URL from '../config/api';

export default function Login() {
	const [name, setName] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const navigate = useNavigate();
	
	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		try {
			const res = await fetch(`${API_BASE_URL}/api/login`, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name,
					password
				}),
			});
			const data = await res.json();
			if (res.ok) {
				toast.success('Logged in successfully!');
				navigate('/');
			}
			else {
				setError(data.error || 'Login failed');
			}
		}
		catch (err) {
			setError('Network error');
		}
	};
	
	return (
		<div className='auth-container'>
			<div className='auth-card'>
				<h1>Login</h1>
				{error && <div className='error'>{error}</div>}
				<form onSubmit={handleSubmit}>
					<input
						type='text'
						placeholder='Username'
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
					<button type='submit' className='button'>
						Login
					</button>
				</form>
				<p style={{ marginTop: '1.5rem' }}>
					Don't have an account?{' '}
					<span className='auth-link' onClick={() => navigate('/signup')}>
						Sign Up
					</span>
				</p>
			</div>
		</div>
	);
}