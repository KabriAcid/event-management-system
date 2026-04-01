import { Router } from "express";
import { login, getCurrentUser, logout } from "../controllers/authController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

/**
 * POST /api/auth/login
 * Login with email and password to get JWT token
 *
 * Request body:
 * {
 *   "email": "organizer1@eventflow.com",
 *   "password": "password123"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   "user": {
 *     "id": "uuid",
 *     "email": "organizer1@eventflow.com",
 *     "full_name": "John Organizer",
 *     "role": "organizer"
 *   }
 * }
 */
router.post("/login", login);

/**
 * GET /api/auth/me
 * Get current authenticated user profile
 * Requires: Authorization Bearer token
 *
 * Response:
 * {
 *   "success": true,
 *   "user": {
 *     "id": "uuid",
 *     "email": "organizer1@eventflow.com",
 *     "full_name": "John Organizer",
 *     "role": "organizer"
 *   }
 * }
 */
router.get("/me", authMiddleware, getCurrentUser);

/**
 * POST /api/auth/logout
 * Logout (client should discard token)
 * Requires: Authorization Bearer token
 *
 * Response:
 * {
 *   "success": true,
 *   "message": "Logged out successfully. Please discard the token."
 * }
 */
router.post("/logout", authMiddleware, logout);

export default router;
