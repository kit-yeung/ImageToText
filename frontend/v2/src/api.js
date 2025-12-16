const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5005";

function getAuthHeader() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// ---------- Auth ----------
export async function apiSignup({ name, email, password }) {
    const res = await fetch(`${API_BASE}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Signup failed");
    return data;
}

export async function apiLogin({ name, password }) {
    const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    return data; // { message, token, name, email }
}

export async function apiLogout() {
    const res = await fetch(`${API_BASE}/api/logout`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
        },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Logout failed");
    return data;
}

export async function apiStatus() {
    const res = await fetch(`${API_BASE}/api/status`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
        },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Status failed");
    return data; // { logged_in, name, email } or { logged_in:false }
}

// ---------- Extract ----------
export async function apiExtract({ file, inputLanguage, textType }) {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("input_language", inputLanguage || "auto");
    formData.append("text_type", textType || "auto");

    const res = await fetch(`${API_BASE}/api/extract`, {
        method: "POST",
        headers: {
            ...getAuthHeader(),
        },
        body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Extract failed");
    return data; // { extracted_text, text_type, detected_language }
}

// ---------- Translate ----------
export async function apiTranslate({ text, input_language, language }) {
    const res = await fetch(`${API_BASE}/api/translate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
        },
        body: JSON.stringify({
            text,
            input_language,
            language,
        }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Translate failed");
    return data; // { input_text, translated_text, detected_language }
}

// ---------- History ----------
export async function apiExtractHistory() {
    const res = await fetch(`${API_BASE}/api/extract_history`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
        },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Get extract history failed");
    return data;
}

export async function apiTranslateHistory() {
    const res = await fetch(`${API_BASE}/api/translate_history`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
        },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Get translate history failed");
    return data;
}

export async function fetchExtractImage(timestamp) {
    const res = await fetch(`${API_BASE}/api/image/${timestamp}`, {
        method: "GET",
        headers: { ...getAuthHeader() },
    });

    if (!res.ok) {
        console.error("Failed to load image", res.status);
        return null;
    }

    const blob = await res.blob();
    return URL.createObjectURL(blob);
}
