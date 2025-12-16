import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const onChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await login(form);
            navigate("/translator");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-blue-50 flex justify-center pt-20">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-6 animate-fade-in">
                    {/* <div className="text-6xl mb-4">🔐</div> */}
                    <img
                        src="/logo.png"
                        alt="logo"
                        className="w-30 h-30 mx-auto mb-4"
                    />
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-sky-600 to-blue-600 bg-clip-text text-transparent mb-2">
                        Welcome Back!
                    </h1>
                    <p className="text-gray-600">
                        Sign in to continue your translation journey
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-sky-100">
                    {error && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg shadow-sm animate-shake">
                            <div className="flex items-center">
                                <span className="text-2xl mr-3">⚠️</span>
                                <p className="text-red-700 font-medium text-sm">
                                    {error}
                                </p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="space-y-6">
                        {/* Username/Email Input */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                👤 Username or Email
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={onChange}
                                className="w-full border-2 border-sky-200 rounded-xl px-4 py-3 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all bg-white placeholder-gray-400"
                                placeholder="Enter your username or email"
                                required
                            />
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                🔒 Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={onChange}
                                className="w-full border-2 border-sky-200 rounded-xl px-4 py-3 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all bg-white placeholder-gray-400"
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-500 to-sky-500 text-white px-6 py-4 rounded-2xl font-semibold hover:from-blue-600 hover:to-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg
                                        className="animate-spin h-5 w-5 mr-3"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Logging in...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <span>Login</span>
                                </span>
                            )}
                        </button>
                    </form>

                    {/* Sign Up Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{" "}
                            <Link
                                to="/signup"
                                className="font-semibold bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-sky-700 transition-all"
                            >
                                Sign up here 🚀
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-6 text-sm text-gray-500">
                    <p>Secure login powered by ImageToText Translator</p>
                </div>
            </div>

            <style>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }

                .animate-fade-in {
                    animation: fade-in 0.5s ease-out;
                }

                .animate-shake {
                    animation: shake 0.3s ease-in-out;
                }
            `}</style>
        </div>
    );
}
