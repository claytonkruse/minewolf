import type { PageLoad } from './$types';

export const load = (async ({ url }) => {
	const page = Math.floor(Number(url.searchParams.get('p'))) || 1;
	return { page };
}) satisfies PageLoad;
