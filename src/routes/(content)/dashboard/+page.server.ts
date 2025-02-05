import type { PageServerLoad } from "./$types";

export const load = (async ({ parent, locals }) => {
    const { user } = locals;
    await parent(); // required, otherwise the protection from the layout will be bypassed as load functions normally run in parallel
    return { user };
}) satisfies PageServerLoad;
