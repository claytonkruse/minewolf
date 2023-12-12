import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { z } from 'zod';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ locals }) => {
	// const session = await locals.auth.validate();
	// if (!session) throw redirect(303, `/login?from=/add-server`);
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
	// username: z.string({ required_error: 'You must enter a username.' }).trim().min(1),
	// password: z.string().trim().optional(),
	ip: z.string().trim().min(3, { message: 'A server IP or hostname is required.' }).max(40),
	port: z.number().int().nonnegative().lte(65535),
	name: z
		.string({ required_error: 'You must enter a server name.' })
		.trim()
		.min(MIN_SERVER_NAME_LENGTH)
		.max(MAX_SERVER_NAME_LENGTH)
		.refine(
			(name) => !find_illegal_chars(name, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'),
			{ message: 'Name may only contain letters.' }
		),
	slogan: z.string().trim().max(MAX_SERVER_SLOGAN_LENGTH),
	description: z.string().trim().max(MAX_SERVER_DESCRIPTION_LENGTH),
	website: z.string().trim().max(MAX_SERVER_WEBSITE_URL_LENGTH).url(),
	video: z.string().trim().max(MAX_SERVER_WEBSITE_URL_LENGTH).url(),
	dynmap: z.string().trim().max(MAX_SERVER_WEBSITE_URL_LENGTH).url(),
	discord: z.string().trim().max(MAX_SERVER_WEBSITE_URL_LENGTH).url(),
	edition: z
		.string()
		.trim()
		.toLowerCase()
		.refine((val) => ['java', 'bedrock', 'seperate', 'crossplay'].includes(val)),
	whitelisted: z.boolean()
});

export const actions = {
	default: async ({ locals, request }) => {
		const session = await locals.auth.validate();
		if (!session) throw error(401, 'Client must be authenticated to add a server.');

		const formData = await request.formData();
		const parsed = await schema.safeParseAsync(formData);
		if (!parsed.success) {
			const { fieldErrors: errors } = parsed.error.flatten();
			return { data: formData, errors };
		}

		prisma.server.create({
			data: {
				user_id: session.user.userId,
				version: 'unknown',
				...parsed.data
			}
		});
	}
} satisfies Actions;
