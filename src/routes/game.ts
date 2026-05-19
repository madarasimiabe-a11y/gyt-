import { Router } from "express";
import { z } from "zod";
import { db, usersTable, scoresTable } from "../db/index.js";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth.js";
import { getRankForXp, getXpForGuessLine } from "../lib/ranks.js";

const router = Router();

const SubmitScoreBody = z.object({
  guessLine: z.number().int().min(0).max(6),
  won: z.boolean(),
  wordLength: z.number().int().optional(),
});

function getDailyWordIndex(): { wordIndex: number; date: string } {
  const now = new Date();
  const utcDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const epoch = new Date(Date.UTC(2024, 0, 1));
  const dayNumber = Math.floor((utcDate.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24));
  return { wordIndex: dayNumber, date: utcDate.toISOString().split("T")[0]! };
}

router.get("/game/today", (_req, res) => {
  res.json(getDailyWordIndex());
});

router.post("/game/submit-score", requireAuth, async (req, res) => {
  const parsed = SubmitScoreBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const { guessLine, won, wordLength } = parsed.data;
  const userId = req.user!.userId;
  const xpEarned = getXpForGuessLine(guessLine, won);
  await db.insert(scoresTable).values({ userId, guessLine, won, xpEarned, wordLength: wordLength ?? null });
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  const prevRank = getRankForXp(user.xp);
  const newXp = user.xp + xpEarned;
  const newWins = won ? user.wins + 1 : user.wins;
  const newStreak = won ? user.currentStreak + 1 : 0;
  const newBestStreak = Math.max(user.bestStreak, newStreak);
  const newRank = getRankForXp(newXp);
  await db.update(usersTable).set({ xp: newXp, wins: newWins, gamesPlayed: user.gamesPlayed + 1,
    currentStreak: newStreak, bestStreak: newBestStreak, updatedAt: new Date() }).where(eq(usersTable.id, userId));
  const messages: Record<string,string> = { lost:"Better luck tomorrow, pirate!", 1:"First try! Pirate King worthy!",
    2:"Incredible! A true Grand Line navigator!", 3:"Well done! A worthy pirate!", other:"You got it! Keep sailing!" };
  const msgKey = !won ? "lost" : guessLine <= 3 ? String(guessLine) : "other";
  res.json({ xpEarned, newXp, newWins, rank: newRank.title, rankIcon: newRank.icon,
    message: messages[msgKey]!, rankUp: newRank.title !== prevRank.title });
});

export default router;
