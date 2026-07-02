# Aura Health - AI-Powered Personalized Health Monitoring System

Aura Health is a production-ready, clinical-grade digital wellness dashboard built for college project expos and portfolios. The application mimics a premium commercial product (inspired by Apple Health, Fitbit, and Stripe) and runs on a robust MERN stack with native Groq Cloud (Llama-3) AI integration.

---

## Tech Stack Overview

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS (custom HSL color tags & glassmorphic classes)
- **Animations**: Framer Motion (page transitions & breathing box timers)
- **Routing**: React Router DOM v6
- **Data Visualization**: Recharts (vitals telemetry trends)
- **Forms**: React Hook Form (validation & error triggers)
- **Client**: Axios (API interceptors for JWT)

### Backend
- **Framework**: Node.js & Express.js
- **Database**: MongoDB & Mongoose
- **Authorization**: JSON Web Tokens (JWT) & bcrypt hashing
- **Security**: Helmet, CORS, and Express Rate Limiter
- **Media Ingestion**: Multer file parser
- **OCR Engine**: Tesseract.js (local fallback) & Google Gemini Vision API

### AI / RAG Integration
- **LLM Engine**: Google Gemini API (`gemini-1.5-flash` for OCR, scoring, and advisor chat)
- **Vector Search (RAG)**: Gemini Embeddings (`text-embedding-004`) stored natively as number arrays in MongoDB with local cosine similarity calculation in Node.js.

---

## Architecture Highlight: Key Features
1. **Dynamic Health Score (0-100)**: Evaluates logged biometrics, weight, activity tiers, and sleep quality to generate an overall health status score.
2. **Vision-Based Medical Report OCR**: Upload blood panel images/PDFs. Gemini extracts data, flags abnormalities, and provides lifestyle tips.
3. **BLE Wearable Device Simulator**: Simulates step logs, heart rate variations, and sleep telemetry handshakes from Fitbit/Apple Health.
4. **Emergency SOS System**: Sounds a synthetic alarm via the Web Audio API, retrieves coordinates, and renders a profile QR Code containing medical tags.
5. **Guided Box Breathing Bubble**: Responsive breathing bubble animation to assist users with stress control.
6. **Admin oversight dashboard**: Audits user growth, chatbot volume, and telemetry distributions.

---

## Directory Structure

```
├── backend/
│   ├── config/db.js             # Mongo connection setup
│   ├── models/                  # Mongoose Schemas (User, VitalsLog, Reports, etc.)
│   ├── controllers/             # Endpoint logic (auth, telemetry, AI modules, admin)
│   ├── middleware/              # JWT protection & Multer upload buffers
│   ├── routes/                  # REST Router registrations
│   ├── services/                # Gemini prompt integrations & local RAG engines
│   ├── data/                    # Vector knowledge base seeder
│   └── server.js                # Main server entrypoint
│
├── frontend/
│   ├── src/
│   │   ├── context/             # Auth, Theme, and Notifications providers
│   │   ├── components/          # Reusable Navbar, Sidebar, GlassCards, Loaders
│   │   ├── pages/               # Landing page, dashboard, AI modules, logs
│   │   ├── services/api.js      # Axios client hook
│   │   ├── App.jsx              # Routing config
│   │   └── main.jsx             # React entrypoint
```

---

## Installation & Setup Guide

### 1. Prerequisites
- **Node.js** v18+ and **npm** v9+ installed.
- **MongoDB** running locally (`mongodb://localhost:27017`) or a MongoDB Atlas connection string.
- A **Google Gemini API Key** (optional, fallback mock intelligence active by default).

### 2. Configure Backend
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Set up environment variables. Rename `.env.example` to `.env` or edit the existing `.env` file:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/personalized_health
   JWT_SECRET=expo_secret_321456
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
3. Seed the local RAG knowledge base. This fetches embeddings from Gemini and stores them in your database:
   ```bash
   npm run seed
   ```
4. Launch the API server:
   ```bash
   npm run dev
   ```
   *The backend will boot on `http://localhost:5000`.*

### 3. Configure Frontend
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Launch the Vite dev server:
   ```bash
   npm run dev
   ```
   *The application will boot on `http://localhost:5173`.*

---

## Verification & Walkthrough Instructions
1. **Landing Page**: Navigate to `http://localhost:5173/landing`. Click **Register** to create an account.
2. **Setup Profile**: Complete your demographics (height, weight, known conditions, and emergency contacts) to configure risk baselines.
3. **Wearable Sync**: Click **Sync Wearable Data** on the main dashboard to sync simulated telemetry (steps, sleep, SpO2 Spikes) from Fitbit.
4. **AI Assistant**: Open the AI Assistant page. Type general fitness questions or prompt details. Tap the **Microphone** icon to dictate questions. Click the **Volume** icon on responses to hear them spoken.
5. **Medical Report OCR**: Navigate to the Report Analyzer page. Upload a report image or PDF (e.g., blood work sample). Aura will parse parameters, flag abnormal results, and suggest lifestyle habits.
6. **SOS Alarm**: Trigger the emergency SOS widget. Notice the 3s cancel buffer, Web Audio synth alarm, GPS link generation, and printable medical profile QR code.
7. **Reports PDF**: Navigate to Clinical Reports page, review the aggregated summaries, and tap **Export Clinical PDF** to print or save the document.

---

## Production Deployment Guide

### Backend (Render / Railway)
1. Commit code to a GitHub repository.
2. Create a new Web Service on Render or Railway, link the repo, and set build/start commands:
   - Build Command: `npm install`
   - Start Command: `node server.js`
3. Add the `.env` variables under **Environment Variables** settings.

### Frontend (Vercel / Netlify)
1. Create a new project on Vercel, linking the repository.
2. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Vercel automatically deploys the responsive React site and provides a production SSL link.
