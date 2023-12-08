import localize_url from '$lib/utils/localize_url';
import type { Actions, PageServerLoad } from './$types';
import { redirect, error } from '@sveltejs/kit';
import { auth } from '$lib/server/lucia';

export const load: PageServerLoad = () => {
	throw error(405, {
		message: 'GET requests are not permitted due to security concerns; use POST.'
	});
};

export const actions = {
	default: async ({ request, cookies, locals }) => {
		const { redirect: redirect_url, theme, logout } = Object.fromEntries(await request.formData());

		if (theme) cookies.set('theme', theme.toString(), { path: '/' });

		const session = await locals.auth.validate();
		if (logout && session) {
			await auth.invalidateSession(session.sessionId);
			locals.auth.setSession(null);
		}

		throw redirect(303, localize_url(redirect_url) || '/');
	}
} satisfies Actions;
