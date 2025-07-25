import type { PageServerLoad, Actions } from "./$types";
import { db } from "$lib/server/db/drizzle/db";
import { serverTable, voteTable } from "$lib/server/db/drizzle/schema";
import { eq, gt, and, or } from "drizzle-orm";
import { randomUUID } from "node:crypto";

const UsernameSchema = z
    .string({ required_error: "Username is required." })
    .min(2, { message: "Username must be at least 2 characters." })
    .max(100, { message: "Username must be less than 100 characters." });

const PublicSchema = z.object({
    voteUsername: UsernameSchema,
    "cf-turnstile-response": z.string({ required_error: "CAPTCHA error." }),
});

export const load: PageServerLoad = async ({ params }) => {
    const serverId = Number(params.server);
    const server = await db.query.serverTable
        .findFirst({
            where: eq(serverTable.id, serverId),
        })

        .catch((e) => error(400, "Database error."));

    if (!server) {
        throw error(404, "Server not found.");
    }

    const form = await superValidate(zod(PublicSchema));

    return { server, form };
};

// vote implementation
// TODO: secure this outdated implementation
import ursa from "ursa-purejs";
import net from "node:net";
import { error, redirect, fail } from "@sveltejs/kit";
import { setError, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { z } from "zod";

function sendData(settings, callback) {
    settings.key = settings.key.replace(/ /g, "+");
    settings.key = wordwrap(settings.key, 65, true);
    let timestampdata = new Date().getTime();
    if (settings.data.timestamp)
        timestampdata = new Date(settings.data.timestamp);
    let pubKey = new Buffer(
        "-----BEGIN PUBLIC KEY-----\n" +
            settings.key +
            "\n-----END PUBLIC KEY-----\n",
    );

    let build =
        "VOTE\n" +
        settings.data.site +
        "\n" +
        settings.data.user +
        "\n" +
        settings.data.addr +
        "\n" +
        timestampdata +
        "\n";
    let buf = new Buffer(build, "binary");

    let key = ursa.createPublicKey(pubKey);
    let data = key.encrypt(build, "binary", "binary", ursa.RSA_PKCS1_PADDING);

    let called = false;
    let callbackWrapper = function (e) {
        if (!called) {
            called = true;
            callback(e);
        }
    };

    let connection = net.createConnection(
        {
            host: settings.host,
            port: settings.port,
        },
        function () {
            connection.write(data, "binary", function () {
                connection.end();
                callbackWrapper(null);
            });
        },
    );
    connection.setTimeout(settings.timeout || 2000, function () {
        connection.end();
        return callbackWrapper(new Error("Socket timeout"));
    });
    connection.once("error", function (e) {
        return callbackWrapper(e);
    });
}

function wordwrap(str, maxWidth) {
    let done;
    let res;
    let found;
    let newLineStr = "\n";
    done = false;
    res = "";
    do {
        found = false;

        if (!found) {
            res += [str.slice(0, maxWidth), newLineStr].join("");
            str = str.slice(maxWidth);
        }

        if (str.length < maxWidth) {
            res += str;
            done = true;
        }
    } while (!done);

    return res;
}

import { TurnstileSchema } from "$lib/server/private-zod-schemas";

export const actions: Actions = {
    default: async ({ getClientAddress, request, params, cookies }) => {
        const ip = getClientAddress();
        console.log(`Received vote request from ${ip}.`);

        const form = await superValidate(request, zod(PublicSchema));
        if (!form.valid) return fail(400, { form });

        const turnstileParse = await TurnstileSchema.safeParseAsync(
            form.data["cf-turnstile-response"],
        );

        if (!turnstileParse.success) {
            setError(form, "cf-turnstile-response", "CAPTCHA error.");
            return fail(400, { form });
        }

        const username = form.data.voteUsername;

        const serverId = Number(params.server);

        const existingVote = await db.query.voteTable.findFirst({
            where: and(
                gt(
                    voteTable.createdAt,
                    new Date(Date.now() - 1000 * 60 * 60 * 24),
                ),
                or(
                    // The below is designed to allow same user to vote with different ips on different servers.
                    // This addresses the case that a bad actor tries to interfere with votes by impersonating a user and
                    // voting for an arbitrary server, thereby wasting his victim's vote.
                    eq(voteTable.ip, ip),
                    and(
                        eq(voteTable.minecraftUsername, username),
                        eq(voteTable.serverId, serverId),
                    ),
                ),
            ),
        });
        if (existingVote) {
            console.log("You already voted.");
            setError(form, "voteUsername", "You have already voted today.");
            return fail(400, { form });
        }

        const server = await db.query.serverTable.findFirst({
            where: eq(serverTable.id, serverId),
        });

        if (!server) {
            return error(404, "Server does not exist.");
        }

        await db.insert(voteTable).values({
            id: randomUUID(),
            serverId,
            minecraftUsername: username,
            ip,
        });

        cookies.set("last_voted_at", Date.now().toString(), {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        if (!server.votifierEnabled) {
            console.log("Server does not have votifier enabled.");
        } else {
            sendData(
                {
                    host: server.votifierAddress || server.address,
                    port: server.votifierPort || 8192,
                    key: server.votifierKey,
                    data: {
                        user: username,
                        site: "Minewolf",
                        timestamp: Date.now(),
                    },
                },
                () => {},
            );
            console.log("Vote sent.");
        }

        redirect(302, "./success/");
    },
};
