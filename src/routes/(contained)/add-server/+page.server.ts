import type { PageServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { prisma } from '$lib/server/prisma';
import { schema } from './schema';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth.validate();
	if (!session) throw redirect(303, `/login?from=/add-server`);
	return {};
};

export const actions = {
	default: async ({ locals, request }) => {
		const session = await locals.auth.validate();
		if (!session) throw error(401, 'Client must be authenticated to add a server.');

		const formData = Object.fromEntries(await request.formData());
		const parsed = await schema.safeParseAsync(formData);
		if (!parsed.success) {
			const { fieldErrors } = parsed.error.flatten();
			console.log(formData);
			console.log(fieldErrors);
			return fail(422, { data: formData, errors: fieldErrors });
		}

		const { edition, ...rest } = parsed.data;
		switch (edition) {
			case 'java':
				break;
			case 'bedrock':
				break;
			case 'separate':
				break;
			case 'crossplay':
				break;
			default:
				console.log('Somebody POST an invaild edition.');
				return fail(422, {});
		}

		let server;
		try {
			server = await prisma.server.create({
				data: {
					user_id: session.user.userId,
					version: 'unknown',
					edition,
					...rest
				}
			});
		} catch (error) {
			console.log(error);
			return fail(500, { error: 'An unknown database error occurred.' });
		}

		throw redirect(303, `/servers/${server.id}`);
	}
} satisfies Actions;
