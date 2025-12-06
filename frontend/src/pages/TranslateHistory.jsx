import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api";

function TranslateHistory() {
    const [history, setHistory] = useState([]);
    const navigate = useNavigate();

    const langMap = {
        auto: "auto",
        en: "English",
        es: "Spanish",
        fr: "French",
        de: "German",
    };

    useEffect(() => {
        const fetchHistory = async () => {
            const res = await fetch(`${API_BASE_URL}/api/translate_history`, {
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                setHistory(data);
            } else {
                navigate("/");
            }
        };
        fetchHistory();
    }, [navigate]);

    return (
        <div className="translate-container">
            <h2 className="font-bold text-[40px]">Translate History</h2>
            {history.length === 0 ? (
                <p>None.</p>
            ) : (
                <div>
                    {history.map((item, index) => (
                        <div
                            className="card custom-card"
                            key={`${item.timestamp}-${index}`}
                        >
                            <p className="text-white text-[20px] font-semibold my-5">
                                <span className="yellow-border ml-5">
                                    <span className="font-semibold text-white text-[20px]">
                                        {new Date(
                                            item.timestamp
                                        ).toLocaleString()}
                                    </span>
                                </span>
                            </p>

                            <p>
                                Language:
                                <span className="yellow-border ml-5">
                                    <span className="font-semibold text-white text-[20px]">
                                        {langMap[item.input_language] ||
                                            item.input_language}{" "}
                                        →{" "}
                                        {langMap[item.output_language] ||
                                            item.output_language}
                                    </span>
                                </span>
                            </p>

                            <p>
                                Original text:
                                <span className="yellow-border ml-5">
                                    <span className="font-semibold text-white text-[20px]">
                                        {item.input_text}
                                    </span>
                                </span>
                            </p>

                            <p>
                                Translated text:
                                <span className="yellow-border ml-5">
                                    <span className="font-semibold text-white text-[20px]">
                                        {item.translated_text}
                                    </span>
                                </span>
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default TranslateHistory;
