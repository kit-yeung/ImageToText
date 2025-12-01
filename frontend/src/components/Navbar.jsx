import React, { useState, useEffect } from 'react';
import icon from '../assets/user.png'; // User icon
import { useNavigate,useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

import { NavLink } from "react-router-dom";
export default function Navbar() {
   
const [loggedIn, setLoggedIn] = useState(false);
    const [name, setName] = useState('');
    const location = useLocation();
    
    const checkAuth = async () => {
        const res = await fetch('http://localhost:5000/api/status', {
            credentials: 'include',
        });
        const data = await res.json();
        setLoggedIn(data.logged_in);
        if (data.logged_in)
            setName(data.name);
    };
    
  const logout = async () => {
    await fetch('http://localhost:5000/api/logout', {
        method: 'POST',
        credentials: 'include',
    });
    setLoggedIn(false);
    toast.success("Logout in successfully!");
    setName('');
};

    const capitalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';

    useEffect(() => {
        checkAuth();
    }, [location]);

    const navigate = useNavigate();

       return (
        <div className="navbar  rounded-md shadow-sm mb-3">
            <div className="flex-1 font-semibold text-white">
                DeepReadTranslate Web APP
            </div>
            <div>
                <button onClick={() => navigate('/')} className='text-center mr-[500px] bg-transparent text-white font-semibold border-2 border-solid border-white'>
                    Home
                </button>
            </div>
            <div className="flex-none">
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                        <div className="w-10 rounded-full">
                            <img className="w-7 h-7 mt-2 mx-2" alt="User Avatar" src={icon} />
                        </div>
                    </div>
                    {loggedIn ? (
                        <ul
                            tabIndex="-1"
                            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                            <li>
                             <NavLink to='/profile' className="justify-between">
                               {capitalize(name)}
                            <span className="badge">New</span>
                                 </NavLink>

                            </li>
                            <li><NavLink to='/extract-history' >Extraction History</NavLink></li>
                             <li><NavLink to='/translate-history'> Translation History</NavLink></li>

                            <li ><NavLink to='/' onClick={logout}>Logout</NavLink></li>
                        </ul>
                    ) : (
                        <ul
                            tabIndex="-1"
                            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                            <li>
                                <a className="justify-between">
                                    Profile
                                </a>
                            </li>
                            <li><a onClick={() => navigate('/login')}>Log In</a></li>
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
