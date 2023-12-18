import { z } from 'zod';
import find_illegal_chars from '$lib/utils/find_illegal_chars';
import {
	MAX_SERVER_IP_LENGTH,
	MIN_SERVER_NAME_LENGTH,
	MAX_SERVER_NAME_LENGTH,
	MAX_SERVER_SLOGAN_LENGTH,
	MAX_SERVER_DESCRIPTION_LENGTH,
	MAX_SERVER_WEBSITE_URL_LENGTH
} from '$lib/server/config';

const schema = z.object({
	ip: z
		.string({ required_error: 'A server IP or hostname is required.' })
		.trim()
		.max(MAX_SERVER_IP_LENGTH, {
			message: `Server IP may not exceed ${MAX_SERVER_IP_LENGTH} characters.`
		}),
	port: z.coerce
		.number({ invalid_type_error: 'Port must be a number.' })
		.int({ message: 'Port must be an integer.' })
		.nonnegative({ message: 'Port cannot be negative.' })
		.lte(65535, { message: 'Port must be valid.' })
		.nullish(),
	name: z
		.string({ required_error: 'You must enter a server name.' })
		.trim()
		.min(MIN_SERVER_NAME_LENGTH, {
			message: `Server name must be at least ${MIN_SERVER_NAME_LENGTH} characters.`
		})
		.max(MAX_SERVER_NAME_LENGTH, {
			message: `Server name may not exceed ${MAX_SERVER_NAME_LENGTH} characters.`
		})
		.refine(
			(name) =>
				!find_illegal_chars(
					name,
					'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
				).length,
			{ message: 'Name may only contain letters.' }
		),
	slogan: z
		.string()
		.trim()
		.max(MAX_SERVER_SLOGAN_LENGTH, {
			message: `Slogan may not exceed ${MAX_SERVER_SLOGAN_LENGTH} characters.`
		})
		.nullish(),
	description: z.string().trim().max(MAX_SERVER_DESCRIPTION_LENGTH).nullish(),

	website: z.union([
		z.literal('').nullish(),
		z
			.string()
			.trim()
			.max(MAX_SERVER_WEBSITE_URL_LENGTH)
			.url({ message: 'Website link must be a vaild URL.' })
	]),
	video: z.union([
		z.literal('').nullish(),
		z
			.string()
			.trim()
			.max(MAX_SERVER_WEBSITE_URL_LENGTH)
			.url({ message: 'Video link must be a vaild URL.' })
	]),
	dynmap: z.union([
		z.literal('').nullish(),
		z
			.string()
			.trim()
			.max(MAX_SERVER_WEBSITE_URL_LENGTH)
			.url({ message: 'Dynmap link must be a valid URL.' })
	]),
	discord: z.union([
		z.literal('').nullish(),
		z
			.string()
			.trim()
			.max(MAX_SERVER_WEBSITE_URL_LENGTH)
			.url({ message: 'Discord link must be a vaild URL.' })
	]),
	edition: z
		.string()
		.trim()
		.toLowerCase()
		.refine(
			(val) => ['java', 'bedrock', 'seperate', 'crossplay'].includes(val),
			{
				message: 'Edition must be valid.'
			}
		)
		.nullish(),
	whitelisted: z.coerce.boolean().nullish()
});

export { schema };
