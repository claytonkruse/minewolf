// Looks up which country an IP address is in, via https://country.is.
// Imported by the ping script, so no `$lib` / `$env` imports here.
import { isIP } from "node:net";

const TIMEOUT_MS = 5000;

// returns an ISO 3166-1 alpha-2 code like "US", or undefined if unknown
export async function geolocate(ip: string | undefined) {
    if (!ip) return undefined;
    // node reports IPv4 peers on dual-stack sockets as ::ffff:1.2.3.4
    ip = ip.replace(/^::ffff:/, "");
    if (!isIP(ip)) return undefined;
    try {
        const res = await fetch(`https://api.country.is/${ip}`, {
            signal: AbortSignal.timeout(TIMEOUT_MS),
        });
        if (!res.ok) {
            console.warn(`[geolocate] ${ip}: HTTP ${res.status}`);
            return undefined;
        }
        const { country } = (await res.json()) as { country?: string };
        if (country && /^[A-Z]{2}$/.test(country)) return country;
        console.warn(`[geolocate] ${ip}: unexpected response`);
        return undefined;
    } catch (e) {
        const err = e as Error & { cause?: { code?: string } };
        console.warn(`[geolocate] ${ip}: ${err.cause?.code ?? err.message}`);
        return undefined;
    }
}
