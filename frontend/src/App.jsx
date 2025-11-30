import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ExtractHistory from './pages/ExtractHistory';
import TranslateHistory from './pages/TranslateHistory';
import RedirectUser from './components/RedirectUser';
import RedirectGuest from './components/RedirectGuest';
import './App.css';
import Navbar from './components/Navbar';

function App() {
	return (
		<BrowserRouter>
		<Navbar/>
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
			</Routes>
		</BrowserRouter>
	);
}

export default App;