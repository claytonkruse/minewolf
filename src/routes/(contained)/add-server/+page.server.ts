import type { PageServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { z } from 'zod';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth.validate();
	if (!session) throw redirect(303, `/login?from=/add-server`);
	return {};
};

import {
	MIN_SERVER_NAME_LENGTH,
	MAX_SERVER_NAME_LENGTH,
	MAX_SERVER_SLOGAN_LENGTH,
	MAX_SERVER_DESCRIPTION_LENGTH,
	MAX_SERVER_WEBSITE_URL_LENGTH
} from '$lib/server/config';
import find_illegal_chars from '$lib/utils/find_illegal_chars';

const schema = z.object({
	ip: z.string({ required_error: 'A server IP or hostname is required.' }).trim().max(40),
	port: z.coerce.number().int().nonnegative().lte(65535).nullish(),
	name: z
		.string({ required_error: 'You must enter a server name.' })
		.trim()
		.min(MIN_SERVER_NAME_LENGTH)
		.max(MAX_SERVER_NAME_LENGTH)
		.refine(
			(name) =>
				!find_illegal_chars(name, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ').length,
			{ message: 'Name may only contain letters.' }
		),
	slogan: z.string().trim().max(MAX_SERVER_SLOGAN_LENGTH).nullish(),
	description: z.string().trim().max(MAX_SERVER_DESCRIPTION_LENGTH).nullish(),

	website: z.union([
		z.literal('').nullish(),
		z.string().trim().max(MAX_SERVER_WEBSITE_URL_LENGTH).url()
	]),
	video: z.union([
		z.literal('').nullish(),
		z.string().trim().max(MAX_SERVER_WEBSITE_URL_LENGTH).url()
	]),
	dynmap: z.union([
		z.literal('').nullish(),
		z.string().trim().max(MAX_SERVER_WEBSITE_URL_LENGTH).url()
	]),
	discord: z.union([
		z.literal('').nullish(),
		z.string().trim().max(MAX_SERVER_WEBSITE_URL_LENGTH).url()
	]),

	edition: z
		.string()
		.trim()
		.toLowerCase()
		.refine((val) => ['java', 'bedrock', 'seperate', 'crossplay'].includes(val))
		.nullish(),
	whitelisted: z.coerce.boolean().nullish()
});

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
			return fail(422, { formData, fieldErrors });
		}

		const { edition, ...rest } = parsed.data;
		switch (edition) {
			case 'java':
				break;
			case 'bedrock':
				break;
			case 'seperate':
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

		throw redirect(303, `/server/${server.id}`);
	}
} satisfies Actions;
