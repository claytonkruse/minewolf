import type { PageServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { prisma } from '$lib/server/prisma';
import { schema } from './schema';
import pingServer from '$lib/utils/pingServer';
import { get_mc_versions } from '$lib/server/mc_versions';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth.validate();
	if (!session) throw redirect(303, `/login?from=/add-server`);
	const versions = await get_mc_versions();
	return { versions };
};

export const actions = {
	default: async ({ locals, request }) => {
		const session = await locals.auth.validate();
		if (!session)
			throw error(401, 'Client must be authenticated to add a server.');

		const formData = Object.fromEntries(await request.formData());
		const parsed = await schema.safeParseAsync(formData);
		if (!parsed.success) {
			const { fieldErrors } = parsed.error.flatten();
			console.log(formData);
			console.log(fieldErrors);
			return fail(422, { data: formData, errors: fieldErrors });
		}

		let server;
		try {
			const { ip } = parsed.data;
			const serverPingData = await pingServer(ip);
			const { online, version: version_raw } = serverPingData;
			if (!online)
				return fail(422, { error: 'Server must be online to be added.' });
			const version_range = version_raw.trim().split('-');
			const min_version = version_range[0];
			const max_version = version_range[version_range.length - 1];

			server = await prisma.server.create({
				data: {
					user_id: session.user.userId,
					min_version,
					max_version,
					...parsed.data
				}
			});
		} catch (error) {
			console.log(error);
			return fail(500, { error: 'An unknown database error occurred.' });
		}

		throw redirect(303, `/servers/${server.id}`);
	}
} satisfies Actions;
