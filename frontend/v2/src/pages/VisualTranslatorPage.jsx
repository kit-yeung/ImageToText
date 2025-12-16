import React, { useState, useRef } from "react";
import { apiExtract, apiTranslate } from "../api";

const AUTO_DETECT_OPTION = {
    value: "auto",
    label: "Auto Detect (English, Chinese, Russian)",
};

const LANGUAGE_OPTIONS = [
    // { value: "ar", label: "Arabic" },
    { value: "az", label: "Azerbaijani" },
    { value: "be", label: "Belarusian" },
    { value: "bn", label: "Bengali" },
    { value: "bg", label: "Bulgarian" },
    { value: "my", label: "Burmese" },
    { value: "ca", label: "Catalan" },
    { value: "ceb", label: "Cebuano" },
    { value: "ch_sim", label: "Chinese" },
    { value: "cs", label: "Czech" },
    { value: "da", label: "Danish" },
    { value: "nl", label: "Dutch" },
    { value: "en", label: "English" },
    { value: "et", label: "Estonian" },
    // { value: "fa", label: "Farsi" },
    { value: "fi", label: "Finnish" },
    { value: "fr", label: "French" },
    { value: "ka", label: "Georgian" },
    { value: "de", label: "German" },
    { value: "el", label: "Greek" },
    { value: "gu", label: "Gujarati" },
    // { value: "he", label: "Hebrew" },
    { value: "hi", label: "Hindi" },
    { value: "hu", label: "Hungarian" },
    { value: "is", label: "Icelandic" },
    { value: "id", label: "Indonesian" },
    { value: "ga", label: "Irish" },
    { value: "it", label: "Italian" },
    { value: "ja", label: "Japanese" },
    { value: "jv", label: "Javanese" },
    { value: "kn", label: "Kannada" },
    { value: "kk", label: "Kazakh" },
    { value: "km", label: "Khmer" },
    { value: "ko", label: "Korean" },
    { value: "ku", label: "Kurdish" },
    { value: "ky", label: "Kyrgyz" },
    { value: "lo", label: "Lao" },
    { value: "la", label: "Latin" },
    { value: "lt", label: "Lithuanian" },
    { value: "mk", label: "Macedonian" },
    { value: "ms", label: "Malay" },
    { value: "mi", label: "Maori" },
    { value: "mr", label: "Marathi" },
    { value: "mn", label: "Mongolian" },
    { value: "ne", label: "Nepali" },
    { value: "no", label: "Norwegian" },
    { value: "or", label: "Oriya" },
    // { value: "pa", label: "Punjabi" },
    { value: "pl", label: "Polish" },
    { value: "pt", label: "Portuguese" },
    { value: "ro", label: "Romanian" },
    { value: "ru", label: "Russian" },
    { value: "sa", label: "Sanskrit" },
    { value: "sr", label: "Serbian" },
    { value: "sk", label: "Slovak" },
    { value: "sl", label: "Slovenian" },
    { value: "es", label: "Spanish" },
    { value: "sw", label: "Swahili" },
    { value: "sv", label: "Swedish" },
    { value: "tl", label: "Tagalog" },
    { value: "tg", label: "Tajik" },
    // { value: "ta", label: "Tamil" },
    { value: "te", label: "Telugu" },
    { value: "th", label: "Thai" },
    { value: "tr", label: "Turkish" },
    // { value: "ug", label: "Uyghur" },
    { value: "uk", label: "Ukrainian" },
    // { value: "ur", label: "Urdu" },
    { value: "uz", label: "Uzbek" },
    { value: "vi", label: "Vietnamese" },
    { value: "cy", label: "Welsh" },
    { value: "yi", label: "Yiddish" },
];

