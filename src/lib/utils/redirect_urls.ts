import localize_url from "./localize_url";

export function temp_url(next_stop: string, final_stop: URL | string) {
    const next_stop_url = new URL(next_stop, "https://example.com");
    next_stop_url.searchParams.set("to", localize_url(final_stop));
    return localize_url(next_stop_url);
}

export function next_url(current_stop: URL, next_stop: string) {
    const next_stop_url = new URL(next_stop, "https://example.com");
    const destination = current_stop.searchParams.get("to");
    if (destination)
        next_stop_url.searchParams.set("to", localize_url(destination));
    return localize_url(next_stop_url);
}

export function final_url(url: URL) {
    return localize_url(url.searchParams.get("to"));
}
