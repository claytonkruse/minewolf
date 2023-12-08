import type { Handle } from '@sveltejs/kit';
import { auth } from '$lib/server/lucia';

const luciaHook: Handle = async ({ event, resolve }) => {
	event.locals.auth = auth.handleRequest(event);
	return await resolve(event);
};

export const handle: Handle = luciaHook;
