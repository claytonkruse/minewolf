import type { PageServerLoad } from './$types';

export const load = (async ({ parent }) => {
	const { server } = await parent();

	return { name: server.name };
}) satisfies PageServerLoad;
