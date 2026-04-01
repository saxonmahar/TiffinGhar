# 🍱 TiffinGhar

**घरको खाना, ढोकासम्म** — Home food, to your door

A home-cooked meal delivery platform for Nepal, connecting home cooks with customers. Built with React Native (Expo) + Node.js + MongoDB.

---

## Project Structure

```
tiffinghar/          → Web prototype (React + Vite)
tiffinghar-app/      → Mobile app (React Native + Expo)
tiffinghar-backend/  → REST API (Node.js + Express + MongoDB)
```

---

## Setup

### Backend

```bash
cd tiffinghar-backend
cp .env.example .env      # fill in your values
npm install
node src/seed.js          # seed test data
npm run dev               # runs on :5000
```

### Mobile App

```bash
cd tiffinghar-app
npm install
# Update src/api/client.js → set BASE_URL to your PC's LAN IP
npx expo start
```

Scan the QR code with **Expo Go** on your phone.

---

## Environment Variables

Copy `tiffinghar-backend/.env.example` to `.env` and fill in:

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `PORT` | Server port (default 5000) |

---

## Tech Stack

| Layer | Tech |
|---|---|
| Mobile | React Native, Expo SDK 54 |
| Backend | Node.js, Express, MongoDB |
| Auth | JWT, phone-based login |
| Maps | OpenStreetMap (Leaflet via WebView) |
| Payment | eSewa (test mode) |
| Language | English + Nepali (नेपाली) |

---

## Features

- 📱 Customer & Cook onboarding
- 🔍 Smart search with food aliases
- 🗺️ Map view with cook locations
- 🛒 Cart with multi-step checkout
- 💚 eSewa payment (test mode)
- 📦 Order tracking with live progress
- ⭐ Rating & review system
- 🌐 Bilingual (EN/NE)

---

## Test Credentials

**eSewa Test:**
- Phone: `9806800001` | MPIN: `1122` | Password: `Nepal@123`

**App Login:** Any 10-digit phone number (auto-registers)
