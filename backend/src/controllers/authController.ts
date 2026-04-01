import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { getDatabase } from "../db/database";
import { generateToken } from "../middleware/auth";

interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

interface User {
  id: string;
  email: string;
  full_name: string;
  role: "organizer" | "attendee";
  password_hash: string;
}

export async function login(req: LoginRequest, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        error: "Email and password are required",
      });
      return;
    }

    const db = getDatabase();

    // Find user by email
    const user = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email) as User | undefined;

    if (!user) {
      res.status(401).json({
        error: "Invalid email or password",
      });
      return;
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      res.status(401).json({
        error: "Invalid email or password",
      });
      return;
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email, user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function getCurrentUser(req: any, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: "Not authenticated",
      });
      return;
    }

    const db = getDatabase();
    const user = db
      .prepare("SELECT id, email, full_name, role FROM users WHERE id = ?")
      .get(req.user.id) as Omit<User, "password_hash"> | undefined;

    if (!user) {
      res.status(404).json({
        error: "User not found",
      });
      return;
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function logout(req: any, res: Response): Promise<void> {
  try {
    // JWT tokens are stateless, so logout just returns success
    // The client should discard the token
    res.json({
      success: true,
      message: "Logged out successfully. Please discard the token.",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
}
