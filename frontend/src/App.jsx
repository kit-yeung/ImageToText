import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ExtractHistory from './pages/ExtractHistory';
import TranslateHistory from './pages/TranslateHistory';
import Profile from './pages/Profile';

import RedirectUser from './components/RedirectUser';
import RedirectGuest from './components/RedirectGuest';
import Navbar from './components/Navbar';

import './App.css';
import 'react-toastify/dist/ReactToastify.css';

function App() {
	return (
		<BrowserRouter>
		<Navbar />
			<ToastContainer
				position='top-center'
				autoClose={60}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				theme='colored'
			/>
			<Routes>
				<Route path='/' element={<Home />} />
				<Route path='/extract-history' element={
					<RedirectGuest>
						<ExtractHistory />
					</RedirectGuest>
				} />
				<Route path='/translate-history' element={
					<RedirectGuest>
						<TranslateHistory />
					</RedirectGuest>
				} />
				<Route path='/login' element={
						<RedirectUser>
							<Login />
						</RedirectUser>
				} />
				<Route path='/signup' element={
						<RedirectUser>
							<Signup />
						</RedirectUser>
				} />
				<Route path='/profile' element={<Profile />}/>
			</Routes>
		</BrowserRouter>
	);
}

export default App;