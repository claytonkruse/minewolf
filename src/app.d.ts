// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			auth: import('lucia').AuthRequest;
		}
		// interface PageData {}
		// interface Platform {}
	}

	let prisma: PrismaClient;

	namespace Lucia {
		type Auth = import('$lib/server/lucia').Auth;
		type DatabaseUserAttributes = {
			username: string;
			createdAt: Date;
			lastOnlineAt: Date;
		};
		type DatabaseSessionAttributes = Record<string, never>; // Record<string, never> is apparently a better way of expressing an epmty object according to eslint.
	}
}

export {};
