# 🚗 RouteCraft

**RouteCraft** is a smart, interactive road trip and pitstop route planner built with a modern React + Vite frontend, interactive Leaflet mapping, and an Express.js / MongoDB backend.

---

## ✨ Features

- 🗺️ **Interactive Route Planning**: Calculate driving routes with waypoint support, turn-by-turn navigation, and distance/duration estimates.
- ⛽ **Smart Pitstop Discovery**: Find and filter stops along your path (gas stations, restaurants, hotels, scenic attractions, EV chargers).
- ⏱️ **Time & Budget Manager**: Track estimated drive time, break durations, fuel costs, and budget constraints.
- 💾 **Trip Saving & History**: Save, rename, organize, and reload your custom road trips.
- 🔐 **Authentication**: User accounts with secure JWT-based authentication.
- 🎨 **Modern Dark UI**: Glassmorphic styling powered by Tailwind CSS and Lucide icons.

---

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Leaflet, React-Leaflet, Lucide React, Axios, React Router
- **Backend**: Node.js, Express.js, MongoDB / Mongoose, JSON Web Tokens (JWT), bcryptjs, CORS, dotenv
- **Routing & Maps**: OpenStreetMap tiles, OSRM (Open Source Routing Machine) API

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB connection string (or local MongoDB)

### 1. Clone the repository
```bash
git clone https://github.com/kavyayemineni2005/RouteCraft.git
cd RouteCraft
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env # Configure your PORT, MONGO_URI, and JWT_SECRET
npm run dev # or npm start
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

The frontend will run at `http://localhost:5173` and the backend will run at `http://localhost:5000`.

---

## 📄 License
MIT
