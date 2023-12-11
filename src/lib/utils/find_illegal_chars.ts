import { CHARS_ALLOWED_IN_USERNAME } from '$lib/server/config';

export default function find_illegal_chars(
	s: string,
	legal_chars: string = CHARS_ALLOWED_IN_USERNAME
) {
	let found_illegal: Array<string> = [];
	for (const char of s.split('')) {
		if (!legal_chars.includes(char)) found_illegal = [...found_illegal, char];
	}
	found_illegal = [...new Set(found_illegal)]; // removes duplicates.
	return found_illegal;
}
