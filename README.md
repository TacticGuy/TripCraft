# TripCraft — AI Travel Planner

AI-powered travel itinerary generator.

## Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: Supabase
- **Maps**: Leaflet.js + OpenStreetMap

## Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repo-url>
cd tripcraft-modified

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
GROQ_API_KEY=<from console.groq.com>
SUPABASE_URL=<project url>
SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_KEY=<service role key>
JWT_SECRET=<long random string; required when NODE_ENV=production>
GOOGLE_OAUTH_ID=<Google OAuth client id; used to validate Google sign-in tokens>
```

In Supabase, set **Authentication → URL Configuration → Site URL** to your client URL and add
`http://localhost:5173/auth/verify-email` to the Redirect URLs. The default confirmation email template
works as-is; a custom template linking to
`{{ .SiteURL }}/auth/verify-email?token_hash={{ .TokenHash }}&type=email` also works.

Create a `.env` file in the `client` directory:
```
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_OAUTH_ID=<Google OAuth client id>
```

### 3. Run the Application

```bash
# Start the server (in server directory)
npm run dev

# Start the client (in client directory)
npm run dev
```

Open http://localhost:5173 in your browser.

## Troubleshooting

**"Failed to fetch" error?**
1. Make sure the backend server is running (`npm run dev` in server directory)
2. Check that `client/.env` has `VITE_API_URL=http://localhost:5000/api`
3. Restart the client after creating/updating `.env` file

**"Cannot find package" errors?**
- Run `npm install` in the `server` directory to install all dependencies

## Features
- AI-powered itinerary generation
- Interactive map with OpenStreetMap
- AI-estimated daily budgets
- Day-by-day timeline with tips and costs
- User authentication with Supabase