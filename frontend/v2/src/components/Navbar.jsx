import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <nav className="bg-gradient-to-r from-blue-500 via-sky-500 to-blue-500 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Left Section - Logo & Links */}
                    <div className="flex items-center gap-6">
                        <Link
                            to="/"
                            className="font-bold text-xl flex items-center gap-3 hover:scale-105 transition-transform"
                        >
                            <img
                                src="/logo.png"
                                alt="logo"
                                className="w-10 h-10 object-contain"
                            />
                        </Link>

                        <div className="hidden md:flex items-center gap-2">
                            <Link
                                to="/translator"
                                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all font-medium flex items-center gap-2"
                            >
                                <span>ImageToText Translator</span>
                            </Link>
                            {isAuthenticated && (
                                <Link
                                    to="/history"
                                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all font-medium flex items-center gap-2"
                                >
                                    <span>History</span>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Right Section - User Info & Auth Buttons */}
                    <div className="flex items-center gap-3">
                        {isAuthenticated && (
                            <div className="hidden lg:flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                                <span className="text-xl">👤</span>
                                <div className="text-sm">
                                    <div className="font-semibold">
                                        {user.name}
                                    </div>
                                    <div className="text-xs text-white/80">
                                        {user.email}
                                    </div>
                                </div>
                            </div>
                        )}

                        {!isAuthenticated ? (
                            <div className="flex items-center gap-2">
                                <Link
                                    to="/login"
                                    className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 transition-all font-medium"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="px-5 py-2 rounded-xl bg-white text-blue-600 hover:bg-white/90 transition-all font-semibold shadow-lg"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        ) : (
                            <button
                                onClick={handleLogout}
                                className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 transition-all font-semibold shadow-lg flex items-center gap-2"
                            >
                                <span>Logout</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Links */}
                <div className="md:hidden flex gap-2 mt-3">
                    <Link
                        to="/translator"
                        className="flex-1 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all text-sm font-medium text-center"
                    >
                        ImageToText Translator
                    </Link>
                    {isAuthenticated && (
                        <Link
                            to="/history"
                            className="flex-1 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all text-sm font-medium text-center"
                        >
                            History
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
