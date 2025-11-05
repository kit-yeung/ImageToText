import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Redirect from './components/Redirect';
import './App.css';

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path='/' element={<Home />} />
				<Route
					path='/login'
					element={
						<Redirect>
							<Login />
						</Redirect>
					}
				/>
				<Route
					path='/signup'
					element={
						<Redirect>
							<Signup />
						</Redirect>
					}
				/>
			</Routes>
		</BrowserRouter>
	);
}

export default App;