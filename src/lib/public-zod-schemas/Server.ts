import { z } from "zod";
import { File } from "buffer";

const MAX_SERVER_IP_LENGTH = 50;
const MIN_SERVER_NAME_LENGTH = 4;
const MAX_SERVER_NAME_LENGTH = 100;

export const ServerSchema = z.object({
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
        .max(5000, { message: "Description may not exceed 5,000 characters." })
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
        .trim()
        .url({ message: "Map link must be a valid URL." })
        .refine((url) => url.startsWith("https://"), {
            message: "Map link must use https.",
        })
        .optional()
        .default(""),

    video: z.coerce.string().trim().url().optional(),

    whitelisted: z.boolean().default(false),
    autoVersion: z.boolean().default(true),

    versionString: z
        .string()
        .min(4, { message: "Version must be longer than 4 characters." })
        .max(80, { message: "Version cannot exceed 80 characters." })
        .optional(),

    addressPrivate: z.boolean().optional().default(false),

    // not in database
    bannerFile: z
        .instanceof(File, { message: "Banner file is invalid." })
        .optional(),
});
