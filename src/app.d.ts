// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

declare global {
    namespace App {
        interface Locals {
            session: import("$lib/server/db/drizzle/schema").sessions | null;
            user: import("$lib/server/db/drizzle/schema").users | null;
        }
    }
}

export {};
