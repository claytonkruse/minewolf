import type { PageServerLoad, Actions } from "./$types";
import { db } from "$lib/server/db/drizzle/db";
import { serverTable, voteTable } from "$lib/server/db/drizzle/schema";
import { eq, gt, and, or } from "drizzle-orm";
import { randomUUID } from "node:crypto";

export const load = (async ({ params }) => {
    const serverId = Number(params.server);
    const server = await db.query.serverTable
        .findFirst({
            where: eq(serverTable.id, serverId),
        })

        .catch((e) => error(400, "Database error."));

    if (!server) {
        throw error(404, "Server not found.");
    }

    return { server };
}) satisfies PageServerLoad;

// vote implementation
// TODO: secure this outdated implementation
import ursa from "ursa-purejs";
import net from "node:net";
import { error, redirect } from "@sveltejs/kit";

let key;

function sendData(settings, callback) {
    settings.key = settings.key.replace(/ /g, "+");
    settings.key = wordwrap(settings.key, 65, true);
    var timestampdata = new Date().getTime();
    if (settings.data.timestamp)
        timestampdata = new Date(settings.data.timestamp);
    var pubKey = new Buffer(
        "-----BEGIN PUBLIC KEY-----\n" +
            settings.key +
            "\n-----END PUBLIC KEY-----\n",
    );

    var build =
        "VOTE\n" +
        settings.data.site +
        "\n" +
        settings.data.user +
        "\n" +
        settings.data.addr +
        "\n" +
        timestampdata +
        "\n";
    var buf = new Buffer(build, "binary");

    key = ursa.createPublicKey(pubKey);
    var data = key.encrypt(build, "binary", "binary", ursa.RSA_PKCS1_PADDING);

    var called = false;
    var callbackWrapper = function (e) {
        if (!called) {
            called = true;
            callback(e);
        }
    };

    var connection = net.createConnection(
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
    var newLineStr = "\n";
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

export const actions: Actions = {
    default: async ({ getClientAddress, request, params, cookies }) => {
        const ip = getClientAddress();
        console.log(`Received vote request from ${ip}.`);

        const formData = await request.formData();
        let username = formData.get("vote-username")?.toString();
        username = username || "";
        if (username.length > 100) {
            error(400, "Invalid Minecraft username.");
        }

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
        // if (existingVote) {
        //     console.log("You already voted.");
        //     error(400, "You have already voted today.");
        // }

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
        }

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

        redirect(302, "./success/");
    },
};
