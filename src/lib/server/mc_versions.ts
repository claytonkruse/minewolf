
let manifest: {
    latest: {
        release: string,
        snapshot: string,
    },
    versions: Array<{
        id: string,
        type: string,
        url: string,
        time: string,
        releaseTime: string,
    }>
};
let no_update_until: number;
let versions: Array<{id: string, type: string}>;

update_mc_version_list();
function get_mc_versions() {
    return mc_versions;
}

async function update_mc_version_list() {
    if (manifest && no_update_until < Date.now()) return versions; 

    try {
       manifest = await (await fetch("https://launchermeta.mojang.com/mc/game/version_manifest.json")).json();
    } catch (error) {
        throw new Error('Could not retrieve Minecraft version manifest.');
    }
    const oneHour = 1000 * 60 * 60;
    no_update_until = Date.now() + (oneHour * 8) + Math.round(Math.random() * (oneHour * 5));

    const manifest_versions = manifest.versions;
    versions = [];
    for (const version of manifest_versions) {
        const { id, type } = version;
        versions = [...versions, { id, type }];
    }

    return versions;
}

export {
    get_mc_versions,
    update_mc_version_list
};

