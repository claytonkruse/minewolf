import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ params }) => {
	const id = Number(params.server.split('-')[0]);
	if (id != Math.floor(id)) throw redirect(302, `/server/${Math.floor(id)}`);

	const server = await prisma.server.findUnique({ where: { id } });
	return { ...server };
}) satisfies PageServerLoad;
