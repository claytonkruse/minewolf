// Rough markdown-to-text for meta descriptions; not a full parser.
export function plainText(markdown: string) {
    return markdown
        .replace(/```[\s\S]*?```/g, " ")
        .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
        .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
        .replace(/<[^>]+>/g, " ")
        .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, "")
        .replace(/[*_~`]+/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

// Cuts at a word boundary so search results don't show half a word.
export function truncate(text: string, max = 160) {
    if (text.length <= max) return text;
    const cut = text.slice(0, max - 1);
    const space = cut.lastIndexOf(" ");
    return (space > max * 0.6 ? cut.slice(0, space) : cut).trimEnd() + "…";
}
