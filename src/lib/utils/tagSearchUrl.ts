export const tagSearchUrl = (tag: string): string =>
    `/servers/?tag=${encodeURIComponent(tag.trim())}`;
