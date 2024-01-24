import { prisma } from '$lib/server/prisma';

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
type Version = { id: string, type: string };
let no_update_until: number;
let versions: Array<Version>;

async function get_mc_versions() {
    if (versions && Date.now() < no_update_until) {
        return versions; 
    }
    console.log('Updating Minecraft version list.');
    
    const oneHour = 1000 * 60 * 60;
    no_update_until = Date.now() + (oneHour * 8) + Math.round(Math.random() * (oneHour * 5));

    const db_versions = await prisma.version.findMany();

    const response = await fetch("https://launchermeta.mojang.com/mc/game/version_manifest.json");
    if (!response.ok) {
        console.log('Unable to retrieve Minecraft version mainfest; returning stored versions');
        return db_versions; // If version manifest unavailibe return saved DB versions
    }
    manifest = await response.json();
    const { versions: manifest_versions } = manifest;
    versions = [];
    let new_versions: Array<Version> = [];
    for (const manifest_version of manifest_versions) {
        const { id, type } = manifest_version;
        const version: Version = { id, type };
        versions = [...versions, version];

        if (db_versions.every((db_version) => db_version.id !== version.id)) {
            new_versions = [...new_versions, version];
        }
    }

    // Not availible with sqlite
    //await prisma.version.createMany(new_versions);
    // instead:
    for (const version of new_versions) {
        //console.log('adding new version ' + Date.now());
        console.log('Found new version; adding to database.');
        await prisma.version.create({ data: version }).catch(() => '');
    }

    return versions;
}

export {
    get_mc_versions
};

