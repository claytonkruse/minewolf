import { z } from "zod";
import { ServerSchema } from "./Server";
export const InsertServerSchema = ServerSchema;
export type InsertServerSchema = z.infer<typeof InsertServerSchema>;

export const UpdateServerSchema = ServerSchema;
export type UpdateServerSchema = z.infer<typeof UpdateServerSchema>;
