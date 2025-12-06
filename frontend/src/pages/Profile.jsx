import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import userIcon from '../assets/people.png';
import API_BASE_URL from '../config/api';

export default function Profile() {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [oldPassword, setOldPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [passwordChange, setPasswordChange] = useState(false);
	const [error, setError] = useState('');
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
	
	const handlePasswordChange = async () => {
		const res = await fetch(`${API_BASE_URL}/api/password`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				oldPassword,
				newPassword
			}),
		});
		const data = await res.json();
		if (res.ok) {
			toast.success('Password updated successfully!');
			setOldPassword('');
			setNewPassword('');
			setPasswordChange(false);
		}
		else {
			toast.error('Password change failed');
		}
	};
	
	const handleCancel = async (e) => {
		setOldPassword('');
		setNewPassword('');
		setPasswordChange(false);
	}
	
	return (
		<div className='page-container'>
			<div className='profile-card'>
				<img src={userIcon} alt='User' className='profile-icon' />
				<h1>User Profile</h1>
				<div>
					<p><strong>Name:</strong> {name}</p>
					<p><strong>Email:</strong> {email}</p>
				</div>
				<div className='auth-card'>
					{!passwordChange ? (
						<button onClick={() => setPasswordChange(true)} className='button'>
							Change Password
						</button>
					) : (
						<div>
							<input
								type='password'
								placeholder='Current Password'
								value={oldPassword}
								onChange={(e) => setOldPassword(e.target.value)}
								required
							/>
							<input
								type='password'
								placeholder='New Password'
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								required
							/>
							<button onClick={handlePasswordChange} className='button'>
								Submit
							</button>
							<button onClick={handleCancel} className='clear-button'>
								Cancel
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}