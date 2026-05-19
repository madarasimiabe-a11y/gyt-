import { Router } from "express";
import { db, usersTable } from "../db/index.js";
import { desc, count, avg, sql } from "drizzle-orm";
import { getRankForXp } from "../lib/ranks.js";

const router = Router();

router.get("/leaderboard", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const sortBy = req.query.sortBy === "wins" ? "wins" : "xp";
  const orderCol = sortBy === "wins" ? desc(usersTable.wins) : desc(usersTable.xp);
  const users = await db.select({ id: usersTable.id, username: usersTable.username,
    xp: usersTable.xp, wins: usersTable.wins, gamesPlayed: usersTable.gamesPlayed })
    .from(usersTable).orderBy(orderCol).limit(limit);
  res.json(users.map((u, idx) => {
    const rank = getRankForXp(u.xp);
    return { rank: idx + 1, username: u.username, xp: u.xp, wins: u.wins,
      gamesPlayed: u.gamesPlayed, rankTitle: rank.title, rankIcon: rank.icon };
  }));
});

router.get("/leaderboard/stats", async (_req, res) => {
  const [stats] = await db.select({ totalPlayers: count(usersTable.id), averageXp: avg(usersTable.xp) }).from(usersTable);
  const [gameSum] = await db.select({ total: sql<number>`COALESCE(SUM(${usersTable.gamesPlayed}), 0)::int` }).from(usersTable);
  res.json({ totalPlayers: Number(stats?.totalPlayers ?? 0), totalGames: Number(gameSum?.total ?? 0),
    averageXp: Math.round(Number(stats?.averageXp ?? 0)) });
});

export default router;
