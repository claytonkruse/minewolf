// Pings a Java Edition server with the Server List Ping protocol.
// https://minecraft.wiki/w/Java_Edition_protocol/Server_List_Ping
import net from "node:net";
import { resolveSrv } from "node:dns/promises";
import { parseMotd, stripCodes, type ChatComponent } from "./motd";

const DEFAULT_PORT = 25565;
const TIMEOUT_MS = 5000;
// the status response is small JSON plus a 64x64 favicon; anything far
// bigger means we're not talking to a Minecraft server
const MAX_RESPONSE_BYTES = 1024 * 1024;

export type PingResult =
    | { online: false }
    | {
          online: true;
          version: string;
          protocol: number;
          players: { online: number; max: number };
          motd: { clean: string[]; html: string[] };
          icon: string | undefined;
      };

type StatusResponse = {
    version?: { name?: string; protocol?: number };
    players?: { online?: number; max?: number };
    description?: ChatComponent;
    favicon?: string;
};

export function writeVarInt(value: number) {
    const bytes: number[] = [];
    let v = value >>> 0;
    do {
        let byte = v & 0x7f;
        v >>>= 7;
        if (v) byte |= 0x80;
        bytes.push(byte);
    } while (v);
    return Buffer.from(bytes);
}

// returns undefined when the buffer doesn't hold a complete VarInt yet
export function readVarInt(buf: Buffer, offset = 0) {
    let value = 0;
    for (let i = 0; i < 5; i++) {
        if (offset + i >= buf.length) return undefined;
        const byte = buf[offset + i];
        value |= (byte & 0x7f) << (7 * i);
        if (!(byte & 0x80)) return { value, size: i + 1 };
    }
    throw new Error("VarInt is too big");
}

function packet(id: number, ...fields: Buffer[]) {
    const body = Buffer.concat([writeVarInt(id), ...fields]);
    return Buffer.concat([writeVarInt(body.length), body]);
}

function handshake(host: string, port: number) {
    const hostBytes = Buffer.from(host, "utf8");
    const portBytes = Buffer.alloc(2);
    portBytes.writeUInt16BE(port);
    return packet(
        0x00,
        writeVarInt(-1), // protocol version; -1 asks for the server's own
        writeVarInt(hostBytes.length),
        hostBytes,
        portBytes,
        writeVarInt(1), // next state: status
    );
}

// parses a full status packet, or returns undefined if more data is needed
function parseStatus(buf: Buffer): StatusResponse | undefined {
    const length = readVarInt(buf);
    if (!length || buf.length < length.size + length.value) return undefined;

    let offset = length.size;
    const id = readVarInt(buf, offset);
    if (!id || id.value !== 0x00)
        throw new Error("Unexpected packet from server");
    offset += id.size;

    const strLength = readVarInt(buf, offset);
    if (!strLength) throw new Error("Malformed status packet");
    offset += strLength.size;

    const json = buf.toString("utf8", offset, offset + strLength.value);
    return JSON.parse(json);
}

function requestStatus(host: string, port: number) {
    return new Promise<StatusResponse>((resolve, reject) => {
        const socket = net.connect({ host, port });
        let data = Buffer.alloc(0);

        const fail = (err: Error) => {
            socket.destroy();
            reject(err);
        };

        socket.setTimeout(TIMEOUT_MS, () => fail(new Error("Timed out")));
        socket.on("error", fail);
        socket.on("close", () => fail(new Error("Connection closed")));

        socket.on("connect", () => {
            socket.write(handshake(host, port));
            socket.write(packet(0x00)); // status request
        });

        socket.on("data", (chunk) => {
            data = Buffer.concat([data, chunk]);
            if (data.length > MAX_RESPONSE_BYTES)
                return fail(new Error("Response too large"));
            try {
                const status = parseStatus(data);
                if (!status) return;
                socket.destroy();
                resolve(status);
            } catch (e) {
                fail(e as Error);
            }
        });
    });
}

// like the vanilla client, only look up an SRV record when no port is given
async function resolveAddress(address: string, port: number | undefined) {
    if (port) return { host: address, port };
    try {
        const [record] = await resolveSrv(`_minecraft._tcp.${address}`);
        if (record) return { host: record.name, port: record.port };
    } catch {
        // no SRV record; fall through to the default port
    }
    return { host: address, port: DEFAULT_PORT };
}

async function pingServer(address: string, port?: number): Promise<PingResult> {
    try {
        const target = await resolveAddress(address, port);
        const status = await requestStatus(target.host, target.port);
        return {
            online: true,
            version: stripCodes(status.version?.name ?? ""),
            protocol: status.version?.protocol ?? -1,
            players: {
                online: status.players?.online ?? 0,
                max: status.players?.max ?? 0,
            },
            motd: parseMotd(status.description ?? ""),
            icon: status.favicon?.startsWith("data:image/")
                ? status.favicon
                : undefined,
        };
    } catch {
        return { online: false };
    }
}

export default pingServer;
export { pingServer };
