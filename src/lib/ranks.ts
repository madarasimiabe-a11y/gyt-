export interface Rank {
  title: string;
  icon: string;
  minXp: number;
}

export const RANKS: Rank[] = [
  { minXp: 0,     title: "Cabin Boy",            icon: "🏴‍☠️" },
  { minXp: 50,    title: "East Blue Pirate",      icon: "⚓" },
  { minXp: 150,   title: "Grand Line Pirate",     icon: "🌊" },
  { minXp: 350,   title: "Supernova",             icon: "⚡" },
  { minXp: 700,   title: "Warlord of the Sea",    icon: "⚔️" },
  { minXp: 1400,  title: "Sweet Commander",       icon: "🍭" },
  { minXp: 2800,  title: "All-Star (Calamity)",   icon: "🔥" },
  { minXp: 5600,  title: "Yonko Commander",       icon: "👑" },
  { minXp: 10000, title: "Pirate King",           icon: "🏆" },
];

export function getRankForXp(xp: number): Rank {
  let current = RANKS[0]!;
  for (const rank of RANKS) {
    if (xp >= rank.minXp) current = rank;
  }
  return current;
}

export function getXpForGuessLine(guessLine: number, won: boolean): number {
  if (!won || guessLine === 0) return 0;
  const table: Record<number, number> = { 1: 100, 2: 80, 3: 65, 4: 50, 5: 35, 6: 20 };
  return table[guessLine] ?? 0;
}
