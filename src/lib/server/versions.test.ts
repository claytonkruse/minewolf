import { describe, it, expect } from "vitest";
import { releaseOptions, supportsRelease } from "./versions";

describe("supportsRelease", () => {
    it("matches a single release, ignoring the software name and patch", () => {
        expect(supportsRelease("Paper 1.21.11", "1.21")).toBe(true);
        expect(supportsRelease("Paper 1.21.11", "1.20")).toBe(false);
        expect(supportsRelease("Paper 26.1.2", "26.1")).toBe(true);
        expect(supportsRelease("1.21.10 (Paper)", "1.21")).toBe(true);
    });

    it("covers ranges across both version schemes", () => {
        const proxy = "Velocity 1.7.2-26.3";
        expect(supportsRelease(proxy, "1.7")).toBe(true);
        expect(supportsRelease(proxy, "1.16")).toBe(true);
        expect(supportsRelease(proxy, "26.2")).toBe(true);
        expect(supportsRelease(proxy, "26.4")).toBe(false);
        expect(supportsRelease("✦ 1.8 - 26.2 ✦", "1.12")).toBe(true);
        expect(supportsRelease("Suportamos 1.16 a 26.2", "1.20")).toBe(true);
        expect(supportsRelease("Suportamos 1.16 a 26.2", "1.12")).toBe(false);
    });

    it("handles wildcards and open-ended versions", () => {
        expect(supportsRelease("BungeeCord 1.8.x-26.x", "26.3")).toBe(true);
        expect(supportsRelease("BungeeCord 1.8.x-26.x", "1.7")).toBe(false);
        expect(supportsRelease("LilacMC 1.21.10+", "26.1")).toBe(true);
        expect(supportsRelease("LilacMC 1.21.10+", "1.20")).toBe(false);
    });

    it("matches nothing for strings without a version", () => {
        expect(supportsRelease("Maintenance", "1.21")).toBe(false);
        expect(supportsRelease("ᴊᴏɪɴ ɴᴏᴡ 11/500", "1.21")).toBe(false);
    });
});

describe("releaseOptions", () => {
    it("fills each scheme from its lowest to highest release, newest first", () => {
        expect(
            releaseOptions(["Velocity 1.18-26.2", "Paper 1.20.1", "26.x"]),
        ).toEqual(["26.2", "26.1", "1.20", "1.19", "1.18"]);
    });
});
