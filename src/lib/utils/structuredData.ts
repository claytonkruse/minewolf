import { SITE_NAME, SITE_URL } from "$lib/config";

// Helpers for schema.org structured data, rendered by JsonLd.svelte.

export type Schema = Record<string, unknown>;

export function absoluteUrl(path: string) {
    return new URL(path, SITE_URL).href;
}

export const website: Schema = {
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl("/"),
};

export const organization: Schema = {
    "@type": "Organization",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/android-chrome-512x512.png"),
};

// Each crumb is [name, path]; the last one is the current page.
export function breadcrumbs(crumbs: Array<[string, string]>): Schema {
    return {
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map(([name, path], i) => ({
            "@type": "ListItem",
            position: i + 1,
            name,
            item: absoluteUrl(path),
        })),
    };
}
