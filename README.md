<a id="readme-top"></a>

[![Issues][issues-shield]][issues-url]
[![Stars][stars-shield]][stars-url]
[![Forks][forks-shield]][forks-url]

<br />
<div align="center">
  <a href="https://github.com/TacticGuy/TripCraft">
    <img src="client/src/assets/TripCraftLogo.png" alt="TripCraft logo" width="220">
  </a>

  <h3 align="center">TripCraft</h3>

  <p align="center">
    An AI-powered travel planner that turns a destination and a date range into a day-by-day itinerary with an interactive map and budget estimates.
    <br />
    <a href="#getting-started"><strong>Explore the setup guide »</strong></a>
    <br />
    <br />
    <a href="https://tripcraft-client.vercel.app">View Demo</a>
    &middot;
    <a href="https://github.com/TacticGuy/TripCraft/issues/new?labels=bug">Report Bug</a>
    &middot;
    <a href="https://github.com/TacticGuy/TripCraft/issues/new?labels=enhancement">Request Feature</a>
  </p>
</div>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#environment-variables">Environment Variables</a></li>
        <li><a href="#running-locally">Running Locally</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#deployment">Deployment</a></li>
    <li><a href="#troubleshooting">Troubleshooting</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

## About The Project

TripCraft takes a destination, travel dates, budget level, number of travelers and interests, and asks an LLM to generate a realistic day-by-day itinerary. Every activity is plotted on a map, and daily costs are estimated so you can see the likely total before you go.

Key features:

* **AI itinerary generation** with 4–6 timed activities per day, tips and a suggested place to stay
* **Interactive map** of every activity and hotel, filterable by day, with English place labels worldwide
* **Budget estimates** per day and per trip, switchable between USD and INR
* **Accounts** via email and password (with email verification) or Google sign-in
* **Saved trips** that you can reopen, update or delete from your dashboard

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

[![React][React-badge]][React-url]
[![Vite][Vite-badge]][Vite-url]
[![Node.js][Node-badge]][Node-url]
[![Express][Express-badge]][Express-url]
[![Supabase][Supabase-badge]][Supabase-url]
[![Leaflet][Leaflet-badge]][Leaflet-url]
[![Vercel][Vercel-badge]][Vercel-url]

