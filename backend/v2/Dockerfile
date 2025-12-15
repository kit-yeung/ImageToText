# ===============================
# Base image
# ===============================
FROM python:3.10-slim

# ===============================
# System dependencies (OpenCV, Torch, EasyOCR)
# ===============================
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    pkg-config \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgl1 \
    ffmpeg \
    git \
    && rm -rf /var/lib/apt/lists/*

# ===============================
# Work directory
# ===============================
WORKDIR /app

# ===============================
# Python dependencies
# ===============================
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip uninstall -y opencv-python opencv-python-headless opencv-contrib-python || true && \
    pip install --no-cache-dir -r requirements.txt

# ===============================
# Copy backend code
# ===============================
COPY . .

# ===============================
# Initialize SQLite (safe)
# ===============================
RUN python database.py || true

# ===============================
# Cloud Run settings
# ===============================
ENV PORT=8080
EXPOSE 8080

# ===============================
# Production server (IMPORTANT)
# ===============================
CMD ["gunicorn", "--bind", ":8080", "--workers", "1", "--threads", "4", "app:app"]
