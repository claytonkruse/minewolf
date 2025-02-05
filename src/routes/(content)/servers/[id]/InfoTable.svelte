<script lang="ts">
    import Banner from "$lib/components/Banner.svelte";
    import {
        Table,
        TableCell,
        TableRow,
        TableHead,
        TableBody,
    } from "$lib/components/ui/table";

    let { server } = $props();
</script>

<div class="min-w-72 max-w-72">
    {#if server.bannerUrl}
        <img src={server.bannerUrl} alt="" class="w-full" />
    {/if}
    <Table class="w-full overflow-x-hidden">
        <TableBody>
            <TableRow>
                <TableHead>Rank</TableHead>
                <TableCell>
                    {#if server.rank === 0}
                        <span>?</span>
                        <small class="ml-1 text-muted-foreground"
                            >(unranked)</small
                        >
                    {:else}
                        {server.rank}
                    {/if}
                </TableCell>
            </TableRow>

            <TableRow>
                <TableHead>Name</TableHead>
                <TableCell>{server.name}</TableCell>
            </TableRow>

            <TableRow>
                <TableHead>Status</TableHead>
                <TableCell>
                    {#if server.online}
                        <span class="text-green-500">Online</span>
                    {:else}
                        <span class="text-destructive">Offline</span>
                    {/if}
                </TableCell>
            </TableRow>

            <TableRow>
                <TableHead>Whitelisted</TableHead>
                <TableCell>
                    {server.whitelisted ? "Yes" : "No"}
                </TableCell>
            </TableRow>

            <TableRow>
                <TableHead>Last Pinged</TableHead>
                <TableCell>
                    {server.lastPingAt.toTimeString()}
                </TableCell>
            </TableRow>

            <TableRow>
                <TableHead>Uptime</TableHead>
                <TableCell>99%</TableCell>
            </TableRow>

            <!-- <TableRow>
                <TableHead>Votes</TableHead>
                <TableCell>-100</TableCell>
            </TableRow>

            <TableRow>
                <TableHead>Ratings</TableHead>
                <TableCell>-100</TableCell>
            </TableRow> -->

            <!-- <TableRow>
                    <TableHead>Location</TableHead>
                    <TableCell>US</TableCell>
                </TableRow> -->

            <TableRow>
                <TableHead>Players</TableHead>
                <TableCell>
                    {server.onlinePlayers}/{server.maxPlayers}
                </TableCell>
            </TableRow>

            <TableRow>
                <TableHead>Version</TableHead>
                <TableCell>{server.versionString}</TableCell>
            </TableRow>

            <TableRow>
                <TableHead>Address</TableHead>
                <TableCell>{server.address}</TableCell>
            </TableRow>

            {#if server.port !== 25565}
                <TableRow>
                    <TableHead>Port</TableHead>
                    <TableCell>{server.port}</TableCell>
                </TableRow>
            {/if}

            {#if server.bedrockAddress}
                <TableRow>
                    <TableHead>Bedrock Address</TableHead>
                    <TableCell>{server.address}</TableCell>
                </TableRow>
            {/if}

            {#if server.bedrockPort !== 19132}
                <TableRow>
                    <TableHead>Bedrock Port</TableHead>
                    <TableCell>{server.bedrockPort}</TableCell>
                </TableRow>
            {/if}

            <!-- <TableRow>
                <TableHead>Owner</TableHead>
                <TableCell>notch</TableCell>
            </TableRow> -->

            {#if server.website}
                <TableRow>
                    <TableHead>Website</TableHead>
                    <TableCell>
                        <a
                            rel="noopener nofollow"
                            target="_blank"
                            href={server.website}>{server.website}</a
                        >
                    </TableCell>
                </TableRow>
            {/if}

            {#if server.discord}
                <TableRow>
                    <TableHead>Discord</TableHead>
                    <TableCell>
                        <a
                            rel="noopener nofollow"
                            target="_blank"
                            href={server.discord}>{server.discord}</a
                        >
                    </TableCell>
                </TableRow>
            {/if}

            <TableRow>
                <TableHead>Submitted</TableHead>
                <TableCell>{server.createdAt.toDateString()}</TableCell>
            </TableRow>
        </TableBody>
    </Table>
</div>
