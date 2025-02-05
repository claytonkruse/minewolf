import type { MCSrvStatResponse } from "./MCSrvStatResponse";
import cache from "$lib/server/cache";

// this code needs to be tested
let queue = 0;
let recent = 0;
function throttle() {
    return new Promise<void>((resolve) => {
        function execute() {
            queue--;
            recent++;
            setTimeout(() => {
                recent--;
            }, 1000);

            resolve();
        }

        queue++;
        if (recent < 4) return execute();
        setTimeout(() => execute, queue * 1000);
    });
}

async function pingServer(ip: string): Promise<MCSrvStatResponse> {
    const reqUrl = `https://api.mcsrvstat.us/3/${ip}`;
    const cached = cache.get(reqUrl) as MCSrvStatResponse;
    if (cached) return cached;

    await throttle();
    const data: MCSrvStatResponse = await (await fetch(reqUrl)).json();

    cache.set(reqUrl, data, 600);
    return data;
}

export default pingServer;