* **AI:** [Groq](https://groq.com) (`openai/gpt-oss-120b` by default)
* **Map tiles:** [CARTO](https://carto.com/basemaps) Voyager, using [OpenStreetMap](https://www.openstreetmap.org) data

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting Started

Follow these steps to run TripCraft locally.

### Prerequisites

* Node.js 18 or newer and npm
* A [Supabase](https://supabase.com) project (run [DATABASE_SCHEMA.sql](DATABASE_SCHEMA.sql) in its SQL editor)
* A free [Groq](https://console.groq.com) API key
* A [Google OAuth client ID](https://console.cloud.google.com/apis/credentials) (for Google sign-in)
* A [CARTO basemaps API key](https://carto.com/basemaps/maps/apikey) (for the map)

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/TacticGuy/TripCraft.git
   cd TripCraft
   ```
2. Install server dependencies
   ```sh
   cd server
   npm install
   ```
3. Install client dependencies
   ```sh
   cd ../client
   npm install
   ```

### Environment Variables

Create `server/.env`:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development

GROQ_API_KEY=<from console.groq.com>
# GROQ_MODEL=openai/gpt-oss-120b   # optional override

SUPABASE_URL=<project url>
SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_KEY=<service role key>

JWT_SECRET=<long random string; required when NODE_ENV=production>
GOOGLE_OAUTH_ID=<Google OAuth client id, used to validate Google sign-in tokens>
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_OAUTH_ID=<Google OAuth client id>
VITE_CARTO_API_KEY=<CARTO basemaps API key>
```

> `CLIENT_URL` accepts several comma-separated origins. Never put server secrets in a `VITE_` variable: those are public in the browser bundle.

**Supabase setup for email sign-up:** under **Authentication → URL Configuration**, set the **Site URL** to your client URL and add `http://localhost:5173/auth/verify-email` to the Redirect URLs. The default confirmation email template works as-is. A custom template linking to `{{ .SiteURL }}/auth/verify-email?token_hash={{ .TokenHash }}&type=email` also works. Supabase's built-in mailer has a low hourly limit, so for anything beyond testing configure a custom SMTP provider (for example Brevo) under **Authentication → SMTP Settings**.

### Running Locally

```sh
# Terminal 1: API server (from /server)
npm run dev

# Terminal 2: client (from /client)
npm run dev
```

Open http://localhost:5173 in your browser.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Usage

1. Sign up (confirm your email) or continue with Google.
2. Open **Plan Trip**, enter a destination, dates, budget level, travelers and interests, then generate.
3. Browse the day-by-day timeline, click an activity to jump to it on the map, and toggle USD / INR.
4. Click **Save Trip** to keep it. Your saved trips live on the **Dashboard**.

More detail on the code is in [BACKEND_REFERENCE.md](BACKEND_REFERENCE.md), [FRONTEND_REFERENCE.md](FRONTEND_REFERENCE.md) and [DATABASE_SCHEMA.sql](DATABASE_SCHEMA.sql).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Deployment

TripCraft deploys to [Vercel](https://vercel.com) as **two projects** from the same repo.

1. **Server:** root directory `server`. Set all the server environment variables above, with `NODE_ENV=production` and `CLIENT_URL` set to the client's URL. Check `/health` after deploying.
2. **Client:** root directory `client`. Set `VITE_API_URL` (`https://<server>.vercel.app/api`), `VITE_GOOGLE_OAUTH_ID` and `VITE_CARTO_API_KEY`. Vite bakes these in at build time, so redeploy after changing them.
3. Add the client URL to Supabase (Site URL and Redirect URLs), to the Google OAuth client's Authorized JavaScript origins, and to the CARTO key's allowed domains.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Troubleshooting

**"Failed to fetch" on login or generate**
* Make sure the server is running and `VITE_API_URL` points to it. Restart the client after editing `.env`.
* In production, check that `CLIENT_URL` on the server exactly matches the client's URL and that the client was redeployed after setting `VITE_API_URL`.

**"Cannot find package" errors:** run `npm install` in the `server` directory.

**Map shows "API KEY REQUIRED":** set `VITE_CARTO_API_KEY` and restart the client.

**Itinerary generation returns a "model not found" error:** Groq retires models over time. Set `GROQ_MODEL` in `server/.env` to a model your key can access.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Roadmap

- [x] AI itinerary generation
- [x] Interactive map with day filters
- [x] Email and Google authentication
- [x] Save, reopen and delete trips
- [ ] Edit activities inside a saved itinerary
- [ ] Share a trip with collaborators
- [ ] Export an itinerary to PDF
- [ ] More display currencies

See the [open issues](https://github.com/TacticGuy/TripCraft/issues) for proposed features and known issues.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contributing

Contributions are what make the open source community such a great place to learn, inspire and create. Any contributions you make are **greatly appreciated**.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contact

TacticGuy: [@TacticGuy](https://github.com/TacticGuy)

Project link: [https://github.com/TacticGuy/TripCraft](https://github.com/TacticGuy/TripCraft)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Acknowledgments

* [Best-README-Template](https://github.com/othneildrew/Best-README-Template)
* [Groq](https://groq.com), [Supabase](https://supabase.com), [Leaflet](https://leafletjs.com)
* [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors and [CARTO](https://carto.com/attributions) for the map

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[issues-shield]: https://img.shields.io/github/issues/TacticGuy/TripCraft.svg?style=for-the-badge
[issues-url]: https://github.com/TacticGuy/TripCraft/issues
[stars-shield]: https://img.shields.io/github/stars/TacticGuy/TripCraft.svg?style=for-the-badge
[stars-url]: https://github.com/TacticGuy/TripCraft/stargazers
[forks-shield]: https://img.shields.io/github/forks/TacticGuy/TripCraft.svg?style=for-the-badge
[forks-url]: https://github.com/TacticGuy/TripCraft/network/members
[React-badge]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://react.dev
[Vite-badge]: https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white
[Vite-url]: https://vitejs.dev
[Node-badge]: https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white
[Node-url]: https://nodejs.org
[Express-badge]: https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white
[Express-url]: https://expressjs.com
[Supabase-badge]: https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white
[Supabase-url]: https://supabase.com
[Leaflet-badge]: https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white
[Leaflet-url]: https://leafletjs.com
[Vercel-badge]: https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white
[Vercel-url]: https://vercel.com
