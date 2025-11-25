import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RedirectGuest = ({ children }) => {
	const navigate = useNavigate();
	
	useEffect(() => {
		const check = async () => {
			const res = await fetch('http://localhost:5000/api/status', {
				credentials: 'include',
			});
			const data = await res.json();
			if (!data.logged_in) {
				navigate('/', { replace: true });
			}
		};
		check();
	}, [navigate]);
	
	return <>{children}</>;
};

export default RedirectGuest;