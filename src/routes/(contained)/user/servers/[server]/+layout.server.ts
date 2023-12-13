import type { LayoutServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';

export const load = (async ({ params }) => {
	const id = Number(params.server);
	const server = await prisma.server.findUnique({ where: { id } });
	if (!server) throw error(404, 'Server does not exist.');
	return { server };
}) satisfies LayoutServerLoad;
