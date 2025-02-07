import type { MCSrvStatResponse } from "./MCSrvStatResponse";

async function pingServer(ip: string): Promise<MCSrvStatResponse> {
    const reqUrl = `https://api.mcsrvstat.us/3/${ip}`;
    const data: MCSrvStatResponse = await (await fetch(reqUrl)).json();
    return data;
}

export default pingServer;
