import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { z } from 'zod';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth.validate();
	if (!session) throw redirect(303, `/login?from=/add-server`);
	return {};
};

import { MIN_SERVER_NAME_LENGTH, MAX_SERVER_NAME_LENGTH } from '$lib/server/config';
import find_illegal_chars from '$lib/utils/find_illegal_chars';

const schema = z.object({
	// username: z.string({ required_error: 'You must enter a username.' }).trim().min(1),
	// password: z.string().trim().optional(),

	name: z
		.string({ required_error: 'You must enter a server name.' })
		.trim()
		.min(MIN_SERVER_NAME_LENGTH)
		.max(MAX_SERVER_NAME_LENGTH)
		.refine(
			(name) => !find_illegal_chars(name, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'),
			{ message: 'Name may only contain letters.' }
		)
});

export const actions = {
	default: async ({ locals, request }) => {
		const session = await locals.auth.validate();
		if (!session) throw error(401, 'Client must be authenticated to add a server.');
		const { name, ip, port } = Object.fromEntries(await request.formData());
		prisma.server.create({
			data: {
				name,
				ip,
				port
			}
		});
	}
} satisfies Actions;
