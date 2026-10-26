import type { Role, UserWithRoles } from "$lib/server/db/drizzle/schema";

export function hasRole(user: UserWithRoles | null | undefined, role: Role) {
    return !!user?.roles.some((r) => r.role === role);
}
