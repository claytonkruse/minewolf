type ServerPing = {
	online: boolean;
	ip: string;
	port: number;
	hostname: string;
	debug: {
		ping: boolean;
		query: boolean;
		srv: boolean;
		querymismatch: boolean;
		ipinsrv: boolean;
		animatedmotd: boolean;
		cachehit: boolean;
		cachetime: number;
		cacheexpire: number;
		apiversion: number;
	};
	version: string;
	protocol: {
		version: number;
		name: string | undefined;
	};
	icon: string;
	software: string | undefined;
	map: {
		raw: string;
		clean: string;
		html: string;
	};
	gamemode: string | undefined; // Bedrock servers only
	serverid: string | undefined; // Bedrock servers only
	eula_blocked: boolean; // Java servers only
	motd: {
		raw: [string, string];
		clean: [string, string];
		html: [string, string];
	};
	players: {
		online: number;
		max: number;
		list: Array<{ name: string; uuid: string }> | undefined;
	};
	plugins: Array<{ name: string; version: string }> | undefined;
	mods: Array<{ name: string; version: string }> | undefined;
	info:
		| {
				raw: [string, string];
				clean: [string, string];
				html: [string, string];
		  }
		| undefined;
};

let queue = 0;
let recent = 0;
function throttle() {
	return new Promise<void>((resolve) => {
		function execute() {
			recent++;
			setTimeout(() => {
				recent--;
			}, 1000);

			resolve();
		}

		if (recent < 4) return execute();
		queue++;
		setTimeout(() => execute, queue * 1000);
	});
}

async function pingServer(ip: string) {
	await throttle();
	const api_data: ServerPing = await (
		await fetch(`https://api.mcsrvstat.us/3/${ip}`)
	).json();
	return api_data;
}

export default pingServer;
