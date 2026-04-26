# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Travel Memories is a full-stack web application that displays travel photos from Google Photos on an interactive map and timeline. It uses OAuth 2.0 for authentication and extracts location data from photo EXIF metadata.

## Architecture

### Backend (`backend/`)
- **Framework**: Node.js + Express
- **Port**: 3001
- **Responsibilities**:
  - OAuth 2.0 authentication via Google Auth Library
  - Fetches photos from Google Photos Library API (filtered by date range)
  - Serves REST API endpoints
  - Handles file uploads via Multer
  - Stores photos locally in `uploads/` directory

### Frontend (`frontend/`)
- **Framework**: React + Vite
- **Port**: 5173
- **Responsibilities**:
  - **Map.jsx**: Displays visited locations using Leaflet + React-Leaflet
  - **Timeline.jsx**: Shows photos chronologically
  - **PhotoGrid.jsx**: Renders individual photos
  - **App.jsx**: Main component managing authentication and tab navigation
  - Styling via Tailwind CSS

### Key Integration Points
1. Frontend calls `http://localhost:3001/api/auth/login` to initiate OAuth flow
2. Backend redirects to `http://localhost:5173?authenticated=true` after successful auth
3. Frontend fetches photos from `/api/photos` endpoint
4. Photos include EXIF coordinates for map display

## Development Commands

### Backend
```bash
cd backend
npm install          # Install dependencies
npm start            # Start production server (port 3001)
npm run dev          # Start with file watch (--watch)
```

### Frontend
```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Start dev server (port 5173)
npm run build        # Build for production
npm run preview      # Preview production build
```

## Configuration

### Backend Setup
1. Copy `backend/.env.example` to `backend/.env`
2. Add Google OAuth credentials:
   - `GOOGLE_CLIENT_ID`: From Google Cloud Console
   - `GOOGLE_CLIENT_SECRET`: From Google Cloud Console
   - `PORT`: Default 3001

### Google Cloud Setup
- API required: Google Photos Library API
- OAuth 2.0 Desktop Application credentials
- Redirect URI: `http://localhost:3001/api/auth/callback`

## Customization

### Change Photo Date Range
Edit `backend/server.js` line 85-90 in the `/api/photos` endpoint:
```javascript
dateFilter: {
  ranges: [{
    startDate: { year: 2026, month: 3, day: 15 },
    endDate: { year: 2026, month: 4, day: 3 },
  }],
}
```

### Styling
- Tailwind CSS config: `frontend/tailwind.config.js`
- Component styles: Inline in JSX files and `frontend/src/index.css`

## Token Storage Note

Access tokens are currently stored in-memory (`backend/server.js` line 44). This resets on server restart. For production, persist tokens in a database.

## Common Development Flow

1. **Start backend first** in one terminal: `cd backend && npm run dev`
2. **Start frontend** in another terminal: `cd frontend && npm run dev`
3. **Test OAuth flow** by clicking the login button in the frontend
4. Browser should redirect back after Google authentication
5. Photos load and display on map/timeline

## Troubleshooting

- **CORS errors**: Backend not running on port 3001
- **OAuth failures**: Check `.env` credentials match Google Cloud Console settings
- **Missing location data**: Photos need EXIF metadata or explicit location tags in Google Photos
- **Photos not loading**: Verify date range in `server.js` matches your Google Photos dates

## Large Task Management

When large-scale or multiple complex tasks arise, use the **Agent tool** with specialized agents to parallelize work. This approach allows independent tasks to be processed simultaneously without blocking the main context.

**Examples of when to invoke agents**:
- Multiple unrelated features need to be implemented simultaneously
- Large-scale refactoring across frontend and backend
- Complex bug investigations requiring parallel exploration
- Performance optimization across different components

Agent types available: `Explore` (codebase exploration), `general-purpose` (research and complex tasks), `Plan` (architecture design)
