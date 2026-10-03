# AI Club & AI Lab - Authentication Backend

Production-ready, secure REST API backend for the **AI Club & AI Lab** member portal at Sri Shakthi Institute of Engineering & Technology (SIET).

Built with **Node.js, Express.js, MongoDB, Mongoose, bcryptjs, JWT, Helmet, CORS, and Express-Rate-Limit**.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Folder Structure](#folder-structure)
3. [Technology Stack](#technology-stack)
4. [Prerequisites & MongoDB Setup](#prerequisites--mongodb-setup)
5. [Installation & Setup](#installation--setup)
6. [Starting the Backend](#starting-the-backend)
7. [API Endpoints & Documentation](#api-endpoints--documentation)
8. [Frontend Integration (`login.html`)](#frontend-integration-loginhtml)
9. [Token Storage & Security Tradeoffs](#token-storage--security-tradeoffs)
10. [Testing the Endpoints](#testing-the-endpoints)

---

## Project Overview
This backend provides real database authentication for the AI Club website's `login.html` page:
- **Registration**: Creates new student/member accounts with bcrypt password hashing (12 salt rounds), validates emails, and enforces an 8-character minimum password.
- **Login**: Verifies credentials securely, checks account activation status, and signs a JSON Web Token (JWT) with user ID and role.
- **Profile (`/me`)**: Protected route verifying `Bearer <JWT>` tokens to return current member info.
- **Logout**: Stateless JWT logout acknowledgment.
- **Security Hardened**: Helmet HTTP security headers, CORS origin filtering, and Express Rate Limiting (50 requests / 15 minutes).

---

## Folder Structure

```
server/
├── src/
│   ├── config/
│   │   └── db.js                 # Mongoose connection & error recovery
│   ├── models/
│   │   └── User.js               # Mongoose User schema, bcrypt hooks, sanitization
│   ├── controllers/
│   │   └── authController.js     # Register, Login, GetMe, Logout handlers
│   ├── routes/
│   │   └── authRoutes.js         # Express router with rate limiting
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT Bearer token authentication & protection
│   ├── utils/
│   │   └── generateToken.js      # Signs JWT with userId and role
│   ├── app.js                    # Express app configuration & middleware
│   └── server.js                 # Server entry point & port listener
│
├── .env                          # Local environment variables (git-ignored)
├── .env.example                  # Environment configuration template
├── package.json                  # Dependencies & start scripts
└── README.md                     # Comprehensive backend documentation
```

---

## Technology Stack

- **Runtime**: Node.js (v18+)
- **Web Framework**: Express.js (v4.21+)
- **Database**: MongoDB with Mongoose ODM (v8.9+)
- **Password Security**: `bcryptjs` (salt rounds: 12)
- **Token Security**: `jsonwebtoken` (JWT)
- **Security & Headers**: `helmet` (v8.0+)
- **CORS**: `cors` (v2.8+)
- **Rate Limiting**: `express-rate-limit` (v7.5+)
- **Environment**: `dotenv` (v16.4+)
- **Development Watcher**: `nodemon` (v3.1+)

---

## Prerequisites & MongoDB Setup

You can use either a **Local MongoDB** installation or a **Free Cloud MongoDB Atlas** database.

### Option A: Local MongoDB (Community Edition)
1. Download and install [MongoDB Community Server](https://www.mongodb.com/try/download/community).
2. Start the MongoDB Windows service:
   ```powershell
   net start MongoDB
   ```
   Or start the daemon manually:
   ```powershell
   mongod --dbpath "C:\data\db"
   ```
3. Default connection URI: `mongodb://127.0.0.1:27017/ai_club_db`

### Option B: Free Cloud MongoDB Atlas (Recommended for Teams)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free **M0 Shared Cluster**.
3. Under **Database Access**, create a user (e.g., `ai_admin`) and strong password.
4. Under **Network Access**, add IP `0.0.0.0/0` (allow from anywhere) or your current IP.
5. Under **Clusters > Connect > Drivers**, copy your connection string:
   ```
   mongodb+srv://ai_admin:<password>@cluster0.abcde.mongodb.net/ai_club_db?retryWrites=true&w=majority
   ```
6. Paste this URI into `server/.env` as `MONGODB_URI`.

---

## Installation & Setup

1. Open a terminal and navigate to the `server` directory:
   ```powershell
   cd "c:\AI LAB WEB SIET\coding\AI LAB Draft\server"
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```
   *(On Windows PowerShell, use `npm.cmd install` if script execution policies apply).*

3. Verify `server/.env` configuration:
   ```ini
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://127.0.0.1:27017/ai_club_db
   JWT_SECRET=ai_club_siet_super_secret_jwt_key_2026_dev
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5500
   ```

---

## Starting the Backend

### Development Mode (with hot-reload via nodemon):
```powershell
npm run dev
```

### Production Mode:
```powershell
npm start
```

When started successfully, you will see:
```
===========================================================
🚀 AI CLUB BACKEND SERVER RUNNING
📡 URL: http://localhost:5000
🩺 Health Check: http://localhost:5000/api/health
🔐 Auth Endpoints: http://localhost:5000/api/v1/auth
   - POST /api/v1/auth/register
   - POST /api/v1/auth/login
   - GET  /api/v1/auth/me
   - POST /api/v1/auth/logout
🌍 Mode: development
===========================================================
[Database] MongoDB Connected: 127.0.0.1:27017/ai_club_db
```

---

## API Endpoints & Documentation

### 1. Health Check
- **Endpoint**: `GET /api/health`
- **Access**: Public
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "AI Club API is running"
  }
  ```

---

### 2. User Registration
- **Endpoint**: `POST /api/v1/auth/register`
- **Access**: Public (Rate-limited: 50 requests / 15 min)
- **Request Body**:
  ```json
  {
    "name": "Arun Kumar",
    "email": "arun.ai@siet.ac.in",
    "password": "Password@2026"
  }
  ```
- **Validation**:
  - `name`: Required, trimmed string.
  - `email`: Required, valid email format, unique in database.
  - `password`: Required, minimum 8 characters.
- **Success Response** (`201 Created`):
  ```json
  {
    "success": true,
    "message": "Registration successful",
    "data": {
      "user": {
        "id": "679f2910a1b2c3d4e5f67890",
        "name": "Arun Kumar",
        "email": "arun.ai@siet.ac.in",
        "role": "member"
      }
    }
  }
  ```
- **Duplicate Email Response** (`409 Conflict`):
  ```json
  {
    "success": false,
    "message": "An account with this email address already exists."
  }
  ```

---

### 3. User Login
- **Endpoint**: `POST /api/v1/auth/login`
- **Access**: Public (Rate-limited: 50 requests / 15 min)
- **Request Body**:
  ```json
  {
    "email": "arun.ai@siet.ac.in",
    "password": "Password@2026"
  }
  ```
- **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "679f2910a1b2c3d4e5f67890",
        "name": "Arun Kumar",
        "email": "arun.ai@siet.ac.in",
        "role": "member"
      }
    }
  }
  ```
- **Invalid Credentials Response** (`401 Unauthorized`):
  ```json
  {
    "success": false,
    "message": "Invalid email or password."
  }
  ```
  *(Security notice: Does not leak whether the email or password was the incorrect field).*

---

### 4. Authenticated Profile
- **Endpoint**: `GET /api/v1/auth/me`
- **Access**: Private (Requires `Authorization: Bearer <token>`)
- **Headers**:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "679f2910a1b2c3d4e5f67890",
        "name": "Arun Kumar",
        "email": "arun.ai@siet.ac.in",
        "role": "member",
        "isActive": true,
        "createdAt": "2026-10-03T13:15:00.000Z",
        "updatedAt": "2026-10-03T13:15:00.000Z"
      }
    }
  }
  ```
- **Missing or Invalid Token** (`401 Unauthorized`):
  ```json
  {
    "success": false,
    "message": "Authentication required. No Bearer token provided."
  }
  ```

---

### 5. Logout
- **Endpoint**: `POST /api/v1/auth/logout`
- **Access**: Public / Authenticated
- **Success Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

---

## Frontend Integration (`login.html`)

`login.html` connects seamlessly to the backend API without altering its visual styling or animations:
- Base API URL: `http://localhost:5000/api/v1/auth`
- Login form submission sends `POST /login` with `email` and `password`.
- Registration form submission sends `POST /register` with `name`, `email`, and `password`.
- On successful login:
  - Token is stored in `localStorage.setItem('ai_club_token', data.data.token)`.
  - User is stored in `localStorage.setItem('ai_club_user', JSON.stringify(data.data.user))`.
  - Existing loading animation & success state are triggered.
  - Redirects to `home.html`.
- On login failure (401 or network):
  - Field error is highlighted on the password input with existing shake and message UI.
  - Toast error alert is displayed.

---

## Token Storage & Security Tradeoffs

For student projects and single-page web applications, developers typically evaluate two token storage options:

| Feature | `localStorage` (Implemented) | `httpOnly` Cookies |
| :--- | :--- | :--- |
| **Ease of Implementation** | Very simple across cross-origin ports (e.g., frontend on 5500, backend on 5000). | Requires CORS `credentials: true`, specific `SameSite` & `Secure` cookie policies. |
| **XSS Vulnerability** | Vulnerable if untrusted 3rd-party scripts run in browser. | Immune to direct JavaScript token theft (scripts cannot read `httpOnly`). |
| **CSRF Vulnerability** | Immune to CSRF attacks (browsers do not attach localStorage to cross-site requests). | Vulnerable to CSRF unless protected by `SameSite=Strict` or CSRF tokens. |
| **SSR / Static File** | Works natively with client-side static HTML/JS pages opened directly or via dev servers. | Requires proxy or exact domain matching to avoid cross-domain cookie dropping. |

**Decision**: For this client-side student chapter prototype, `localStorage` is used for token access, combined with strict input sanitization, minimal dependency footprint, and short JWT expiry (7 days).

---

## Testing the Endpoints

### 1. Test via cURL (PowerShell):

#### Health Check:
```powershell
curl -X GET http://localhost:5000/api/health
```

#### Register:
```powershell
curl -X POST http://localhost:5000/api/v1/auth/register `
  -H "Content-Type: application/json" `
  -d '{"name":"Student Member","email":"member@siet.ac.in","password":"SecurePassword123"}'
```

#### Login:
```powershell
curl -X POST http://localhost:5000/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"member@siet.ac.in","password":"SecurePassword123"}'
```

#### Get Current User Profile:
```powershell
curl -X GET http://localhost:5000/api/v1/auth/me `
  -H "Authorization: Bearer <PASTE_TOKEN_HERE>"
```
