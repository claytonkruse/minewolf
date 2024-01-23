
async function getMCVersionManifest() {
    if (global.mc_version_manifest && global.mc_version_manifest_no_update_until < Date.now()) return global.mc_version_manifest;
    global.mc_version_manifest = await (await fetch("https://launchermeta.mojang.com/mc/game/version_manifest.json")).json();
    const oneHour = 1000 * 60 * 60;
    global.mc_version_mainfest_no_update_until = Date.now() + (oneHour * 8) + Math.round(Math.random() * (oneHour * 5));

    return global.mc_version_manifest;
}

async function getMCVersions() {}

export default getMCVersions;

