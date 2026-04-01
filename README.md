# TripCraft — AI Travel Planner

AI-powered travel itinerary generator.

## Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: Supabase
- **Maps**: Leaflet.js + OpenStreetMap

## Setup

### 1. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `server` directory:
```
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Create a `.env` file in the `client` directory:
```
VITE_API_URL=http://localhost:5000/api
```

### 3. Run the Application

```bash
# Start the server (in server directory)
npm run dev

# Start the client (in client directory)
npm run dev
```

Open http://localhost:5173 in your browser.

## Features
- AI-powered itinerary generation
- Interactive map with OpenStreetMap
- AI-estimated daily budgets
- Day-by-day timeline with tips and costs
- User authentication with Supabase