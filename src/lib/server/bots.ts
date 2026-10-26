export const BOT_PATTERN = /bot|crawl|spider|slurp|preview|headless/i;

export function isBot(request: Request) {
    return BOT_PATTERN.test(request.headers.get("user-agent") ?? "");
}
