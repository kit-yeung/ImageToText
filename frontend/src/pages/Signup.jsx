import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
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
         toast.success("Sign up successfully!");
		}
		else {
			setError(data.error || 'Signup failed');
		}
	};
	
	return (
    <div className='signup-container'>
      <div className="btn-hide">
        <button className='hiddenbutton text-white' onClick={() => navigate('/')}>ImageToText</button>
      </div>
      <div className='fillform'>
        <h1 className='text-[20px]'>Sign Up</h1>
        
        {error && <p className='error'>{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            className='nam'
            type='text'
            placeholder='Name'
            value={name}
            onChange={(e) => setName(e.target.value)} 
            required
          />
          
          <input
            className='email'
            type='email'
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
            required
          />
          
          <input
            className='pass'
            type='password'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            required
          />
          
          <div className='login'>
            <button className='logbt' type='submit'>Sign Up</button>
          </div>
          
          <div className='signup'>
            <span className='sign-txt text-black font-semibold'>Already Have An Account?</span>
            <button className='signbt' type='button' onClick={() => navigate('/login')}>Log in</button>
          </div>
        </form>
      </div>
    </div>
  );
}