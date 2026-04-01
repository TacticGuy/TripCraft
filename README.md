# TripCraft — AI Travel Planner

AI-powered travel itinerary generator using **Groq** (free) and **OpenStreetMap** (Leaflet.js, free).

## Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **AI**: Groq API — llama-3.3-70b-versatile (free tier at console.groq.com)
- **Maps**: Leaflet.js + OpenStreetMap (completely free, no key needed)

## Setup

### 1. Get your free Groq API key
Sign up at [console.groq.com](https://console.groq.com) → API Keys → Create key. It's free.

### 2. Server
```bash
cd server
npm install
# Edit .env — set GROQ_API_KEY=your_key_here
npm run dev
```

### 3. Client
```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173

## Environment Variables

### server/.env
```
GROQ_API_KEY=your_key_here
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### client/.env
```
VITE_API_URL=http://localhost:5000/api
```

## Features
- 🤖 AI itineraries via Groq (llama-3.3-70b) — fast & free
- 🗺️ Interactive map with OpenStreetMap — no API key needed
- 💰 AI-estimated daily budgets
- 📋 Day-by-day timeline with tips and costs
