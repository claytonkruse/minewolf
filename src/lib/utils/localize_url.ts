export default function localize_url(raw: any) {
	if (!(typeof raw === 'string' || raw instanceof URL)) return undefined;
	const url = new URL(raw, 'https://4chan.org');
	return url.pathname + url.search + url.hash;
}
