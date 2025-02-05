// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

declare global {
    namespace App {
        interface Locals {
            session: import("$lib/server/drizzle/schema").sessions | null;
            user: import("$lib/server/drizzle/schema").users | null;
        }
    }
}

export {};
