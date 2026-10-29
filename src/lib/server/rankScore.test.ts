import { describe, it, expect } from "vitest";
import { assignRanks, rankScore } from "./rankScore";

describe("rankScore", () => {
    it("scores votes per player, scaled by uptime", () => {
        expect(rankScore({ votes: 10, avgPlayers: 0, uptime: 1 })).toBe(10);
        expect(rankScore({ votes: 10, avgPlayers: 0, uptime: 0.5 })).toBe(5);
        // 10 votes / (4 + 1) players = 2, plus a 4 player bonus
        expect(rankScore({ votes: 10, avgPlayers: 4, uptime: 1 })).toBe(6);
    });

    it("caps the player bonus at 5", () => {
        expect(rankScore({ votes: 0, avgPlayers: 3, uptime: 1 })).toBe(3);
        expect(rankScore({ votes: 0, avgPlayers: 500, uptime: 1 })).toBe(5);
    });

    it("scores nothing for an empty server with no votes", () => {
        expect(rankScore({ votes: 0, avgPlayers: 0, uptime: 1 })).toBe(0);
    });
});

describe("assignRanks", () => {
    it("ranks by score and leaves zero scores unranked", () => {
        const ranks = assignRanks([
            { id: 1, score: 2 },
            { id: 2, score: 0 },
            { id: 3, score: 9 },
            { id: 4, score: 2 },
        ]);
        expect(Object.fromEntries(ranks)).toEqual({ 1: 2, 2: 0, 3: 1, 4: 3 });
    });
});
