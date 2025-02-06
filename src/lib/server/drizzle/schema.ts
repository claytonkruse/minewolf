import { relations, type InferSelectModel } from "drizzle-orm";
import {
    pgTable,
    text,
    timestamp,
    boolean,
    integer,
} from "drizzle-orm/pg-core";

export const userTable = pgTable("user", {
    id: text().primaryKey().unique(),

    discordId: text("discord_id").notNull().unique(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    lastOnlineAt: timestamp("last_online_at").defaultNow().notNull(),
});
export type User = InferSelectModel<typeof userTable>;

export const usersRelations = relations(userTable, ({ many }) => ({
    sessions: many(sessionTable),
    servers: many(serverTable),
}));

export const sessionTable = pgTable("session", {
    id: text("id").primaryKey().unique(),
    userId: text("user_id")
        .notNull()
        .references(() => userTable.id, { onDelete: "cascade" }),

    discordAccessToken: text("discord_access_token").notNull(),
    discordAccessTokenExpiresAt: timestamp(
        "discord_access_token_expires_at",
    ).notNull(),
    discordRefreshToken: text("discord_refresh_token").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type Session = InferSelectModel<typeof sessionTable>;

export const sessionsRelations = relations(sessionTable, ({ one }) => ({
    user: one(userTable, {
        fields: [sessionTable.userId],
        references: [userTable.id],
    }),
}));

export const serverTable = pgTable("server", {
    // not changable by user
    id: integer().primaryKey().generatedByDefaultAsIdentity().notNull(),
    userId: text("user_id")
        .notNull()
        .references(() => userTable.id, { onDelete: "cascade" }),
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
    crossplay: boolean("crossplay").notNull().default(false),

    // chanable by user
    address: text("ip").unique().notNull(),
    port: integer("port").notNull().default(25565),

    bedrockAddress: text("bedrock_address").notNull().default(""),
    bedrockPort: integer("bedrock_port").notNull().default(19132),

    votifierEnabled: boolean("votifier_enabled").notNull().default(false),
    votifierAddress: text("votifier_address").notNull().default(""),
    votifierPort: integer("votifier_port").notNull().default(8192),
    votifierKey: text("votifier_key").notNull().default(""),

    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    bannerUrl: text("banner_url").notNull().default(""),

    website: text("website").notNull().default(""),
    video: text("video").notNull().default(""),
    mapUrl: text("map_url").notNull().default(""),
    discord: text("discord").notNull().default(""),

    tags: text("tags").notNull().default(""),

    whitelisted: boolean("whitelisted").default(false).notNull(),

    versionString: text("version_string").default("1.8.9").notNull(),
    autoVersion: boolean("auto_version").default(true).notNull(),
});
export type Server = InferSelectModel<typeof serverTable>;
export const serverRelations = relations(serverTable, ({ one, many }) => ({
    user: one(userTable, {
        fields: [serverTable.userId],
        references: [userTable.id],
    }),
    votes: many(voteTable),
}));

export const voteTable = pgTable("vote", {
    id: text("id").primaryKey().unique(),
    serverId: integer("server_id")
        .notNull()
        .references(() => serverTable.id, { onDelete: "cascade" }),
    ip: text("ip").notNull(),
    minecraftUsername: text("minecraft_username").notNull(),

    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});
export const voteRelations = relations(voteTable, ({ one }) => ({
    server: one(serverTable, {
        fields: [voteTable.serverId],
        references: [serverTable.id],
    }),
}));

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
