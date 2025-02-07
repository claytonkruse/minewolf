<script lang="ts">
    import type { PageData } from "./$types";
    import InfoTable from "./InfoTable.svelte";
    import { Badge } from "$lib/components/ui/badge";
    import { Button } from "$lib/components/ui/button";
    import { ytEmbedUrl } from "$lib/utils/ytEmbedUrl";
    import * as Tooltip from "$lib/components/ui/tooltip";
    import ServerIcon from "$lib/components/ServerIcon.svelte";
    import no_icon from "$lib/images/pack.png";
    import Expand from "~icons/nrk/fullscreen";
    import { AspectRatio } from "$lib/components/ui/aspect-ratio";
    import Banner from "$lib/components/Banner.svelte";

    let tooltip: string = $state("Copy IP?");

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();
    let { server, user } = data;

    let full_address =
        server.address + (server.port === 25565 ? "" : `:${server.port}`);

    async function copy_ip() {
        // await navigator.clipboard.writeText(full_ip ?? "69");
        tooltip = "Copied.";
        setTimeout(() => (tooltip = "Copy again?"), Math.pow(8, 4));
    }
</script>

<div class="lg:w-3xl m-auto flex w-fit justify-between gap-8 text-left">
    <div>
        <div class="float-right flex gap-2">
            <Button variant="default" href="./vote/"
                >Vote for {server.name}</Button
            >
            {#if user?.id && user.id === server.userId}
                <Button
                    variant="secondary"
                    href={`/dashboard/servers/${server.id}/`}>Dashboard</Button
                >
            {/if}
        </div>
        <hgroup>
            <h1 class="text-5xl font-bold">{server.name}</h1>
        </hgroup>
        {#if server.description}
            <p>{server.description}</p>
        {/if}
        <br />

        {#if server.mapUrl && server.online}
            <iframe
                title={`Map of ${server.name}`}
                src={server.mapUrl}
                frameborder="0"
                width="100%"
                height="400px"
            ></iframe>
            <Button
                variant="ghost"
                class="float-right mb-4 mt-2"
                href="./map/"
                aria-label="Enlarge Map"><Expand /></Button
            >
            <br />
        {:else if server.video}
            <iframe
                width="100%"
                height="400px"
                src={ytEmbedUrl(server.video)}
                title={`${server.name} Trailer Video`}
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen
            ></iframe>
        {/if}

        <br />

        <div>
            <Tooltip.Provider>
                <Tooltip.Root>
                    <Tooltip.Trigger>
                        <Button variant="outline" onclick={copy_ip}>
                            <code class="block">{full_address}</code>
                        </Button>
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                        <p>{tooltip}</p>
                    </Tooltip.Content>
                </Tooltip.Root>
            </Tooltip.Provider>
        </div>

        <div class="mt-2 flex gap-3">
            {#if server.iconUrl}
                <ServerIcon src={server.iconUrl} />
            {:else}
                <ServerIcon src={no_icon} />
            {/if}
            <span
                class="inline-block h-[64px] max-w-full overflow-hidden text-sm"
            >
                <p>{server.name}</p>
                {@html server.htmlMotd}
            </span>
        </div>

        {#if server.bannerUrl}
            <div class="mt-4">
                <Banner src={server.bannerUrl} alt={`${server.name} Banner`} />
            </div>
        {/if}

        <br />

        <section>
            <h3 class="text-xl font-bold">Who can join?</h3>

            <ul class="list-inside list-disc">
                {#if server.whitelisted}
                    <li>
                        {server.name} only allows whitelisted players to join. Contact
                        the server's staff to be added to the list.
                    </li>
                {:else}
                    <li>
                        {server.name} is not whitelsited. Anyone can join at any
                        time.
                    </li>
                {/if}

                <li>
                    {server.name} allows connections from players on Minecraft version(s):
                    {server.versionString}.
                </li>

                <li>
                    {#if server.crossplay}
                        {server.name} supports crossplay with Minecraft Bedrock Edition.
                        This means that Minecraft Java Edition and Minecraft Bedrock
                        edition players can play together on this server.
                    {:else}
                        {server.name} does not support crossplay. Only Minecraft
                        Java Edition players can join.
                    {/if}
                </li>
            </ul>
        </section>
        <br />

        <section>
            <h3 class="text-xl font-bold">Joining {server.name}</h3>

            <ol class="list-inside list-decimal">
                {#if !server.whitelisted}
                    <li>
                        You must be whitelisted by the
                        {server.name}'s staff. First contact the server's staff
                        to be added to the list.
                    </li>
                {/if}
                <li>
                    You must be using Minecraft Java Edition version(s) {server.versionString}{server.crossplay
                        ? " or Minecraft Bedrock Edition."
                        : "."}
                </li>
                <li>
                    Copy the server address
                    {#if server.port !== 25565}
                        <strong>and port</strong>
                    {/if} into Minecraft, and press join!
                </li>
                <br />

                {#if server.crossplay}
                    <p>
                        If you are using Minecraft Bedrock Edition, you may be
                        able to add the server to Minecraft with <a
                            class="underline"
                            href={`minecraft:?addExternalServer=${server.name}|${server.bedrockAddress || server.address}:${server.bedrockPort}`}
                            data-bedrock="minecraft:?addExternalServer=MINEWOLF|mc.minewolf.net:0"
                            >this link</a
                        >.
                    </p>
                {/if}
            </ol>
        </section>

        <section>
            <h3 class="text-xl font-bold">
                {server.name} has a Discord!
            </h3>

            <p>
                {server.name} has a Discord! You can join it with
                <a
                    rel="noopener nofollow"
                    target="_blank"
                    class="underline"
                    href={server.discord}>this invite link</a
                >. Remember to be respectful.
            </p>
        </section>

        <br />

        {#if server.tags}
            <section>
                <h3 class="mb-2 text-xl font-bold">{server.name}'s Tags</h3>

                <ul class="flex gap-1">
                    {#each server.tags.split(",") as tag}
                        <Badge>{tag.trim()}</Badge>
                    {/each}
                </ul>
            </section>
        {/if}

        <br />
        <br />
        <br />
        <br />
        <br />
    </div>

    <div>
        <InfoTable {server} />
        {#if server.video}
            <br />

            <h3 class="mb-2 text-lg font-bold">{server.name} Trailer</h3>
            <AspectRatio ratio={16 / 9}>
                <iframe
                    width="100%"
                    height="100%"
                    src={ytEmbedUrl(server.video)}
                    title={`${server.name} Trailer Video`}
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerpolicy="strict-origin-when-cross-origin"
                    allowfullscreen
                ></iframe>
            </AspectRatio>
        {/if}
    </div>
</div>
