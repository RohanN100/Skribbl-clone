# 🎨 Skribbl.io Clone (React + TypeScript + Express + Socket.IO)

A real-time multiplayer drawing and guessing game.

---

## 🛠️ Tech Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Socket.IO Client, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js, Express, Socket.IO Server, Prisma ORM, PostgreSQL.

---

## 🚀 Deployment Guide

### 1️⃣ Push Code to GitHub

Open a terminal in the root directory and run:
```bash
git init
git add .
git commit -m "Initial commit - Ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

---

### 2️⃣ Deploy Backend to Render

1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the Web Service settings:
   - **Name**: `skribbl-backend` (or your choice)
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Environment Variables:
   - `DATABASE_URL`: Your PostgreSQL database connection string (e.g. Supabase, ElephantSQL, or Render PostgreSQL).
   - `PORT`: `5000` (Render will set port automatically if omitted).
5. Click **Create Web Service**. Copy your backend live URL (e.g., `https://skribbl-backend.onrender.com`).

---

### 3️⃣ Deploy Frontend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/new) and import your GitHub repository.
2. Configure the project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Environment Variables:
   - Add variable: `VITE_SERVER_URL`
   - Value: `https://skribbl-backend.onrender.com` *(Replace with your Render backend URL)*
4. Click **Deploy**.

---

## 💻 Local Development

### Run Backend
```bash
cd server
npm install
npm run dev
```

### Run Frontend
```bash
cd client
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser!
