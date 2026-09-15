# 🎨 Skribbl.io Clone — Full Stack Real-Time Game

A modern, responsive, full-stack Skribbl.io clone built with **React**, **TypeScript**, **Vite**, **Express**, **Socket.IO**, and **Tailwind CSS v4**.

---

## ✨ Key Features

- 🔌 **Real-Time Multiplayer**: Built with persistent Socket.IO websockets for multi-device gameplay.
- 🎨 **Synchronized Drawing Canvas**: Real-time resolution-independent canvas with color sync, brush sizing (`S`, `M`, `L`, `XL`), eraser tool, and canvas clearing across all connected devices.
- ⏱️ **Game Loop & Turn Timer**: Auto-rotating drawer turns, secret word assignment, countdown timer ticks, and automated turn changes.
- 🏆 **Dynamic Leaderboard & Winners**: Live score updates on correct guesses, final leaderboard with Gold/Silver/Bronze medals, and celebratory confetti effects.
- 📱 **100% Mobile & Desktop Responsive**: Custom mobile tab bar (`Canvas` | `Scores` | `Chat`), responsive grid layouts, and glassmorphism UI containers.
- 🔄 **Room Reuse ("Play Again")**: Seamless transition from Game Over back to Lobby using the same room and socket connection.

---

## 🛠️ Tech Stack

### Frontend (`/client`)
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Lucide Icons
- **Websockets**: `socket.io-client`
- **Effects**: `canvas-confetti`

### Backend (`/server`)
- **Runtime**: Node.js + Express
- **Websockets**: `socket.io`
- **ORM & Database**: Prisma + PostgreSQL (with in-memory fallback resiliency)

---

## 🔌 Socket.IO Contract Specification

| Event | Direction | Payload | Description |
|---|---|---|---|
| `create_room` | Client $\rightarrow$ Server | `username: string` | Request new room creation |
| `room_created` | Server $\rightarrow$ Client | `{ roomId, code, player }` | Emitted to creator on success |
| `join_room` | Client $\rightarrow$ Server | `{ code: string, username: string }` | Join room by 6-letter code |
| `room_joined` | Server $\rightarrow$ Client | `{ roomId, code, players }` | Emitted to joiner on success |
| `player_joined` | Server $\rightarrow$ Room | `{ players }` | Broadcast to existing players |
| `start_game` | Client $\rightarrow$ Server | None | Request game start (min 2 players) |
| `game_started` | Server $\rightarrow$ Room | `{ gameId, currentRound, totalRounds, drawerId }` | Emitted when game begins |
| `turn_changed` | Server $\rightarrow$ Room | `{ currentRound, totalRounds, drawerId }` | Emitted on new turn |
| `drawer_word` | Server $\rightarrow$ Drawer | `{ word: string }` | Emitted ONLY to current drawer |
| `timer_tick` | Server $\rightarrow$ Room | `{ timeLeft: number }` | 1-second countdown tick |
| `draw_start` | Client $\leftrightarrow$ Server | `{ x, y, color, size }` | Real-time stroke start |
| `draw_move` | Client $\leftrightarrow$ Server | `{ x, y, color, size }` | Real-time stroke move |
| `draw_end` | Client $\leftrightarrow$ Server | None | Real-time stroke end |
| `draw_clear` | Client $\leftrightarrow$ Server | None | Real-time canvas clear |
| `submit_guess` | Client $\rightarrow$ Server | `guess: string` | Submit a guess |
| `correct_guess` | Server $\rightarrow$ Room | `{ playerId, username, points }` | Emitted on correct answer |
| `scores_updated` | Server $\rightarrow$ Room | `{ players }` | Broadcast updated scores |
| `chat_message` | Client $\leftrightarrow$ Server | `{ message: string }` | General room chat |
| `game_finished` | Server $\rightarrow$ Room | `{ gameId }` | Game finished event |

---

## 🚀 Deployment Guide

### 1️⃣ Push to GitHub
```bash
git add .
git commit -m "Final Submission - Full Stack Skribbl Clone"
git push origin main
```

### 2️⃣ Backend Deployment (Render)
1. Create a **Web Service** on [Render](https://dashboard.render.com/).
2. Set **Root Directory** to `server`.
3. Set **Build Command**: `npm install && npm run build`
4. Set **Start Command**: `npm start`
5. Set Environment Variable `DATABASE_URL` (PostgreSQL connection string).

### 3️⃣ Frontend Deployment (Vercel)
1. Import repository on [Vercel](https://vercel.com/).
2. Set **Root Directory** to `client`.
3. Set **Build Command**: `npm run build`
4. Set **Output Directory**: `dist`
5. Add Environment Variable:
   - `VITE_SERVER_URL`: `https://your-backend.onrender.com`
6. Click **Deploy**.

---

## 💻 Local Setup

```bash
# 1. Run Backend (Port 5000)
cd server
npm install
npm run dev

# 2. Run Frontend (Port 5173)
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser!
