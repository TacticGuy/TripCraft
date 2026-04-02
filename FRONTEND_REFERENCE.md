# TripCraft Frontend Reference

## Quick Start

```bash
cd client
npm install
npm run dev
```

Server runs on: `http://localhost:5173`

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── ItineraryTimeline.jsx
│   │   ├── MapWidget.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── Toast.jsx
│   │   └── TripForm.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── AuthPages.css
│   │   ├── Dashboard.css
│   │   ├── DashboardPage.jsx
│   │   ├── ItineraryView.jsx
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   ├── TripPlanningPage.jsx
│   │   └── VerifyEmailPage.jsx
│   ├── services/
│   │   └── backendClient.js
│   ├── utils/
│   │   └── mapHelpers.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── index.html
├── vite.config.js
└── package.json
```

## Key Features

- **Authentication**: Email/Password + Google OAuth
- **Email Verification**: Required before login
- **Trip Planning**: Create and manage trips
- **Real-time Collaboration**: Share trips with others
- **Map Integration**: View destinations on map
- **Itinerary Timeline**: Visual trip timeline

## Environment Variables

Create `.env` in `client/` directory:

```
VITE_API_URL=http://localhost:5000/api
```

## Available Routes

- `/` - Landing page
- `/login` - Login page
- `/signup` - Sign up page
- `/auth/verify-email` - Email verification page
- `/dashboard` - User dashboard (protected)
- `/trip-planning/:id` - Trip planning page (protected)
- `/trips/:id` - Itinerary view (protected)

## Authentication Flow

1. User signs up with email/password
2. Verification email sent to inbox
3. Click verification link to confirm email
4. Login with verified email
5. JWT token stored in localStorage
6. Automatically refreshed on page load

## Components

### Toast Component
Notification system for user feedback.

```javascript
import { useToast } from '../components/Toast';

function MyComponent() {
  const { showToast } = useToast();
  
  showToast('Success!', 'success', 3000);
  showToast('Warning!', 'warning', 3000);
  showToast('Error!', 'error', 3000);
}
```

### ProtectedRoute Component
Wraps routes that require authentication.

```javascript
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>
```

## Build & Deploy

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Debugging

- Open browser DevTools (F12)
- Check Console tab for errors
- Check Network tab to see API requests
- Check Application > localStorage for JWT token
