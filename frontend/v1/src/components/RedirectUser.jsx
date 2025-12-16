import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/api';

const RedirectUser = ({ children }) => {
	const navigate = useNavigate();
	
	useEffect(() => {
		const check = async () => {
			const res = await fetch(`${API_BASE_URL}/api/status`, {
				credentials: 'include',
			});
			const data = await res.json();
			if (data.logged_in) {
				navigate('/', { replace: true });
			}
		};
		check();
	}, [navigate]);
	
	return <>{children}</>;
};

export default RedirectUser;