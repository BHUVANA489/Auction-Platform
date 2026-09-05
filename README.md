# 🏷️ MERN Stack Auction Platform

A full-stack real-time auction platform built using **MongoDB, Express, React (Vite), and Node.js**, featuring automated auction conclusion, commission settlement, user authentication, image uploads, and bidding management.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** (Choose either **Local MongoDB** or **MongoDB Atlas**)

---

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install
```

#### Environment Configuration
Copy the example config file:
```bash
# On Windows PowerShell:
Copy-Item config/config.env.example config/config.env

# On Mac/Linux:
cp config/config.env.example config/config.env
```

Open `backend/config/config.env` and configure your database:

#### 🍃 Database Configuration Options:

- **Option A: Local MongoDB (Recommended for instant local development)**
  Make sure your local MongoDB service is running, then set:
  ```env
  MONGO_URI=mongodb://127.0.0.1:27017/MERN_AUCTION_PLATFORM
  ```

- **Option B: MongoDB Atlas (Cloud Database)**
  1. Create a free cluster at [MongoDB Atlas](https://cloud.mongodb.com).
  2. In Atlas, go to **Network Access** -> **Add IP Address** -> select **"Allow Access from Anywhere" (`0.0.0.0/0`)**.
  3. In **Database Access**, create a database user and password.
  4. Click **Connect** -> **Drivers** and copy your connection string:
  ```env
  MONGO_URI=mongodb+srv://<username>:<password>@cluster0.yourcluster.mongodb.net/?retryWrites=true&w=majority
  ```
  *(Note: If your password contains special characters like `@` or `#`, make sure they are URL-encoded).*

#### Start Backend Server:
```bash
npm run dev
```
The backend server runs on `http://localhost:5000`.

---

### 2. Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
The frontend application will be live at `http://localhost:5173`.

---

## ⚙️ Environment Variables Reference

### Backend (`backend/config/config.env` or `backend/.env`)

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Backend server port | `5000` |
| `MONGO_URI` | MongoDB connection string (Local or Atlas) | `mongodb://127.0.0.1:27017/MERN_AUCTION_PLATFORM` |
| `JWT_SECRET_KEY` | Secret key used for signing JWT tokens | `mysupersecretkey123456789` |
| `JWT_EXPIRE` | JWT expiry duration | `7d` |
| `COOKIE_EXPIRE` | Cookie expiry in days | `7` |
| `FRONTEND_URL` | Frontend URL allowed by CORS | `http://localhost:5173` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name for image uploads | Your Cloudinary Cloud Name |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Your Cloudinary API Key |
| `CLOUDINARY_API_SECRET`| Cloudinary API secret | Your Cloudinary API Secret |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_MAIL` / `SMTP_PASSWORD` | Optional SMTP configuration for email alerts | Gmail SMTP credentials |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_BACKEND_URL` | Backend server API URL | `http://localhost:5000` |

---

## 🛠️ Common Troubleshooting

### 1. `querySrv ENOTFOUND _mongodb._tcp...`
- **Cause**: The MongoDB Atlas cluster hostname could not be found via DNS. This happens when the Atlas cluster was deleted, paused, misspelled, or blocked by local ISP DNS.
- **Fixes**:
  1. Verify the cluster hostname in `config.env`.
  2. Ensure your IP address is whitelisted in MongoDB Atlas under **Network Access** (`0.0.0.0/0`).
  3. The backend has **built-in automatic fallback**: if Atlas fails, it automatically connects to your local MongoDB at `mongodb://127.0.0.1:27017/MERN_AUCTION_PLATFORM`.

### 2. `AuthenticationFailed` or `bad auth`
- **Cause**: Incorrect database username or password in `MONGO_URI`.
- **Fix**: Check your credentials in MongoDB Atlas **Database Access**. Remember to URL-encode special characters in the password.

### 3. `EADDRINUSE: address already in use :::5000`
- **Cause**: Another node process or terminal is already running on port 5000.
- **Fix**: Stop the existing process running on port 5000 or change `PORT=5001` in `config.env`.

---

## 📂 Project Structure

```
├── backend/
│   ├── automation/          # Background cron jobs (ended auctions, commission settlement)
│   ├── config/              # Configuration files & environment loader
│   ├── controllers/         # Express controllers (user, auction, bid, commission)
│   ├── database/            # Resilient MongoDB connection handler with auto-fallback
│   ├── middlewares/         # Auth, error handling, async wrapper
│   ├── models/              # Mongoose schemas & models
│   ├── router/              # Express API route declarations
│   ├── utils/               # JWT helper, email sender
│   ├── app.js               # Express application initialization
│   └── server.js            # Server entry point
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── pages/           # Application views
│   │   ├── store/slices/    # Redux Toolkit slices (configured with dynamic BACKEND_URL)
│   │   └── config.js        # Centralized API configuration
│   └── vite.config.js       # Vite build configuration
└── README.md
```
