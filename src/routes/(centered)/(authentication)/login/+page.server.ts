import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { z } from 'zod';
import { auth } from '$lib/server/lucia';
import { LuciaError } from 'lucia';
import localize_url from '$lib/utils/localize_url';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth.validate();
	if (!session) return {};
	const { username } = session.user;
	throw redirect(302, `/profiles/${username}`);
};

const schema = z.object({
	username: z.string({ required_error: 'You must enter a username.' }).trim().min(1),
	password: z.string().trim().optional()
});

export const actions = {
	default: async ({ request, url, locals }) => {
		const formData = Object.fromEntries(await request.formData()) as {
			username: string;
			password: string;
		};

		const validation = await schema.safeParseAsync(formData);
		validation.success;
		if (!validation.success) {
			const { fieldErrors: errors } = validation.error.flatten();
			const { password: _, ...data } = formData;
			console.log('failed to login');
			return { data, errors };
		}

		const { username, password } = validation.data;
		if (!password) throw redirect(303, '/login/via-email');

		try {
			const key = await auth.useKey('username', username.toLowerCase(), password);
			const session = await auth.createSession({ userId: key.userId, attributes: {} });
			locals.auth.setSession(session);
		} catch (e) {
			if (
				e instanceof LuciaError &&
				(e.message === 'AUTH_INVALID_KEY_ID' || e.message === 'AUTH_INVALID_PASSWORD')
			) {
				return fail(400, { message: 'Invalid credentials.' });
			}
			return fail(500, {
				message: 'An unknown error occured.'
			});
		}

		throw redirect(303, localize_url(url.searchParams.get('from')) || '/');
	}
} satisfies Actions;
