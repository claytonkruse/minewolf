import { describe, it, expect } from "vitest";
import { parseMotd, stripCodes } from "./motd";
import { readVarInt, writeVarInt } from "./index";

describe("VarInt", () => {
    it("round-trips values", () => {
        for (const n of [0, 1, 127, 128, 255, 25565, 2097151, 2147483647, -1]) {
            const buf = writeVarInt(n);
            expect(readVarInt(buf)).toEqual({ value: n, size: buf.length });
        }
    });

    it("encodes -1 as five bytes", () => {
        expect([...writeVarInt(-1)]).toEqual([0xff, 0xff, 0xff, 0xff, 0x0f]);
    });

    it("returns undefined for an incomplete VarInt", () => {
        expect(readVarInt(Buffer.from([0x80]))).toBeUndefined();
    });
});

describe("parseMotd", () => {
    it("handles legacy § codes and newlines", () => {
        expect(parseMotd("§aHello §lWorld\n§r  second line ")).toEqual({
            clean: ["Hello World", "second line"],
            html: [
                '<span style="color: #55FF55">Hello </span><span style="color: #55FF55; font-weight: bold">World</span>',
                "second line",
            ],
        });
    });

    it("inherits styles through extra components", () => {
        const motd = parseMotd({
            text: "",
            color: "gold",
            extra: [
                { text: "A", bold: true },
                { text: "B", color: "#12abef" },
            ],
        });
        expect(motd.html).toEqual([
            '<span style="color: #FFAA00; font-weight: bold">A</span><span style="color: #12ABEF">B</span>',
        ]);
    });

    it("merges neighbours with the same style", () => {
        const motd = parseMotd({
            extra: ["H", "i"].map((text) => ({ text, color: "red" })),
        });
        expect(motd.html).toEqual(['<span style="color: #FF5555">Hi</span>']);
    });

    it("escapes HTML", () => {
        expect(parseMotd("<b>&</b>").html).toEqual([
            "&lt;b&gt;&amp;&lt;/b&gt;",
        ]);
    });
});

describe("stripCodes", () => {
    it("removes § codes", () => {
        expect(stripCodes("§cPaper §l1.21")).toBe("Paper 1.21");
    });
});
