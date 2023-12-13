import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ locals }) => {
	const session = await locals.auth.validate();
	if (!session) throw redirect(303, '/login/?from=/user/servers/');
	const user_id = session.user.userId;
	const servers = prisma.server.findMany({ where: { user_id } });

	return { servers };
}) satisfies PageServerLoad;
