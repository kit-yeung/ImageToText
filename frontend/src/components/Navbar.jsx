import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import icon from '../assets/user.png';
import API_BASE_URL from '../config/api';

export default function Navbar() {
	const [loggedIn, setLoggedIn] = useState(false);
	const [name, setName] = useState('');
	const location = useLocation();
	const navigate = useNavigate();
	
	const checkAuth = async () => {
		const res = await fetch(`${API_BASE_URL}/api/status`, {
			credentials: 'include',
		});
		const data = await res.json();
		setLoggedIn(data.logged_in);
		if (data.logged_in)
			setName(data.name);
		else
			setName('');
	};
    
	const logout = async () => {
		await fetch(`${API_BASE_URL}/api/logout`, {
			method: 'POST',
			credentials: 'include',
		});
		setLoggedIn(false);
		setName('');
		toast.success('Logout successfully!');
		checkAuth();
	};
	
	useEffect(() => {
		checkAuth();
	}, [location]);
	
	return (
		<div className='navbar rounded-md shadow-sm mb-3'>
			<div 
				className='logo' 
				style={{ cursor: 'pointer' }} 
				onClick={() => navigate('/')}
			>
				ImageToText
			</div>
			<div className='flex-none'>
				<div className='dropdown dropdown-end'>
					<div tabIndex={0} role='button' className='btn btn-ghost btn-circle avatar'>
						<div className='w-10 rounded-full'>
							<img className='w-7 h-7 mt-2 mx-2' alt='User Avatar' src={icon} />
						</div>
					</div>
					{loggedIn ? (
						<ul
							tabIndex='-1'
							className='menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow'>
							<li><NavLink to='/profile' className='justify-between'>{name}</NavLink></li>
							<li><NavLink to='/extract-history' >Extraction History</NavLink></li>
							<li><NavLink to='/translate-history'> Translation History</NavLink></li>
							<li ><NavLink to='/' onClick={logout}>Logout</NavLink></li>
						</ul>
					) : (
						<ul
							tabIndex='-1'
							className='menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow'>
							<li><a onClick={() => navigate('/login')}>Log In</a></li>
							<li><a onClick={() => navigate('/signup')}>Sign Up</a></li>
						</ul>
					)}
				</div>
			</div>
		</div>
	);
}