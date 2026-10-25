import { db } from "$lib/server/db/drizzle/db";
import { serverTable } from "$lib/server/db/drizzle/schema";
import { and, asc, eq, isNotNull, isNull, max } from "drizzle-orm";

export async function getSponsorIds() {
    const rows = await db
        .select({ id: serverTable.id })
        .from(serverTable)
        .where(isNotNull(serverTable.sponsorPosition))
        .orderBy(asc(serverTable.sponsorPosition));
    return rows.map((r) => r.id);
}

// Renumbers sponsors 1..n in the given order.
export async function setSponsorOrder(ids: number[]) {
    await db.transaction(async (tx) => {
        for (const [i, id] of ids.entries()) {
            await tx
                .update(serverTable)
                .set({ sponsorPosition: i + 1 })
                .where(eq(serverTable.id, id));
        }
    });
}

// Adds the server to the end of the sponsor list. Returns false if it doesn't
// exist or is already a sponsor.
export async function addSponsor(id: number) {
    const [{ last }] = await db
        .select({ last: max(serverTable.sponsorPosition) })
        .from(serverTable);
    const updated = await db
        .update(serverTable)
        .set({ sponsorPosition: (last ?? 0) + 1 })
        .where(and(eq(serverTable.id, id), isNull(serverTable.sponsorPosition)))
        .returning({ id: serverTable.id });
    return updated.length > 0;
}

export async function removeSponsor(id: number) {
    await db
        .update(serverTable)
        .set({ sponsorPosition: null })
        .where(eq(serverTable.id, id));
    await setSponsorOrder(await getSponsorIds());
}
