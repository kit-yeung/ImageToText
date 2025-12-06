import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userIcon from '../assets/people.png';
import API_BASE_URL from '../config/api';

export default function Profile() {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const navigate = useNavigate();
	
	useEffect(() => {
		const checkAuth = async () => {
			const res = await fetch(`${API_BASE_URL}/api/status`, { credentials: 'include' });
			const data = await res.json();
			if (data.logged_in) {
				setName(data.name);
				setEmail(data.email);
			}
			else {
				navigate('/login');
			}
		};
		checkAuth();
	}, [navigate]);
	
	return (
		<div className='page-container'>
			<div className='profile-card'>
				<img src={userIcon} alt='User' className='profile-icon' />
				<h1>User Profile</h1>
				<div>
					<p><strong>Name:</strong> {name}</p>
					<p><strong>Email:</strong> {email}</p>
				</div>
			</div>
		</div>
	);
}