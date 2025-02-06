import { serverTable } from "$lib/server/drizzle/schema";
import { z } from "zod";

const MAX_SERVER_IP_LENGTH = 50;
const MIN_SERVER_NAME_LENGTH = 4;
const MAX_SERVER_NAME_LENGTH = 100;

const serverSchema = {
    // not chanable by user
    id: z.undefined(),
    userId: z.undefined(),
    createdAt: z.undefined(),
    lastPingAt: z.undefined(),
    lastOnlineAt: z.undefined(),

    rank: z.undefined(),
    online: z.undefined(),
    onlinePlayers: z.undefined(),
    maxPlayers: z.undefined(),
    iconUrl: z.undefined(),
    cleanMotd: z.undefined(),
    htmlMotd: z.undefined(),
    crossplay: z.undefined(),

    // chanable by user & refined
    address: z
        .string({ required_error: "A server IP or hostname is required." })
        .trim()
        .max(MAX_SERVER_IP_LENGTH, {
            message: `Server IP may not exceed ${MAX_SERVER_IP_LENGTH} characters.`,
        }),
    port: z.coerce
        .number({ invalid_type_error: "Port must be a number." })
        .int({ message: "Port must be an integer." })
        .nonnegative({ message: "Port cannot be negative." })
        .lte(65535, { message: "Port must be valid." })
        .default(25565),
    bedrockAddress: z
        .string({ required_error: "A server IP or hostname is required." })
        .trim()
        .max(MAX_SERVER_IP_LENGTH, {
            message: `Server IP may not exceed ${MAX_SERVER_IP_LENGTH} characters.`,
        })
        .default(""),
    bedrockPort: z.coerce
        .number({ invalid_type_error: "Port must be a number." })
        .int({ message: "Port must be an integer." })
        .nonnegative({ message: "Port cannot be negative." })
        .lte(65535, { message: "Port must be valid." })
        .default(19132),
    votifierEnabled: z.boolean().default(false),
    votifierAddress: z
        .string({ required_error: "A server IP or hostname is required." })
        .trim()
        .max(MAX_SERVER_IP_LENGTH, {
            message: `Server IP may not exceed ${MAX_SERVER_IP_LENGTH} characters.`,
        }),
    votifierPort: z.coerce
        .number({ invalid_type_error: "Port must be a number." })
        .int({ message: "Port must be an integer." })
        .nonnegative({ message: "Port cannot be negative." })
        .lte(65535, { message: "Port must be valid." })
        .default(8192),
    votifierKey: z
        .string()
        .max(1000, {
            message: "Votifier public key may not exceed 1,000 characters.",
        })
        .default(""),

    name: z
        .string({ required_error: "You must enter a server name." })
        .trim()
        .min(MIN_SERVER_NAME_LENGTH, {
            message: `Server name must be at least ${MIN_SERVER_NAME_LENGTH} characters.`,
        })
        .max(MAX_SERVER_NAME_LENGTH, {
            message: `Server name may not exceed ${MAX_SERVER_NAME_LENGTH} characters.`,
        })
        .refine((name) => !/[^\w\d" "]/.test(name), {
            message: "Name may only contain letters, numbers, and spaces.",
        })
        .refine((name) => !name.includes("  "), {
            message: "Name may not contain two consecutive spaces.",
        }),

    description: z
        .string()
        .max(1000, { message: "Description may not exceed 1,000 characters." })
        .default(""),
    tags: z
        .string()
        .max(1000, { message: "Tags may not exceed 1,000 characters." })
        .trim()
        .default(""),

    website: z
        .string()
        .max(100, { message: "Website link may not exceed 100 characters." })
        .optional()
        .default(""),
    discord: z
        .string()
        .max(100, { message: "Discord invite may not exceed 100 characters." })
        .optional()
        .default(""),

    mapUrl: z
        .string()
        .max(100, { message: "Map link may not exceed 100 characters." })
        .optional()
        .default(""),
    bannerUrl: z
        .string()
        .trim()
        .refine((url) => new Blob([url]).size <= 1024 * 1024 * 3, {
            message: "Banner image may not exceed 3MB.",
        })
        .default(""),

    whitelisted: z.boolean().default(false),
    autoVersion: z.boolean().default(true),
};

import { createSchemaFactory } from "drizzle-zod";
const { createInsertSchema, createUpdateSchema } = createSchemaFactory({
    // coerce: true,
});

export const insertServerSchema = createInsertSchema(serverTable, serverSchema);
export type InsertServerSchema = z.infer<typeof insertServerSchema>;

export const updateServerSchema = createUpdateSchema(serverTable, serverSchema);
export type UpdateServerSchema = z.infer<typeof updateServerSchema>;
