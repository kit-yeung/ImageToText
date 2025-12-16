import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import VisualTranslatorPage from "./pages/VisualTranslatorPage";
import HistoryPage from "./pages/HistoryPage";

function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="mt-8 text-center">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default function App() {
    return (
        <div className="min-h-screen bg-slate-100">
            <Navbar />
            <Routes>
                <Route
                    path="/"
                    element={<Navigate to="/translator" replace />}
                />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/translator" element={<VisualTranslatorPage />} />
                <Route
                    path="/history"
                    element={
                        <ProtectedRoute>
                            <HistoryPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<div className="p-4">404</div>} />
            </Routes>
        </div>
    );
}
