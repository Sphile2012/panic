# Panic Ring

Personal safety app with real-time SOS alerts, GPS tracking, emergency contacts, and smartwatch support.

## Architecture

- **Frontend** — React + Vite (this folder)
- **Backend** — Node.js + Express + SQLite (`backend/` folder)

## Quick Start

### 1. Start the backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on **http://localhost:3001**

### 2. Start the frontend

```bash
# in the root folder
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**

The Vite dev server proxies all `/api/*` requests to the backend automatically.

## Environment Variables

### Frontend (`.env`)
```
VITE_API_URL=http://localhost:3001
```

### Backend (`backend/.env`)
```
PORT=3001
JWT_SECRET=your-secret-key-here
FRONTEND_URL=http://localhost:5173
```

## Features

- 🚨 SOS panic button (urgent / discreet / check-in modes)
- 📍 Real-time GPS tracking
- 👥 Emergency contacts with WhatsApp alerts
- 🗺️ Live map with safe zones
- 📱 Find My Device
- ⌚ Smartwatch integration with fall detection
- 🔋 Low battery alerts
- 📵 Offline mode with queued alerts
- 🔐 JWT authentication (register / login)
- 🛡️ Admin dashboard

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Current user |
| POST | `/api/entities/:entity/filter` | Query records |
| POST | `/api/entities/:entity` | Create record |
| PATCH | `/api/entities/:entity/:id` | Update record |
| DELETE | `/api/entities/:entity/:id` | Delete record |
| POST | `/api/functions/sendPanicAlert` | Trigger SOS |
| POST | `/api/functions/updateDeviceLocation` | Push GPS |
| POST | `/api/functions/findMyPhoneLogin` | Find device |
| POST | `/api/functions/sendLowBatteryAlert` | Battery alert |
| POST | `/api/functions/syncWatchLocation` | Watch sync |
| POST | `/api/functions/checkGeofence` | Geofence check |
