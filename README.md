# Trrip AI - Intelligent Travel Itinerary Generator ✈️🌍

![Trrip AI Demo](https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80)

Trrip AI is a sophisticated **MERN-based web application** that automatically generates highly personalized travel itineraries by extracting data from uploaded booking documents (flight tickets, hotel reservations, etc.) using Artificial Intelligence.

This project was developed as a submission for the **Junior Full Stack Developer (MERN + AI)** role at Orbitra Technologies Pvt. Ltd.

---

## ✨ Core Features & Implementation Details

### 🔐 Authentication (JWT)
- **Secure Access Flow**: Implemented robust JWT-based authentication using short-lived `access` tokens and long-lived `refresh` tokens securely stored in `httpOnly` cookies to prevent XSS attacks.
- **Email Verification (OTP)**: Registration requires verifying a 6-digit OTP sent via email (integrated with Nodemailer).
- **Password Recovery**: Full "Forgot Password" flow with OTP email verification.

### 📄 Travel Booking Upload & Data Extraction
- **Drag-and-Drop Interface**: Users can seamlessly drag and drop their booking documents (PDFs or Images) directly onto the landing page.
- **Document Processing**: The Node.js backend handles `multipart/form-data` uploads safely.
- **AI-Powered Extraction**: Leverages Google Gemini AI to intelligently read and extract structured data (Destination, Dates, etc.) from unstructured travel documents.

### 🤖 AI Itinerary Generation
- **Context-Aware Prompts**: The backend generates highly structured JSON itineraries based on the extracted data combined with user preferences (Budget, Interests, Transport, Pace).
- **Resilience**: Features automated fallback models and retry mechanisms to handle AI API rate limits gracefully.

### 🗄️ Itinerary Management & Database Architecture
- **MongoDB Persistence**: Uses Mongoose for schema validation, storing user data, pending registrations, and complex nested itinerary documents.
- **User Dashboard**: A personalized workspace where logged-in users can browse their generated trip histories and manage saved itineraries.

### 🔗 Creative Sharing Experience
- **Public Share Links**: Users can generate a unique `shareToken` for any itinerary.
- **Interactive Toasts**: Clean UI to copy links to the clipboard, allowing friends or family to view the itinerary on a dedicated read-only public route (`/share/:token`) without needing an account.

---

## 🛠️ Technology Stack

**Frontend (Client)**
- React 19 (Vite)
- React Router DOM (Protected Routes, Hash Routing)
- CSS (Vanilla, Modern Glassmorphism UI)
- Lucide React (Icons)
- React Hot Toast (Interactive notifications)

**Backend (Server)**
- Node.js & Express.js
- MongoDB & Mongoose (NoSQL Database)
- Google Generative AI SDK (Gemini 2.5/3.5)
- JSON Web Tokens (JWT)
- Bcrypt.js (Password hashing)
- Multer (File upload handling)
- PDF-Parse (Document parsing)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster (Ensure your IP is whitelisted `0.0.0.0/0`)
- Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-link>
   cd Trripp
   ```

2. **Install dependencies**
   Install both client and server dependencies:
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

3. **Environment Setup**
   Navigate to the `server` directory and rename `.env.example` to `.env`. Update the variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_access_secret
   JWT_REFRESH_SECRET=your_jwt_refresh_secret
   GEMINI_API_KEY=your_google_gemini_api_key
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
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

## 💡 Evaluation Criteria Addressed
- **Code Quality & Folder Structure**: Strict separation of concerns (Controllers, Models, Routes, Services) on the backend. Component-based modular architecture on the frontend.
- **API Design**: Clean, RESTful API endpoints with standard HTTP status codes and uniform JSON error handling.
- **UI/UX Quality**: Premium "glassmorphism" aesthetic, micro-animations, skeleton loaders, and intuitive multi-step forms (e.g., 6-box OTP input).
- **Problem-solving**: Engineered a multi-model fallback system for the AI API to ensure stability against free-tier rate limits.

---
*Crafted with passion for Orbitra Technologies.*
