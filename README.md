# 🛡️ SafetyNet – Community SOS Alert Platform

SafetyNet is a **geolocation-powered emergency alert system** that empowers users to seek immediate help from nearby responders during critical situations. Designed for community safety, SafetyNet allows users to broadcast an SOS alert, share live location, and get real-time support from verified responders within their vicinity — similar to how Ola/Uber connects drivers and passengers via maps.

> ⚡️ MVP Backend built using **Node.js, Express, MongoDB** with optional support for **Redis** and **BullMQ** for scalable alert processing.

---

## ✨ Features (MVP)

### 👥 Authentication
- Secure user registration and login (JWT-based)
- Stores and updates user location on login
- Role-based access control (`isResponder`, `isAdmin`)

### 🚨 SOS System
- Trigger SOS alert with location and optional message
- Automatically notifies nearby responders (within 1km)
- Real-time responder acceptance tracking
- SOS can be resolved manually by victim or system

### 📍 Geolocation-Based Matching
- MongoDB Geospatial indexing (`2dsphere`)
- Fast `$nearSphere` queries to find helpers within range
- Live location updates via `/update-location`

### 🤝 Responder System
- Users can toggle their responder availability
- `/toggle-responder` instantly updates status
- Only online responders shown in nearby helper list

### 🛡️ Admin Dashboard (API-level)
- Admins can access all SOS alerts (`/sos/all`)
- View both resolved and unresolved requests
- Supports population of victim/responder info

---

## 📦 Tech Stack

| Layer     | Tech Used                   |
|-----------|-----------------------------|
| Language  | Node.js (ES6)               |
| Backend   | Express.js                  |
| Database  | MongoDB + Atlas             |
| Auth      | JWT                         |
| Queues    | [Optional] Redis + BullMQ   |
| GeoQuery  | MongoDB 2dsphere Index      |
| Deployment| Render / Railway / Vercel   |

---

## 🔐 Authentication

- JWT token is returned on register/login
- Must be sent in the `Authorization` header as:
  Authorization: Bearer <your_token>

## 📁 Folder Structure (Backend)
safetynet-backend/
│
├── controllers/ # Business logic
│ ├── authController.js
│ └── sosController.js
│
├── models/ # Mongoose schemas
│ ├── User.js
│ └── SOSAlert.js
│
├── routes/ # Express route handlers
│ ├── authRoutes.js
│ ├── sosRoutes.js
│ └── userRoutes.js
│
├── middleware/ # Auth + admin checks
│ └── auth.js
│
├── utils/ # Reusable helpers (coming soon)
│
├── server.js # Main Express app
└── .env # Environment variables

---

## 🧪 API Endpoints

### 🔐 Auth
| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/register` | POST | Register a user (name, email, password, lat, lng) |
| `/api/auth/login` | POST | Login user and update location |

---

### 🚨 SOS
| Route | Method | Description |
|-------|--------|-------------|
| `/api/sos/trigger` | POST | Victim triggers an SOS |
| `/api/sos/nearby` | GET | Find nearby responders |
| `/api/sos/accept/:sosId` | POST | Responder accepts an SOS |
| `/api/sos/resolve/:sosId` | POST | Victim or admin resolves SOS |
| `/api/sos/active` | GET | Get all unresolved SOS alerts |
| `/api/sos/all` | GET | Get all SOS alerts (admin only) |

---

### 👤 User
| Route | Method | Description |
|-------|--------|-------------|
| `/api/user/toggle-responder` | POST | Toggle responder availability |
| `/api/user/update-location` | POST | Update current location |
| `/api/user/me` | GET | Get logged-in user profile (coming soon) |

---

## 🌐 MongoDB Geospatial Setup

To enable `$nearSphere` geolocation queries, MongoDB must have a 2dsphere index:

- Collection: `users`
- Field: `location`
- Type: `2dsphere`

You can set it from **MongoDB Atlas UI** under **Indexes** tab.

---

## 🚀 Optional: Redis + BullMQ Integration

For production-scale async processing, these enhancements are recommended:

| Use Case | Redis | BullMQ |
|----------|-------|--------|
| Online responder cache | ✅ | ❌ |
| SOS notifications queue | ✅ | ✅ |
| Auto-resolve delays | ❌ | ✅ |
| Rate limit protection | ✅ | ❌ |

---

## ⚙️ Environment Variables (`.env`)

```env
PORT=5000
MONGODB_URI=<your_mongo_uri>
JWT_SECRET=<your_jwt_secret>
REDIS_URL=redis://localhost:6379
