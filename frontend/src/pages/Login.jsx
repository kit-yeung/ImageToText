import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

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
               toast.success("Log in successfully!");
		}
		else {
			setError(data.error || 'Login failed');
		}
	};
	
	 return (
        <div className="log-container shadow-xl">
            <div className="btn-hide">
                <button className="hiddenbutton" onClick={() => navigate('/')}>ImageToText</button>
            </div>
            <div className="fillform">
                <h1>Login</h1>
                {error && <p className="error">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <input
                        className="nam"
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)} 
                        required
                    />
                    <br />
                    <input
                        className="pass"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} 
                        required
                    />
                    <br />
                    <div className="login">
                        <button className="logbt" type="submit">Login</button>
                    </div>
                    <div className="signup">
                        <span className="sign-txt">Don't Have an Account?</span>
                        <button className="signbt" type="button" onClick={() => navigate('/signup')}>Sign Up</button>
                    </div>
                </form>
            </div>
        </div>
    );
}