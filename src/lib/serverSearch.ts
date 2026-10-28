// Sort orders for the /servers/ search page. "relevance" only applies to
// text searches.
export const SORTS = [
    "relevance",
    "rank",
    "players",
    "uptime",
    "newest",
    "name",
] as const;
export type Sort = (typeof SORTS)[number];

export const SORT_LABELS: Record<Sort, string> = {
    relevance: "Best match",
    rank: "Rank",
    players: "Most players",
    uptime: "Best uptime",
    newest: "Newest",
    name: "Name (A–Z)",
};
