// Ranking score for a server, used by the ping script to set `server.rank`.
// Imported by the ping script, so no `$lib` / `$env` imports here.

// average players beyond this earn no extra bonus
export const PLAYER_BONUS_CAP = 5;

export type RankInput = {
    // votes over the last week
    votes: number;
    // average online players over the last week
    avgPlayers: number;
    // fraction of pings online over the last month, 0 to 1
    uptime: number;
};

// Votes per player, so small servers with engaged players can compete with
// big ones, scaled by uptime, plus a bonus for the first few players.
// The +1 keeps empty servers from dividing by zero.
export function rankScore({ votes, avgPlayers, uptime }: RankInput) {
    return (
        (votes / (avgPlayers + 1)) * uptime +
        Math.min(avgPlayers, PLAYER_BONUS_CAP)
    );
}

// Turns scores into ranks: 1 for the highest score, 0 (unranked) for
// servers that scored nothing. Ties keep their input order.
export function assignRanks(scores: { id: number; score: number }[]) {
    const ranks = new Map<number, number>();
    const ranked = scores
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score);
    ranked.forEach(({ id }, i) => ranks.set(id, i + 1));
    for (const { id, score } of scores) if (score <= 0) ranks.set(id, 0);
    return ranks;
}
