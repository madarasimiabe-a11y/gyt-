import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db, usersTable } from "../db/index.js";
import { eq } from "drizzle-orm";
import { signToken } from "../middlewares/auth.js";
import { getRankForXp } from "../lib/ranks.js";

const router = Router();

const RegisterBody = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(6),
});

const LoginBody = z.object({
  username: z.string(),
  password: z.string(),
});

function formatUser(user: typeof usersTable.$inferSelect) {
  const rank = getRankForXp(user.xp);
  return { id: user.id, username: user.username, xp: user.xp, wins: user.wins,
    gamesPlayed: user.gamesPlayed, currentStreak: user.currentStreak,
    bestStreak: user.bestStreak, rank: rank.title, rankIcon: rank.icon };
}

router.post("/auth/register", async (req, res) => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const { username, email, password } = parsed.data;
  const existing = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.username, username)).limit(1);
  if (existing.length) { res.status(409).json({ error: "Username already taken" }); return; }
  const existingEmail = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existingEmail.length) { res.status(409).json({ error: "Email already registered" }); return; }
  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db.insert(usersTable).values({ username, email, passwordHash }).returning();
  if (!user) { res.status(500).json({ error: "Failed to create user" }); return; }
  res.status(201).json({ token: signToken({ userId: user.id, username: user.username }), user: formatUser(user) });
});

router.post("/auth/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const { username, password } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: "Invalid username or password" }); return;
  }
  res.json({ token: signToken({ userId: user.id, username: user.username }), user: formatUser(user) });
});

export default router;