export default function VisualTranslatorPage() {
    const fileInputRef = useRef(null);

    // Extract states
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [inputLanguage, setInputLanguage] = useState("auto");
    const [textType, setTextType] = useState("auto");

    // Text & Translation states
    const [text, setText] = useState("");
    const [targetLang, setTargetLang] = useState("en");
    const [translatedResult, setTranslatedResult] = useState("");

    // UI states
    const [extractLoading, setExtractLoading] = useState(false);
    const [translateLoading, setTranslateLoading] = useState(false);
    const [error, setError] = useState("");

    const handleFileSelect = (e) => {
        const f = e.target.files[0];
        setFile(f || null);
        if (f) setPreviewUrl(URL.createObjectURL(f));
    };

    const triggerFileUpload = () => fileInputRef.current?.click();

    // Extract Text from Image
    const handleExtract = async () => {
        if (!file) {
            setError("Please upload an image first.");
            return;
        }

        setError("");
        setExtractLoading(true);
        setTranslatedResult("");

        try {
            const data = await apiExtract({
                file,
                inputLanguage,
                textType,
            });

            setText(data.extracted_text);
            setInputLanguage(data.detected_language);
            setTextType(data.text_type);
        } catch (err) {
            setError(err.message);
        } finally {
            setExtractLoading(false);
        }
    };

    // Translate Text
    const handleTranslate = async () => {
        if (!text.trim()) {
            setError("Text is empty. Please extract text or type something.");
            return;
        }

        setError("");
        setTranslateLoading(true);

        try {
            const data = await apiTranslate({
                text,
                input_language: inputLanguage,
                language: targetLang,
            });

            setTranslatedResult(data.translated_text);
            setInputLanguage(data.detected_language);
        } catch (err) {
            setError(err.message);
        } finally {
            setTranslateLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-blue-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10 animate-fade-in">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-500 via-sky-500 to-blue-500 bg-clip-text text-transparent leading-relaxed">
                        ImageToText Translator
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Extract text from images and translate instantly
                    </p>
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

                {/* Step 1: Upload */}
                <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl mb-6 border border-sky-100 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            1
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            Upload & Extract
                        </h2>
                    </div>

                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    <button
                        onClick={triggerFileUpload}
                        className="w-full bg-gradient-to-r from-blue-500 to-sky-500 text-white px-6 py-4 rounded-2xl font-semibold hover:from-blue-600 hover:to-sky-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        <span className="text-2xl mr-2">📸</span>
                        {file ? "Change Image" : "Upload Image"}
                    </button>

                    {previewUrl && (
                        <div className="mt-6 animate-fade-in">
                            <p className="text-sm text-gray-600 mb-3 font-medium">
                                Preview:
                            </p>
                            <div className="relative inline-block">
                                <img
                                    src={previewUrl}
                                    alt="preview"
                                    className="max-w-full h-auto rounded-2xl shadow-lg border-4 border-white"
                                    style={{ maxHeight: "300px" }}
                                />
                                <div className="absolute -top-2 -right-2 bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
                                    ✓
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div>
                            <label className="text-sm font-semibold text-gray-700 block mb-2">
                                Input Language
                            </label>
                            <select
                                className="w-full border-2 border-sky-200 rounded-xl px-4 py-3 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all bg-white"
                                value={inputLanguage}
                                onChange={(e) =>
                                    setInputLanguage(e.target.value)
                                }
                            >
                                <option value={AUTO_DETECT_OPTION.value}>
                                    {AUTO_DETECT_OPTION.label}
                                </option>
                                {LANGUAGE_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-700 block mb-2">
                                Text Type
                            </label>
                            <select
                                className="w-full border-2 border-sky-200 rounded-xl px-4 py-3 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all bg-white"
                                value={textType}
                                onChange={(e) => setTextType(e.target.value)}
                            >
                                <option value="auto">Auto Detect</option>
                                <option value="printed">Printed</option>
                                <option value="handwritten">Handwritten</option>
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={handleExtract}
                        disabled={extractLoading}
                        className="mt-6 w-full bg-gradient-to-r from-blue-500 to-sky-500 text-white px-6 py-4 rounded-2xl font-semibold hover:from-blue-600 hover:to-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg"
                    >
                        {extractLoading ? (
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
                                Extracting...
                            </span>
                        ) : (
                            <>🔍 Extract Text</>
                        )}
                    </button>
                </div>

                {/* Step 2: Extracted Text */}
                <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl mb-6 border border-orange-100 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            2
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            Extracted Text
                        </h2>
                    </div>

                    <textarea
                        className="w-full min-h-[160px] border-2 border-orange-200 rounded-2xl px-4 py-3 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all resize-none bg-white"
                        placeholder="✨ Extracted text will appear here... You can edit it too!"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                </div>

                {/* Step 3: Translate */}
                <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl mb-6 border border-green-100 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            3
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            Translate
                        </h2>
                    </div>

                    <label className="text-sm font-semibold text-gray-700 block mb-2">
                        🎯 Target Language
                    </label>
                    <select
                        value={targetLang}
                        onChange={(e) => setTargetLang(e.target.value)}
                        className="w-full border-2 border-green-200 rounded-xl px-4 py-3 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all mb-6 bg-white"
                    >
                        {LANGUAGE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={handleTranslate}
                        disabled={translateLoading}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-2xl font-semibold hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg"
                    >
                        {translateLoading ? (
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
                                Translating...
                            </span>
                        ) : (
                            <>🌍 Translate Text</>
                        )}
                    </button>
                </div>

                {/* Step 4: Translation Result */}
                {translatedResult && (
                    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-yellow-100 animate-fade-in">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                ✓
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                Translation Result
                            </h2>
                        </div>

                        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-2xl border-2 border-orange-200">
                            <pre className="text-gray-800 text-base whitespace-pre-wrap font-medium leading-relaxed">
                                {translatedResult}
                            </pre>
                        </div>
                    </div>
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
