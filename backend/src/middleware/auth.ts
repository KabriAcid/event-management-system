import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: "organizer" | "attendee";
  };
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export function generateToken(
  userId: string,
  email: string,
  role: string,
): string {
  return jwt.sign({ id: userId, email, role }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY || "7d",
  });
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({ error: "No authorization token provided" });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
}

export function requireRole(roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: "Access denied" });
      return;
    }
    next();
  };
}
