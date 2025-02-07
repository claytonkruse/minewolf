import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const { DB_URL } = process.env;

export default defineConfig({
    out: "./drizzle",
    schema: "./src/lib/server/db/drizzle/schema.ts",
    dialect: "postgresql",
    dbCredentials: {
        url: DB_URL || "postgres://postgres:postgres@localhost:5432/postgres",
    },
});
