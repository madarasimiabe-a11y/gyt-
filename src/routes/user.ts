import { Router } from "express";
import { db, usersTable, scoresTable } from "../db/index.js";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth.js";
import { getRankForXp } from "../lib/ranks.js";

const router = Router();

router.get("/user/profile", requireAuth, async (req, res) => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId)).limit(1);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  const rank = getRankForXp(user.xp);
  res.json({ id: user.id, username: user.username, xp: user.xp, wins: user.wins,
    gamesPlayed: user.gamesPlayed, currentStreak: user.currentStreak,
    bestStreak: user.bestStreak, rank: rank.title, rankIcon: rank.icon });
});

router.get("/user/history", requireAuth, async (req, res) => {
  const scores = await db.select({ id: scoresTable.id, guessLine: scoresTable.guessLine,
    won: scoresTable.won, xpEarned: scoresTable.xpEarned, createdAt: scoresTable.createdAt })
    .from(scoresTable).where(eq(scoresTable.userId, req.user!.userId))
    .orderBy(desc(scoresTable.createdAt)).limit(30);
  res.json(scores.map(s => ({ ...s, createdAt: s.createdAt.toISOString() })));
});

export default router;
