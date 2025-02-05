export default function localize_url(raw: any): string {
    if (!(typeof raw === "string" || raw instanceof URL)) return "";
    const url = new URL(raw, "https://example.com");
    return url.pathname + url.search + url.hash;
}
