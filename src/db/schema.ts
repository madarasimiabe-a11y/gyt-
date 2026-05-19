import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  xp: integer("xp").notNull().default(0),
  wins: integer("wins").notNull().default(0),
  gamesPlayed: integer("games_played").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  bestStreak: integer("best_streak").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const scoresTable = pgTable("scores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  guessLine: integer("guess_line").notNull(),
  won: boolean("won").notNull(),
  xpEarned: integer("xp_earned").notNull().default(0),
  wordLength: integer("word_length"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type User = typeof usersTable.$inferSelect;
export type Score = typeof scoresTable.$inferSelect;
