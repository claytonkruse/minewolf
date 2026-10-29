const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

// "US" -> "🇺🇸", using regional indicator symbols
export function countryFlag(code: string) {
    return String.fromCodePoint(
        ...[...code.toUpperCase()].map((c) => 0x1f1a5 + c.charCodeAt(0)),
    );
}

// "US" -> "United States"
export function countryName(code: string) {
    try {
        return regionNames.of(code.toUpperCase()) ?? code;
    } catch {
        return code;
    }
}

// search page filtered to servers hosted in this country
export const countrySearchUrl = (code: string) =>
    `/servers/?country=${encodeURIComponent(code.toUpperCase())}`;
