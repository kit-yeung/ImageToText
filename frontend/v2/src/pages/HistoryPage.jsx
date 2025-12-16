import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import {
    apiExtractHistory,
    apiTranslateHistory,
    fetchExtractImage,
} from "../api";

export default function HistoryPage() {
    const [extractHistory, setExtractHistory] = useState([]);
    const [translateHistory, setTranslateHistory] = useState([]);
    const [tab, setTab] = useState("extract");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchHistory() {
            setError("");
            setLoading(true);
            try {
                const [ex, tr] = await Promise.all([
                    apiExtractHistory(),
                    apiTranslateHistory(),
                ]);

                const itemsWithImages = await Promise.all(
                    ex.map(async (item) => {
                        const imgUrl = await fetchExtractImage(item.timestamp);
                        return { ...item, imgUrl };
                    })
                );

                setExtractHistory(itemsWithImages);
                setTranslateHistory(tr);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchHistory();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-blue-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10 animate-fade-in">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-500 via-sky-500 to-blue-500 bg-clip-text text-transparent leading-relaxed">
                        Your History
                    </h1>
                    <p className="text-gray-600 text-lg">
                        View your past extractions and translations
                    </p>
                </div>

                {/* Tab Buttons */}
                <div className="flex gap-4 mb-8 justify-center">
                    <button
                        onClick={() => setTab("extract")}
                        className={`px-8 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                            tab === "extract"
                                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                : "bg-white/80 text-gray-700 hover:bg-white"
                        }`}
                    >
                        <span className="mr-2">🔍</span>
                        Extraction History
                    </button>
                    <button
                        onClick={() => setTab("translate")}
                        className={`px-8 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                            tab === "translate"
                                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                : "bg-white/80 text-gray-700 hover:bg-white"
                        }`}
                    >
                        <span className="mr-2">🌍</span>
                        Translation History
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg shadow-sm animate-shake">
                        <div className="flex items-center">
                            <span className="text-2xl mr-3">⚠️</span>
                            <p className="text-red-700 font-medium">{error}</p>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="text-center">
                            <svg
                                className="animate-spin h-12 w-12 mx-auto mb-4 text-sky-500"
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
                            <p className="text-gray-600 font-medium">
                                Loading your history...
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {tab === "extract" ? (
                            <ExtractHistoryList items={extractHistory} />
                        ) : (
                            <TranslateHistoryList items={translateHistory} />
                        )}
                    </>
                )}
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

function ExtractHistoryList({ items }) {
    if (!items.length)
        return (
            <div className="text-center py-20">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-500 text-lg font-medium">
                    No extraction history yet
                </p>
                <p className="text-gray-400 text-sm mt-2">
                    Start extracting text from images to see your history here
                </p>
            </div>
        );

    return (
        <div className="space-y-6">
            {items.map((item, index) => (
                <div
                    key={item.timestamp}
                    className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-sky-100 hover:shadow-2xl transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                >
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Image Section */}
                        <div className="lg:w-64 flex-shrink-0">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xl">🕐</span>
                                <span className="text-sm text-gray-500 font-medium">
                                    {format(
                                        new Date(item.timestamp),
                                        "yyyy-MM-dd HH:mm:ss"
                                    )}
                                </span>
                            </div>

                            <div className="relative group">
                                <div className="w-full h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-sky-100 shadow-lg">
                                    {item.imgUrl ? (
                                        <img
                                            src={item.imgUrl}
                                            alt="extracted"
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            <div className="text-center">
                                                <div className="text-4xl mb-2">
                                                    🖼️
                                                </div>
                                                <div className="text-sm">
                                                    Image unavailable
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-3 flex gap-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-gray-700">
                                    📝 {item.text_type}
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-gray-700">
                                    🌐 {item.language}
                                </span>
                            </div>
                        </div>

                        {/* Text Section */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xl">📄</span>
                                <h3 className="text-lg font-bold text-gray-800">
                                    Extracted Text
                                </h3>
                            </div>
                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border-2 border-blue-100">
                                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-medium leading-relaxed">
                                    {item.extracted_text}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function TranslateHistoryList({ items }) {
    if (!items.length)
        return (
            <div className="text-center py-20">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-500 text-lg font-medium">
                    No translation history yet
                </p>
                <p className="text-gray-400 text-sm mt-2">
                    Start translating text to see your history here
                </p>
            </div>
        );

    return (
        <div className="space-y-6">
            {items.map((item, index) => (
                <div
                    key={item.timestamp}
                    className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-green-100 hover:shadow-2xl transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                >
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-xl">🕐</span>
                        <span className="text-sm text-gray-500 font-medium">
                            {format(
                                new Date(item.timestamp),
                                "yyyy-MM-dd HH:mm:ss"
                            )}
                        </span>
                        <span className="ml-auto inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-700">
                            {item.input_language} → {item.output_language}
                        </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Original Text */}
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xl">📝</span>
                                <h3 className="text-sm font-bold text-gray-700">
                                    Original Text
                                </h3>
                            </div>
                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border-2 border-sky-100 flex-grow">
                                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-medium leading-relaxed">
                                    {item.input_text}
                                </pre>
                            </div>
                        </div>

                        {/* Translated Text */}
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xl">✨</span>
                                <h3 className="text-sm font-bold text-gray-700">
                                    Translated Text
                                </h3>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border-2 border-green-100 flex-grow">
                                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-medium leading-relaxed">
                                    {item.translated_text}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
