import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api";

function ExtractHistory() {
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
            const res = await fetch(`${API_BASE_URL}/api/extract_history`, {
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
        <div className="ex-container">
            <h2 className="history-ext text-[40px]">Extract History</h2>
            {history.length === 0 ? (
                <p>None.</p>
            ) : (
                history.map((item, index) => (
                    <div
                        className="custom-card"
                        key={`${item.timestamp}-${index}`}
                    >
                        <p className="text-white text-[20px] font-semibold my-5">
                            {new Date(item.timestamp).toLocaleString()}
                        </p>

                        <div className="img-ex">
                            <img
                                src={`${API_BASE_URL}${item.image_url}`}
                                alt="image"
                            />
                        </div>

                        <p>
                            Extracted text:
                            <span className="yellow-border ml-5">
                                <span className="font-semibold text-white text-[20px]">
                                    {item.extracted_text}
                                </span>
                            </span>
                        </p>

                        <p>
                            Type:
                            <span className="yellow-border ml-5">
                                <span className="font-semibold text-white text-[20px]">
                                    {item.text_type}
                                </span>
                            </span>
                        </p>

                        <p>
                            Language:
                            <span className="yellow-border ml-5">
                                <span className="font-semibold text-white text-[20px]">
                                    {langMap[item.language] || item.language}
                                </span>
                            </span>
                        </p>
                    </div>
                ))
            )}
        </div>
    );
}

export default ExtractHistory;
