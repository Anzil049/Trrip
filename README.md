# Trrip — AI-Powered Travel Itinerary Generator ✈️🌍

![Trrip AI Demo](https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80)

Trrip is a full-stack **MERN web application** that automatically generates highly personalized travel itineraries. Users can upload booking documents (flight tickets, hotel reservations, images) and the app uses AI to extract travel details and craft a comprehensive day-by-day plan.

> Developed as a submission for the **Junior Full Stack Developer (MERN + AI)** role at Orbitra Technologies Pvt. Ltd.

---

## ✨ Core Features

### 🔐 Authentication (JWT)
- Secure JWT-based authentication with short-lived **access tokens** and long-lived **refresh tokens** stored in `httpOnly` cookies (XSS-safe).
- **Email Verification (OTP)**: 6-digit OTP sent via email during registration.
- **Password Recovery**: Full "Forgot Password" flow with OTP email verification.

### 📄 Smart Document Upload & Extraction
- **Drag-and-Drop Interface**: Drop booking PDFs or images directly onto the landing page.
- **AI-Powered Extraction**: Uses **Groq AI (Llama 4 Scout)** with vision capabilities to read images and PDFs, extracting destination, dates, passenger count, transport mode, and booking references.
- **Auto-Fill**: Extracted details automatically populate the itinerary builder form.

### 🤖 AI Itinerary Generation
- **Dual-Provider Architecture**: Tries **Groq** (14,400 free requests/day) first, with **Google Gemini** as automatic fallback.
- **Context-Aware Prompts**: Generates highly structured JSON itineraries based on extracted data combined with user preferences (budget, interests, transport, pace, accommodation, food preference).
- **Resilience**: Automated retry mechanisms and multi-model fallback to handle API rate limits gracefully.

### 🗄️ Itinerary Management
- **MongoDB Persistence**: Mongoose schemas for user data, pending registrations, and complex nested itinerary documents.
- **User Dashboard**: Personalized workspace to browse generated trips and manage saved itineraries.

### 🔗 Sharing
- **Public Share Links**: Generate unique `shareToken` for any itinerary.
- **Read-Only Public View**: Friends/family can view itineraries at `/share/:token` without an account.

### 🚀 CI/CD & Deployment
- **GitHub Actions**: Automated deployment pipeline to AWS EC2 on every push to `main`.
- **PM2 Process Manager**: Production server managed with PM2 for zero-downtime restarts.

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 (Vite 7) | UI framework & build tool |
| React Router DOM v7 | Client-side routing & protected routes |
| Framer Motion | Animations & transitions |
| Vanilla CSS | Glassmorphism UI design system |
| Lucide React | Icon library |
| React Hot Toast | Toast notifications |

### Backend
| Technology | Purpose |
|---|---|
| Node.js & Express.js | REST API server |
| MongoDB & Mongoose | NoSQL database & ODM |
| Groq AI (Llama 3.3 / Llama 4 Scout) | Primary AI provider (text & vision) |
| Google Gemini (fallback) | Backup AI provider |
| JWT (access + refresh tokens) | Authentication |
| Bcrypt.js | Password hashing |
| Multer | File upload handling |
| PDF-Parse | PDF text extraction |
| Nodemailer | Email (OTP verification) |
| Zod | Schema validation |

### DevOps
| Technology | Purpose |
|---|---|
| AWS EC2 (Ubuntu) | Production hosting |
| PM2 | Process management |
| GitHub Actions | CI/CD pipeline |
| Nginx / iptables | Port 80 → 5000 routing |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster (whitelist IP `0.0.0.0/0`)
- Groq API Key (free at [console.groq.com](https://console.groq.com))
- *(Optional)* Google Gemini API Key as fallback

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Anzil049/Trrip.git
   cd Trrip
   ```

2. **Install dependencies**
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

3. **Environment Setup**
   Navigate to the `server` directory and rename `.env.example` to `.env`. Update the variables:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_ACCESS_SECRET=your_jwt_access_secret
   JWT_REFRESH_SECRET=your_jwt_refresh_secret
   CLIENT_URL=http://localhost:5173
   GROQ_API_KEY=gsk_your_groq_api_key
   GEMINI_API_KEY=your_gemini_api_key (optional fallback)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   MAIL_FROM="Trrip <your_email@gmail.com>"
   ```

4. **Run the Application**
   Open two terminal windows:
   
   **Terminal 1 (Backend):**
   ```bash
   cd server
   npm run dev
   ```

   **Terminal 2 (Frontend):**
   ```bash
   cd client
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

---

## 📁 Project Structure

```
Trrip/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Route-level pages
│   │   ├── state/             # Auth context & state management
│   │   └── utils/             # API helper & utilities
│   └── public/
├── server/                    # Express backend
│   ├── src/
│   │   ├── controllers/       # Route handlers
│   │   ├── models/            # Mongoose schemas
│   │   ├── routes/            # API route definitions
│   │   ├── services/          # AI service, extraction logic
│   │   └── middleware/        # Auth, error handling
│   └── .env.example
└── .github/workflows/         # CI/CD pipeline
```

---

## 💡 Architecture Highlights

- **Code Quality**: Strict separation of concerns — Controllers, Models, Routes, Services on the backend. Component-based modular architecture on the frontend.
- **API Design**: Clean RESTful endpoints with standard HTTP status codes and uniform JSON error handling.
- **UI/UX**: Premium glassmorphism aesthetic, micro-animations, skeleton loaders, and intuitive multi-step forms (6-box OTP input).
- **AI Resilience**: Dual-provider system (Groq → Gemini → static fallback) ensures the app never breaks, even when one API is rate-limited.

---

## 🌐 Live Demo

**URL**: `http://43.205.241.85`

---

*Crafted with passion for Orbitra Technologies.*
