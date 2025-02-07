import { DB_URL } from "$env/static/private";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

export const db = drizzle({
    connection:
        DB_URL || "postgres://postgres:postgres@localhost:5432/postgres",
    schema,
});
