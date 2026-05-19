import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthPayload {
  userId: number;
  username: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET;
  if (!secret) throw new Error("JWT_SECRET or SESSION_SECRET must be set");
  return secret;
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "30d" });
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers["authorization"];
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    req.user = jwt.verify(authHeader.slice(7), getJwtSecret()) as AuthPayload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers["authorization"];
  if (authHeader?.startsWith("Bearer ")) {
    try {
      req.user = jwt.verify(authHeader.slice(7), getJwtSecret()) as AuthPayload;
    } catch { /* ignore */ }
  }
  next();
}
