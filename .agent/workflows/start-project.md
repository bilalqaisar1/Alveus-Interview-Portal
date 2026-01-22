---
description: How to start the Superio Job Portal project (Backend & Frontend)
---

Follow these steps to get the project up and running locally.

### Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB** (Ensure it is running at `mongodb://localhost:27017`)

---

### Step 1: Start the Backend
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend server:
   // turbo
   ```bash
   npm run server
   ```
   > The server will start on `http://localhost:5000`.

---

### Step 2: Start the Frontend
1. Open a **new** terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   // turbo
   ```bash
   npm run dev
   ```
   > The application will be available at the URL shown in the terminal (usually `http://localhost:5173`).

---

### Troubleshooting
- **Database Error**: Ensure MongoDB is running locally. You can check status with `systemctl status mongod`.
- **API Error**: Verify `VITE_BACKEND_URL` in `frontend/.env` matches the backend port (default: `http://localhost:5000`).
