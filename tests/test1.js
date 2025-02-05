import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

const users = pgTable("users", {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    name: text().notNull(),
    age: integer().notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
});

const userInsertSchema = createInsertSchema(users);

const user = { id: 69, name: "John", age: 20, createdAt: new Date(2) }; // bad data
const parsed = userInsertSchema.parse(user);

console.log(parsed); // { name: 'John', age: 20, createdAt: 1970-01-01T00:00:00.002Z }

// id is omitted, but createdAt is not
// createdAt: 1970-01-01T00:00:00.002Z (bad)
