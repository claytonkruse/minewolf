import { relations, type InferSelectModel } from "drizzle-orm";
import {
    pgTable,
    text,
    timestamp,
    boolean,
    integer,
    pgEnum,
    primaryKey,
    date,
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
    roles: many(userRoleTable),
}));

// Add new roles here, then run `pnpm generate` to create the migration.
export const roleEnum = pgEnum("role", ["admin"]);
export type Role = (typeof roleEnum.enumValues)[number];

export const userRoleTable = pgTable(
    "user_role",
    {
        userId: text("user_id")
            .notNull()
            .references(() => userTable.id, { onDelete: "cascade" }),
        role: roleEnum("role").notNull(),

        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => [primaryKey({ columns: [table.userId, table.role] })],
);
export type UserRole = InferSelectModel<typeof userRoleTable>;

export const userRolesRelations = relations(userRoleTable, ({ one }) => ({
    user: one(userTable, {
        fields: [userRoleTable.userId],
        references: [userTable.id],
    }),
}));

export type UserWithRoles = User & { roles: UserRole[] };

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
    // set by admins; null = not a sponsor, lower = shown first
    sponsorPosition: integer("sponsor_position"),

    // chanable by user
    address: text("ip").unique().notNull(),
    port: integer("port").notNull().default(25565),

    bedrockAddress: text("bedrock_address").notNull().default(""),
    bedrockPort: integer("bedrock_port").notNull().default(19132),

    addressPrivate: boolean("address_private").notNull().default(false),

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
    views: many(serverViewTable),
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

// "listing" = shown in the browse list, "page" = server page opened.
export const viewKindEnum = pgEnum("view_kind", ["listing", "page"]);
export type ViewKind = (typeof viewKindEnum.enumValues)[number];

// Daily view counters per server, incremented by /api/views/.
export const serverViewTable = pgTable(
    "server_view",
    {
        serverId: integer("server_id")
            .notNull()
            .references(() => serverTable.id, { onDelete: "cascade" }),
        kind: viewKindEnum("kind").notNull(),
        day: date("day", { mode: "string" }).notNull(),
        count: integer("count").notNull().default(0),
    },
    (table) => [
        primaryKey({ columns: [table.serverId, table.kind, table.day] }),
    ],
);
export const serverViewRelations = relations(serverViewTable, ({ one }) => ({
    server: one(serverTable, {
        fields: [serverViewTable.serverId],
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
