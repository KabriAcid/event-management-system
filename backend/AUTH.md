# JWT Login Authentication Setup

## 🔐 Authentication Flow

```
Client                                Backend
  │                                      │
  ├─ POST /api/auth/login ────────────>│
  │  { email, password }               │
  │                                     ├─ Verify credentials
  │                                     ├─ Hash password check
  │  <─────────────── {token, user} ──┤
  │                                     │
  ├─ GET /api/auth/me ────────────────>│
  │  Authorization: Bearer {token}     │
  │                                     ├─ Verify JWT token
  │  <─────────────── {user} ─────────┤
  │                                     │
```

## 🚀 Quick Start

### 1. Ensure Database is Seeded

```bash
npm run seed
```

This creates test accounts:

- **Organizer**: organizer1@eventflow.com / password123
- **Attendee**: attendee1@eventflow.com / password123

### 2. Start Backend Server

```bash
npm run dev
```

Server runs on `http://localhost:5000`

### 3. Test Login Endpoint

#### Using cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "organizer1@eventflow.com",
    "password": "password123"
  }'
```

Response:

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4LWFiY2QtMWIzMi1lZg==...",
  "user": {
    "id": "12345678-abcd-1b32-ef",
    "email": "organizer1@eventflow.com",
    "full_name": "John Organizer",
    "role": "organizer"
  }
}
```

#### Using Postman

1. **Create new POST request** to `http://localhost:5000/api/auth/login`
2. **Set Headers:**
   - `Content-Type: application/json`
3. **Set Body (raw JSON):**

```json
{
  "email": "organizer1@eventflow.com",
  "password": "password123"
}
```

4. **Send** and copy the `token` from response

### 4. Use Token to Access Protected Routes

#### Get Current User

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <your-token-here>"
```

Response:

```json
{
  "success": true,
  "user": {
    "id": "12345678-abcd-1b32-ef",
    "email": "organizer1@eventflow.com",
    "full_name": "John Organizer",
    "role": "organizer"
  }
}
```

#### Logout

```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer <your-token-here>"
```

## 📋 API Endpoints

### POST /api/auth/login

**Description:** Authenticate user and receive JWT token

**Request:**

```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "full_name": "string",
    "role": "organizer" | "attendee"
  }
}
```

**Error Responses:**

- `400` - Missing email or password
  ```json
  { "error": "Email and password are required" }
  ```
- `401` - Invalid credentials
  ```json
  { "error": "Invalid email or password" }
  ```
- `500` - Server error

---

### GET /api/auth/me

**Description:** Get authenticated user profile

**Headers:**

```
Authorization: Bearer <token>
```

**Success Response (200):**

```json
{
  "success": true,
  "user": {
    "id": "string",
    "email": "string",
    "full_name": "string",
    "role": "organizer" | "attendee"
  }
}
```

**Error Responses:**

- `401` - No token or invalid token
  ```json
  { "error": "Invalid token" }
  ```
- `404` - User not found
- `500` - Server error

---

### POST /api/auth/logout

**Description:** Logout user (client should discard token)

**Headers:**

```
Authorization: Bearer <token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Logged out successfully. Please discard the token."
}
```

---

## 🔑 Token Format

JWT tokens contain:

- **Header:** `{ "alg": "HS256", "typ": "JWT" }`
- **Payload:** `{ "id": "...", "email": "...", "role": "..." }`
- **Signature:** Signed with `JWT_SECRET`

### Decode Token (Debug)

Use [jwt.io](https://jwt.io) to decode tokens for debugging:

1. Paste token in debugger
2. View payload claims
3. Verify signature with your `JWT_SECRET`

---

## 🧪 Testing Scenarios

### Scenario 1: Successful Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "organizer1@eventflow.com", "password": "password123"}'
```

✅ Expected: Token received, status 200

### Scenario 2: Wrong Password

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "organizer1@eventflow.com", "password": "wrongpassword"}'
```

✅ Expected: Error 401 "Invalid email or password"

### Scenario 3: Non-existent Email

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "unknown@example.com", "password": "password123"}'
```

✅ Expected: Error 401 "Invalid email or password"

### Scenario 4: Missing Fields

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "organizer1@eventflow.com"}'
```

✅ Expected: Error 400 "Email and password are required"

### Scenario 5: Access Protected Route

```bash
# Get token first
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "organizer1@eventflow.com", "password": "password123"}' \
  | jq -r '.token')

# Use token
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

✅ Expected: User profile returned, status 200

### Scenario 6: Invalid Token

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer invalid.token.here"
```

✅ Expected: Error 401 "Invalid token"

---

## 🔒 Security Considerations

1. **JWT_SECRET** - Must be strong and unique in production
   - Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

2. **Password Hashing** - Uses bcryptjs with 10 rounds (secure)

3. **Token Expiry** - Set to 7 days by default (configurable)

4. **HTTPS Only** - Use HTTPS in production

5. **HttpOnly Cookies** - Consider storing token in httpOnly cookie (future enhancement)

---

## 📲 Frontend Integration

### React Example

```typescript
// Login
const response = await fetch("http://localhost:5000/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});

const { token, user } = await response.json();
localStorage.setItem("token", token);

// Use token in requests
const userResponse = await fetch("http://localhost:5000/api/auth/me", {
  headers: { Authorization: `Bearer ${token}` },
});

const currentUser = await userResponse.json();
```

---

## 🐛 Troubleshooting

### "Invalid token" even with correct token

- Token may be expired (default 7 days)
- JWT_SECRET may not match between requests
- Token format incorrect (missing "Bearer " prefix)

### "Invalid email or password" with correct credentials

- Database not seeded (run `npm run seed`)
- User doesn't exist in database
- Password changed but seeds not rerun

### CORS error from frontend

- Update `CORS_ORIGIN` in `.env`
- Default: `http://localhost:5173`

### Token always invalid

- Check `JWT_SECRET` in `.env`
- Restart backend server after changing `.env`
- Verify token not modified or truncated

---

## 📂 Files Created

```
backend/
├── src/
│   ├── controllers/
│   │   └── authController.ts       // Login, getCurrentUser, logout
│   ├── routes/
│   │   └── authRoutes.ts           // Auth endpoints
│   ├── types/
│   │   └── index.ts                // TypeScript interfaces
│   └── index.ts                    // Updated with auth routes
├── .env                            // Environment config
└── AUTH.md                         // This file
```

---

**Next Steps:** Create organizer and attendee controllers for event management!
