import type { Actions, PageServerLoad } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { schema } from './schema';
import { auth } from '$lib/server/lucia';
import localize_url from '$lib/utils/localize_url';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth.validate();
	if (!session) return {};
	const { username } = session.user;
	throw redirect(302, `/profiles/${username}`);
};

export const actions: Actions = {
	default: async ({ request, url, locals }) => {
		const formData = Object.fromEntries(await request.formData()) as {
			username: string;
			password: string;
			email: string;
		};

		const validation = await schema.safeParseAsync(formData);
		if (!validation.success) {
			const { fieldErrors: errors } = validation.error.flatten();
			const { password, ...data } = formData;

			return fail(422, { data, errors });
		}

		const { username, password } = validation.data;

		try {
			const now = new Date();
			const user = await auth.createUser({
				key: {
					providerId: 'username',
					providerUserId: username.toLowerCase(),
					password
				},
				attributes: {
					username,
					createdAt: now,
					lastOnlineAt: now
				}
			});
			const session = await auth.createSession({
				userId: user.userId,
				attributes: {}
			});
			locals.auth.setSession(session);
		} catch (error) {
			console.log(error);
			return fail(500, {
				message: 'An unknown error occourred'
			});
		}

		const from = localize_url(url.searchParams.get('from'));
		throw redirect(303, '/register/success' + (from ? `?from=${from}` : ''));
	}
};
