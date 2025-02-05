import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./src/lib/server/drizzle/schema.ts",
    out: "./src/lib/server/drizzle/migrations",
    dialect: "postgresql",
    dbCredentials: {
        url:
            (process.env.DB_URL as string) ||
            "postgres://postgres:postgres@localhost:5432/postgres",
    },
    verbose: true,
    strict: true,
});
