import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API_BASE_URL from '../config/api';

export default function Signup() {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const navigate = useNavigate();
	
	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		try {
			const res = await fetch(`${API_BASE_URL}/api/signup`, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name,
					email,
					password
				}),
			});
			const data = await res.json();
			if (res.ok) {
				toast.success('Account created! Please log in.');
			navigate('/login');
			}
			else {
				setError(data.error || 'Signup failed');
			}
		}
		catch (err) {
			setError('Network error');
		}
	};
	
	return (
		<div className='auth-container'>
			<div className='auth-card'>
				<h1>Sign Up</h1>
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
					<button type='submit' className='button'>
						Sign Up
					</button>
				</form>
				<p style={{ marginTop: '1.5rem' }}>
					Already have an account?{' '}
					<span className='auth-link' onClick={() => navigate('/login')}>
						Log In
					</span>
				</p>
			</div>
		</div>
	);
}