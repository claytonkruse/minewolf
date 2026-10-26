// Converts a server's MOTD (a chat component or legacy §-coded string)
// into plain-text and HTML lines.

export type ChatComponent =
    | string
    | ChatComponent[]
    | {
          text?: string;
          translate?: string;
          color?: string;
          bold?: boolean;
          italic?: boolean;
          underlined?: boolean;
          strikethrough?: boolean;
          obfuscated?: boolean;
          extra?: ChatComponent[];
      };

type Style = {
    color?: string;
    bold?: boolean;
    italic?: boolean;
    underlined?: boolean;
    strikethrough?: boolean;
    obfuscated?: boolean;
};

type Segment = { text: string; style: Style };

const namedColors: Record<string, string> = {
    black: "#000000",
    dark_blue: "#0000AA",
    dark_green: "#00AA00",
    dark_aqua: "#00AAAA",
    dark_red: "#AA0000",
    dark_purple: "#AA00AA",
    gold: "#FFAA00",
    gray: "#AAAAAA",
    dark_gray: "#555555",
    blue: "#5555FF",
    green: "#55FF55",
    aqua: "#55FFFF",
    red: "#FF5555",
    light_purple: "#FF55FF",
    yellow: "#FFFF55",
    white: "#FFFFFF",
};
// legacy §0-§f map onto the named colors in order
const codeColors = Object.values(namedColors);

const formatCodes: Record<string, keyof Style> = {
    k: "obfuscated",
    l: "bold",
    m: "strikethrough",
    n: "underlined",
    o: "italic",
};

function resolveColor(color: string | undefined) {
    if (!color) return undefined;
    if (/^#[0-9a-f]{6}$/i.test(color)) return color.toUpperCase();
    return namedColors[color];
}

// splits a string containing § codes into styled segments
function parseLegacy(text: string, base: Style): Segment[] {
    const segments: Segment[] = [];
    let style = { ...base };
    let current = "";
    for (let i = 0; i < text.length; i++) {
        if (text[i] !== "§" || i + 1 >= text.length) {
            current += text[i];
            continue;
        }
        const code = text[++i].toLowerCase();
        if (current) segments.push({ text: current, style });
        current = "";
        const colorIndex = "0123456789abcdef".indexOf(code);
        if (colorIndex !== -1) {
            // a color code also clears formatting, like the vanilla client
            style = { color: codeColors[colorIndex] };
        } else if (code === "r") {
            style = { ...base };
        } else if (formatCodes[code]) {
            style = { ...style, [formatCodes[code]]: true };
        }
    }
    if (current) segments.push({ text: current, style });
    return segments;
}

function flatten(component: ChatComponent, parent: Style): Segment[] {
    if (typeof component === "string") return parseLegacy(component, parent);
    if (Array.isArray(component))
        return component.flatMap((c) => flatten(c, parent));

    const style: Style = { ...parent };
    const color = resolveColor(component.color);
    if (color) style.color = color;
    for (const key of [
        "bold",
        "italic",
        "underlined",
        "strikethrough",
        "obfuscated",
    ] as const) {
        if (component[key] !== undefined) style[key] = component[key];
    }

    return [
        ...parseLegacy(component.text ?? component.translate ?? "", style),
        ...(component.extra ?? []).flatMap((c) => flatten(c, style)),
    ];
}

function sameStyle(a: Style, b: Style) {
    return (
        a.color === b.color &&
        !a.bold === !b.bold &&
        !a.italic === !b.italic &&
        !a.underlined === !b.underlined &&
        !a.strikethrough === !b.strikethrough &&
        !a.obfuscated === !b.obfuscated
    );
}

// splits segments on newlines, merging neighbours that share a style
function splitLines(segments: Segment[]): Segment[][] {
    const lines: Segment[][] = [[]];
    for (const { text, style } of segments) {
        text.split("\n").forEach((part, i) => {
            if (i > 0) lines.push([]);
            if (!part) return;
            const line = lines[lines.length - 1];
            const last = line[line.length - 1];
            if (last && sameStyle(last.style, style)) last.text += part;
            else line.push({ text: part, style });
        });
    }
    return lines;
}

function escapeHtml(text: string) {
    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

function segmentToHtml({ text, style }: Segment) {
    const css: string[] = [];
    if (style.color) css.push(`color: ${style.color}`);
    if (style.bold) css.push("font-weight: bold");
    if (style.italic) css.push("font-style: italic");
    const decorations = [
        style.underlined && "underline",
        style.strikethrough && "line-through",
    ].filter(Boolean);
    if (decorations.length)
        css.push(`text-decoration: ${decorations.join(" ")}`);

    const escaped = escapeHtml(text);
    return css.length
        ? `<span style="${css.join("; ")}">${escaped}</span>`
        : escaped;
}

export function parseMotd(description: ChatComponent) {
    const lines = splitLines(flatten(description, {}));
    return {
        clean: lines.map((line) =>
            line
                .map((s) => s.text)
                .join("")
                .trim(),
        ),
        html: lines.map((line) => line.map(segmentToHtml).join("").trim()),
    };
}

// strips § codes from plain strings like the version name
export function stripCodes(text: string) {
    return text.replace(/§./g, "");
}
