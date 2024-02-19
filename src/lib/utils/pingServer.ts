import type MCSrvStatResponse from './MCSrvStatResponse';

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

async function pingServer(ip: string) {
	await throttle();
	const data: MCSrvStatResponse = await (
		await fetch(`https://api.mcsrvstat.us/3/${ip}`)
	).json();

	return data;
}

export default pingServer;
