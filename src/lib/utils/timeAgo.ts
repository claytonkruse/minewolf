const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 1000 * 60 * 60 * 24 * 365],
    ["month", 1000 * 60 * 60 * 24 * 30],
    ["week", 1000 * 60 * 60 * 24 * 7],
    ["day", 1000 * 60 * 60 * 24],
    ["hour", 1000 * 60 * 60],
    ["minute", 1000 * 60],
];
const formatter = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });

// "3 hours ago", "yesterday", "just now"
export function timeAgo(date: Date) {
    const elapsed = date.getTime() - Date.now();
    for (const [unit, ms] of units) {
        if (Math.abs(elapsed) >= ms)
            return formatter.format(Math.round(elapsed / ms), unit);
    }
    return "just now";
}
