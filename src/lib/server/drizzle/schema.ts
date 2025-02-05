import { relations, type InferSelectModel } from "drizzle-orm";
import {
    pgTable,
    text,
    timestamp,
    boolean,
    integer,
} from "drizzle-orm/pg-core";

export const users = pgTable("user", {
    id: text().primaryKey().unique(),

    discordId: text("discord_id").notNull().unique(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    lastOnlineAt: timestamp("last_online_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
    sessions: many(sessions),
}));

export const sessions = pgTable("session", {
    id: text("id").primaryKey().unique(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),

    discordAccessToken: text("discord_access_token").notNull(),
    discordAccessTokenExpiresAt: timestamp(
        "discord_access_token_expires_at",
    ).notNull(),
    discordRefreshToken: text("discord_refresh_token").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
    user: one(users, {
        fields: [sessions.userId],
        references: [users.id],
    }),
}));

export const servers = pgTable("server", {
    // not changable by user
    id: integer().primaryKey().generatedByDefaultAsIdentity().notNull(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    lastPingAt: timestamp("last_ping_at", { mode: "date" })
        .defaultNow()
        .notNull(),
    lastOnlineAt: timestamp("last_online_at", { mode: "date" })
        .defaultNow()
        .notNull(),

    rank: integer("rank").notNull().default(0),
    online: boolean("online").notNull().default(true),
    onlinePlayers: integer("online_players").notNull().default(0),
    maxPlayers: integer("max_players").notNull().default(0),
    iconUrl: text("icon_url").notNull().default(""),
    cleanMotd: text("clean_motd").notNull().default(""),
    htmlMotd: text("html_motd").notNull().default(""),
    crossplay: boolean("crossplay").default(false).notNull(),

    // chanable by user
    address: text("ip").unique().notNull(),
    port: integer("port").notNull().default(25565),

    bedrockAddress: text("bedrock_address"),
    bedrockPort: integer("bedrock_port").notNull().default(19132),

    votifierAddress: text("votifier_address").notNull().default(""),
    votifierPort: integer("votifier_port").notNull().default(8192),
    votifierKey: text("votifier_key").notNull().default(""),

    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    bannerUrl: text("banner_url").default(""),

    website: text("website").notNull().default(""),
    video: text("video").notNull().default(""),
    mapUrl: text("map_url").notNull().default(""),
    discord: text("discord").notNull().default(""),

    tags: text("tags").notNull().default(""),

    whitelisted: boolean("whitelisted").default(false).notNull(),

    versionString: text("version_string").default("1.8.9").notNull(),
    autoVersion: boolean("auto_version").default(true).notNull(),
});

export type Server = InferSelectModel<typeof servers>;

// export const votes = pgTable("vote", {
//     id: text("id").primaryKey().unique(),
//     createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
//     serverId: integer("server_id")
//         .notNull()
//         .references(() => servers.id, { onDelete: "cascade" }),
//     minecraftUsername: text("minecraft_username").notNull(),
// });

// export const tags = pgTable("tag", {
//     id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
//     type: text("type").notNull(),
//     name: text("name").unique().notNull(),
// });

// export const serverTags = pgTable(
//     "server_tag",
//     {
//         id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
//         serverId: integer("server_id")
//             .notNull()
//             .references(() => servers.id, { onDelete: "cascade" }),
//         tagId: integer("tag_id")
//             .notNull()
//             .references(() => tags.id, { onDelete: "cascade" }),
//     },
//     (table) => {
//         return {
//             uniqueServerTag: unique().on(table.serverId, table.tagId),
//         };
//     },
// );

// export const versions = pgTable("version", {
//     id: text("id").primaryKey(),
//     type: text("type").notNull(),
//     tagId: integer("tag_id")
//         .notNull()
//         .references(() => tags.id, { onDelete: "cascade" }),
// });
