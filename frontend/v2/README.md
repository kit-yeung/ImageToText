# ImageToText Translator Frontend

A responsive React web application that enables users to extract text from images using OCR and translate it into multiple languages. Upload images, extract text, translate to specified languages, and view extraction and translation history with an intuitive user interface.

## Features

User Authentication

-   Secure Login/Signup: JWT-based authentication system
-   Protected Routes: Prohibit access for unauthenticated users
-   Session Management: Persistent login state with token storage

Image Upload & OCR

-   Real-time Preview: View uploaded images before processing
-   Text Extraction: OCR processing for handwritten and printed text
-   Multiple Format Support: Supports common image formats (JPG, PNG, etc.)

Text Translation

-   Multi-Language Support: Translate text into a variety of global languages instantly
-   Automatic Language Detection: Detects source language automatically if not specified
-   Versatile Input: Translate extracted text or manual input directly

## Tech Stack

-   Framework: React with Vite
-   Styling: Tailwind CSS
-   HTTP Client: Axios for API communication
-   Routing: React Router for navigation
-   State Management: Context API for global state
-   Build Tool: Vite for fast development and optimized builds

## Environment Configuration

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5005
```

Adjust the API URL to match your backend server address.

## Setup Instructions

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```
