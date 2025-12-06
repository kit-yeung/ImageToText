import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import user from "../assets/people.png"; // User icon
import API_BASE_URL from "../config/api";

export default function Profile() {
    const [loggedIn, setLoggedIn] = useState(false);

    const capitalize = (str) =>
        str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";
    const [name, setName] = useState("");
    const [email, setEmail] = useState(""); // <-- added email state

    const location = useLocation();

    const checkAuth = async () => {
        const res = await fetch(`${API_BASE_URL}/api/status`, {
            credentials: "include",
        });

        const data = await res.json();

        setLoggedIn(data.logged_in);

        if (data.logged_in) {
            setName(data.name); // name from backend
            setEmail(data.email); // email from backend  <-- new
        }
    };
    useEffect(() => {
        checkAuth();
    }, [location]);

    const logout = async () => {
        await fetch(`${API_BASE_URL}/api/logout`, {
            method: "POST",
            credentials: "include",
        });

        setLoggedIn(false);
        setName("");
        setEmail(""); // <-- clear email on logout
    };

    return (
        <div className="user-container">
            <div className="w-41 h-41 justify-center items-center mb-4  rounded-full ring-4 ring-yellow-400 ">
                <img className="w-24 h-24 p-3 ml-2" src={user} />{" "}
            </div>
            <p>
                Name:{" "}
                <span className="yellow-border ml-5">
                    <span className="font-semibold text-white text-[20px]">
                        {capitalize(name)}
                    </span>
                </span>
            </p>
            <p>
                Email:{" "}
                <span className="yellow-border ml-5">
                    <span className="font-semibold h- text-white text-[20px]">
                        {email}
                    </span>
                </span>
            </p>
        </div>
    );
}
