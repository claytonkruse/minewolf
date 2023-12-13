import type { PageServerLoad } from './$types';

export const load = (async ({ parent }) => {
	const { server } = await parent();
	return { server };
}) satisfies PageServerLoad;
