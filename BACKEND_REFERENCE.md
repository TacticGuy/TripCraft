# TripCraft Backend Reference

## Quick Start

```bash
cd server
npm install
npm run dev
```

Server runs on: `http://localhost:5000`

## Project Structure

```
server/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── generateController.js
│   │   └── tripController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── apiRoutes.js
│   │   ├── authRoutes.js
│   │   └── tripRoutes.js
│   ├── services/
│   │   ├── groqService.js
│   │   ├── resendService.js
│   │   └── supabaseService.js
│   └── app.js
├── .env
└── package.json
```

## Environment Variables

Create `.env` in `server/` directory:

```
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# Email (Resend)
RESEND_API_KEY=your_resend_key

# AI (Groq)
GROQ_API_KEY=your_groq_key

# Google OAuth
GOOGLE_OAUTH_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret

# JWT
JWT_SECRET=your_jwt_secret_change_in_production
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Create new account
  - Body: `{ email, password, fullName }`
  - Returns: `{ success, message, requiresEmailVerification }`

- `POST /api/auth/login` - Login with email/password
  - Body: `{ email, password }`
  - Returns: `{ success, token, user }`

- `POST /api/auth/verify-email` - Verify email address
  - Body: `{ token }`
  - Returns: `{ success, message, user }`

- `POST /api/auth/google` - Google OAuth login
  - Body: `{ googleToken, profile }`
  - Returns: `{ success, token, user }`

- `GET /api/auth/me` - Get current user (requires JWT)
  - Returns: `{ success, user }`

### Trips

- `GET /api/trips` - Get user's trips (requires JWT)
- `GET /api/trips/:id` - Get single trip (requires JWT)
- `POST /api/trips` - Create trip (requires JWT)
- `PUT /api/trips/:id` - Update trip (requires JWT)
- `DELETE /api/trips/:id` - Delete trip (requires JWT)

### AI Generation

- `POST /api/generate/itinerary` - Generate trip itinerary (requires JWT)
  - Body: `{ tripId, destination, startDate, endDate, budget, interests }`

## Authentication Flow

1. User signs up → `handleSignup()` creates user in Supabase Auth
2. Backend generates verification token (hashed)
3. Email sent via Resend with verification link
4. User clicks link → `handleEmailVerification()` verifies token
5. Login allowed → `handleLogin()` issues JWT token
6. Protected routes check JWT via `authenticateToken` middleware

## Controllers

### authController.js

- `handleGoogleLogin()` - Process Google OAuth
- `handleSignup()` - Create new email/password user
- `handleLogin()` - Authenticate user, issue JWT
- `handleEmailVerification()` - Verify email address
- `verifyToken()` - Validate JWT
- `getUserById()` - Fetch user profile

### tripController.js

- `getUserTrips()` - List trips for user
- `getTripById()` - Get single trip details
- `createTrip()` - Create new trip
- `updateTrip()` - Update trip details
- `deleteTrip()` - Delete trip

### generateController.js

- `generateItinerary()` - Generate itinerary using Groq AI

## Services

### supabaseService.js
Initializes Supabase client with service key for admin operations.

### resendService.js
Sends emails via Resend API:
- `sendVerificationEmail()` - Verification email
- `sendWelcomeEmail()` - Welcome email after verification

### groqService.js
Generates trip itineraries using Groq AI API.

## Middleware

### authMiddleware.js
`authenticateToken` - Validates JWT in Authorization header:
```javascript
Authorization: Bearer <token>
```

### errorHandler.js
Global error handling middleware.

## Database Schema

### users table
```sql
id (UUID) - Primary key
email (VARCHAR) - Unique
full_name (VARCHAR)
avatar_url (VARCHAR)
google_id (VARCHAR) - Unique
auth_provider (VARCHAR) - 'email' or 'google'
email_verified (BOOLEAN)
verification_token (VARCHAR) - Hashed token
token_expires_at (TIMESTAMP) - Token expiry
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### trips table
```sql
id (UUID) - Primary key
user_id (UUID) - References users
destination (VARCHAR)
start_date (DATE)
end_date (DATE)
budget_level (VARCHAR)
num_travelers (INTEGER)
interests (TEXT)
itinerary (JSONB)
status (VARCHAR) - 'draft', 'published'
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

## Dependencies

- **express** - Web framework
- **jsonwebtoken** - JWT authentication
- **@supabase/supabase-js** - Database/Auth
- **axios** - HTTP client
- **groq-sdk** - AI API
- **cors** - Cross-origin requests
- **dotenv** - Environment variables
- **express-rate-limit** - Rate limiting

## Debugging

- Server logs all requests
- Check console for error messages
- Enable verbose logging for Supabase queries
- Monitor Resend dashboard for email sends
- Check Groq dashboard for AI usage
