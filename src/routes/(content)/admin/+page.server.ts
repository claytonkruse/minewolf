import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ getClientAddress, request }) => {
    const { headers } = request;
    const ip = getClientAddress();

    return { ip, headers: Object.fromEntries(headers) };
};
