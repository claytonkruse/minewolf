import { z } from 'zod';
import illegal_usernames from './illegal_usernames';
import { prisma } from '$lib/server/prisma';

const minPasswordLength: number = 8;
const maxPasswordLength: number = 256;

export const schema = z.object({
	username: z
		.string({ required_error: 'A username is required.' })
		.min(3, { message: 'Username must be at least 3 characters.' })
		.max(18, { message: 'Username may not exceed 18 characters.' })
		.superRefine((username, ctx) => {
			const legalChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_';
			let found_illegal: Array<string> = [];
			for (const char of username.split('')) {
				if (!legalChars.includes(char)) found_illegal = [...found_illegal, char];
			}
			found_illegal = [...new Set(found_illegal)]; // removes duplicates.
			if (found_illegal.length == 0) return;
			let message = 'Username may not contain ';
			if (found_illegal.length === 1) {
				message += found_illegal[0];
			} else {
				for (let i = 0; i < found_illegal.length - 1; i++) message += `${found_illegal[i]}, `;
				message += `or ${found_illegal.at(-1)}`;
			}
			message += '.';
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message
			});
		})
		.refine((u) => !(u.slice(0, 1) + u.slice(-1)).includes('_'), {
			message: 'Username may not begin or end with an underscore.'
		})
		.refine((u) => !u.includes('__'), {
			message: 'Username may not contain two consecutive underscores.'
		})
		.refine(
			async (username) =>
				illegal_usernames.includes(username) ||
				!(await prisma.user.findUnique({ where: { username } })),
			{ message: 'That username is not availible.' }
		),
	password: z
		.string({ required_error: 'A password is required.' })
		.min(minPasswordLength, {
			message: `Password must be at least ${minPasswordLength} characters long.`
		})
		.max(maxPasswordLength, { message: `Password cannot exceed ${maxPasswordLength} characters.` })
		.refine((v) => v === v.trim(), { message: 'Password may not begin or end with whitespace.' }),
	email: z
		.string()
		.trim()
		.max(64, { message: 'Email may not excceed 64 characters.' })
		.email({ message: 'Email must be valid.' })
		.optional()
});
