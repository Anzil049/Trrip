# Trrip AI

A full-stack travel itinerary app for uploading trip details, generating itineraries, and sharing trip plans.

## Structure

- `client` - React frontend
- `server` - Node.js + Express API

## Features

- Email verification with OTP on registration
- Cookie-based access and refresh session flow
- Travel document upload
- PDF and image extraction pipeline
- AI itinerary generation service
- MongoDB persistence
- Itinerary history and share links

## Run locally

1. Install dependencies:

```bash
npm run install:all
```

2. Configure `server/.env` from `server/.env.example`

3. Start the backend and frontend:

```bash
npm run dev:server
npm run dev:client
```

## Notes

- The AI service is written to support a real Gemini API key, but it also has a deterministic fallback so the app still works as a strong demo.
- The extraction pipeline is designed for PDFs and images, with file handling isolated in the backend service layer.
- Authentication uses `httpOnly` cookies for the access and refresh tokens, so nothing is stored in `localStorage`.
