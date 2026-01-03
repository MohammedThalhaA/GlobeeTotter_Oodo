# GlobeTrotter 🌍

A personalized multi-city travel planning platform built for the hackathon.

## Tech Stack

- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL installed and running
- Git

### 1. Database Setup

Create the database in PostgreSQL:

```sql
CREATE DATABASE globetrotter_db;
```

Initialize the schema:

```bash
cd server
npm install
npm run db:init
```

### 2. Start Backend

```bash
cd server
npm run dev
```

Server runs at: http://localhost:5000

### 3. Start Frontend

```bash
cd client
npm install
npm run dev
```

App runs at: http://localhost:5173

## Features (Phase 1)

- ✅ User Authentication (Login/Signup)
- ✅ Dashboard with trip stats
- ✅ Create/View/Edit/Delete trips
- ✅ Trip list with search & filters
- ✅ Trip detail view with timeline
- ✅ Popular destinations showcase
- ✅ Responsive design

## Project Structure

```
Globee Trotter/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React context (Auth)
│   │   ├── pages/          # Page components
│   │   └── services/       # API service
│   └── package.json
│
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/         # Database config
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth middleware
│   │   ├── models/         # SQL schema
│   │   └── routes/         # API routes
│   └── package.json
│
└── README.md
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Trips
- `GET /api/trips` - Get all user trips
- `GET /api/trips/recent` - Get recent trips
- `GET /api/trips/stats` - Get trip statistics
- `POST /api/trips` - Create trip
- `GET /api/trips/:id` - Get trip details
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip

### Cities
- `GET /api/cities` - Search cities
- `GET /api/cities/popular` - Get popular cities
- `GET /api/cities/:id` - Get city with activities

## Coming in Phase 2

- Itinerary Builder with drag & drop
- City & Activity search
- Budget tracking
- Calendar/Timeline view
- Public sharing
