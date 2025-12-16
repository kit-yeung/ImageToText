import React, { createContext, useContext, useEffect, useState } from "react";
import { apiLogin, apiLogout, apiSignup, apiStatus } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null); // { name, email }
    const [loading, setLoading] = useState(true);

    // Retrieve token from localStorage and verify status
    useEffect(() => {
        async function init() {
            try {
                const token = localStorage.getItem("token");
                if (token) {
                    const status = await apiStatus();
                    if (status.logged_in) {
                        setUser({ name: status.name, email: status.email });
                    } else {
                        localStorage.removeItem("token");
                    }
                }
            } catch (err) {
                console.error(err);
                localStorage.removeItem("token");
            } finally {
                setLoading(false);
            }
        }
        init();
    }, []);

    async function handleSignup({ name, email, password }) {
        await apiSignup({ name, email, password });
        // Automatically login or be redirected to the login page
        return true;
    }

    async function handleLogin({ name, password }) {
        const data = await apiLogin({ name, password });
        localStorage.setItem("token", data.token);
        setUser({ name: data.name, email: data.email });
    }

    async function handleLogout() {
        try {
            await apiLogout();
        } catch (err) {
            console.error(err);
        }
        localStorage.removeItem("token");
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: !!user,
                signup: handleSignup,
                login: handleLogin,
                logout: handleLogout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
