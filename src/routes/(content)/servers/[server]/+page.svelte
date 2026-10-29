<script lang="ts">
    import type { PageData, ActionData } from "./$types";
    import InfoTable from "./InfoTable.svelte";
    import { Badge } from "$lib/components/ui/badge";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { ytEmbedUrl } from "$lib/utils/ytEmbedUrl";
    import * as Tooltip from "$lib/components/ui/tooltip";
    import ServerHoverCard from "$lib/components/ServerHoverCard.svelte";
    import ServerHistory from "./ServerHistory.svelte";
    import ServerIcon from "$lib/components/ServerIcon.svelte";
    import TagLine from "$lib/components/TagLine.svelte";
    import { tagSearchUrl } from "$lib/utils/tagSearchUrl";
    import no_icon from "$lib/assets/pack.png";
    import Expand from "~icons/nrk/fullscreen";
    import { AspectRatio } from "$lib/components/ui/aspect-ratio";
    import Banner from "$lib/components/Banner.svelte";
    import RenderMarkdown from "$lib/components/RenderMarkdown";
    import { trackViews } from "$lib/utils/trackViews";
    import { enhance } from "$app/forms";
    import { page } from "$app/state";
    import Seo from "$lib/components/Seo.svelte";
    import JsonLd from "$lib/components/JsonLd.svelte";
    import { breadcrumbs } from "$lib/utils/structuredData";
    import { plainText } from "$lib/utils/plainText";
    import {
        countryFlag,
        countryName,
        countrySearchUrl,
    } from "$lib/utils/country";
    import EyeIcon from "@lucide/svelte/icons/eye";
    import StarIcon from "@lucide/svelte/icons/star";
    import ShieldIcon from "@lucide/svelte/icons/shield";
    import GaugeIcon from "@lucide/svelte/icons/gauge";
    import VoteIcon from "@lucide/svelte/icons/vote";

    let tooltip: string = $state("Copy IP?");

    interface Props {
        data: PageData;
        form: ActionData;
    }

    let { data, form }: Props = $props();
    let { server, user, similarServers } = data;

    let isOwner = $derived(!!user?.id && user.id === server.userId);
    let canManage = $derived(data.isAdmin || isOwner);
    // ?view=visitor hides the admin/owner sections so staff can see the public page.
    let viewAsVisitor = $derived(
        page.url.searchParams.get("view") === "visitor",
    );
    let sponsorPosition = $derived(data.server.sponsorPosition);

    $effect(() => {
        trackViews("page", [data.server.id]);
    });

    let full_address =
        server.address + (server.port === 25565 ? "" : `:${server.port}`);

    async function copy_ip() {
        await navigator.clipboard.writeText(full_address ?? "69");
        tooltip = "Copied.";
        setTimeout(() => (tooltip = "Copy again?"), Math.pow(8, 4));
    }
</script>

<Seo
    title="{server.name} - Servers - Minewolf"
    description={plainText(server.description) ||
        `${server.name} is a Minecraft server listed on Minewolf.`}
/>
<JsonLd
    schemas={[
        breadcrumbs([
            ["Home", "/"],
            ["Servers", "/servers/"],
            [server.name, `/servers/${server.id}/`],
        ]),
    ]}
/>
<svelte:head>
    <meta name="keywords" content={server.tags} />
</svelte:head>

<div
    class="mx-auto flex max-w-full flex-col gap-12 text-left lg:gap-4"
    data-fit-panel
    data-panels
>
    {#if canManage && viewAsVisitor}
        <div
            class="lg:panel flex flex-wrap items-center justify-between gap-2 py-2!"
        >
            <p class="text-muted-foreground flex items-center gap-2 text-sm">
                <EyeIcon class="size-4" /> You're viewing this page as a visitor.
            </p>
            <Button variant="outline" size="sm" href={page.url.pathname}>
                Exit visitor view
            </Button>
        </div>
    {/if}

    <div
        class="flex flex-col gap-12 lg:gap-4 xl:w-6xl xl:flex-row xl:items-start"
    >
        <div
            class="flex w-2xl max-w-full flex-col gap-12 lg:gap-4 xl:w-auto xl:min-w-0 xl:flex-1"
        >
            <section class="lg:panel">
                <div class="float-right flex gap-2">
                    <Button variant="default" href="./vote/"
                        >Vote for {server.name}</Button
                    >
                </div>
                <hgroup>
                    <h1 class="font-heading text-5xl font-bold">
                        {server.name}
                    </h1>
                </hgroup>
                {#if server.description}
                    <div class="mt-3">
                        <RenderMarkdown markdown={server.description} />
                    </div>
                {/if}

                {#if server.mapUrl && server.online}
                    <div class="mt-6">
                        <iframe
                            title={`Map of ${server.name}`}
                            src={server.mapUrl}
                            frameborder="0"
                            width="100%"
                            height="400px"
                        ></iframe>
                        <div class="mt-2 flex justify-end">
                            <Button
                                variant="ghost"
                                href="./map/"
                                aria-label="Enlarge Map"><Expand /></Button
                            >
                        </div>
                    </div>
                {:else if server.video}
                    <div class="mt-6">
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
                    </div>
                {/if}

                {#if !server.addressPrivate}
                    <div class="mt-6">
                        <Tooltip.Provider>
                            <Tooltip.Root>
                                <Tooltip.Trigger>
                                    <Button variant="outline" onclick={copy_ip}>
                                        <code class="block">{full_address}</code
                                        >
                                    </Button>
                                </Tooltip.Trigger>
                                <Tooltip.Content>
                                    <p>{tooltip}</p>
                                </Tooltip.Content>
                            </Tooltip.Root>
                        </Tooltip.Provider>
                    </div>
                {/if}

                <div class="mt-4 flex gap-3">
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
                        <Banner
                            src={server.bannerUrl}
                            alt={`${server.name} Banner`}
                        />
                    </div>
                {/if}
            </section>

            <section class="lg:panel space-y-6">
                <div>
                    <h2 class="font-heading text-xl font-bold">
                        Who can join?
                    </h2>

                    <ul class="mt-2 list-outside list-disc pl-5">
                        {#if server.whitelisted}
                            <li>
                                {server.name} only allows whitelisted players to join.
                                Contact the server's staff to be added to the list.
                            </li>
                        {:else}
                            <li>
                                {server.name} is not whitelisted. Anyone can join
                                at any time.
                            </li>
                        {/if}

                        <li>
                            {server.name} allows connections from players on Minecraft
                            version(s):
                            {server.versionString}.
                        </li>

                        <li>
                            {#if server.crossplay}
                                {server.name} supports crossplay with Minecraft Bedrock
                                Edition. This means that Minecraft Java Edition and
                                Minecraft Bedrock edition players can play together
                                on this server.
                            {:else}
                                {server.name} does not support crossplay. Only Minecraft
                                Java Edition players can join.
                            {/if}
                        </li>
                    </ul>
                </div>

                <div>
                    <h2 class="font-heading text-xl font-bold">
                        Where is {server.name} based?
                    </h2>

                    <p class="mt-2">
                        {#if server.country}
                            {server.name} is hosted in
                            <Tooltip.Provider>
                                <Tooltip.Root>
                                    <!-- content first: whitespace between the parts renders inline, and
                                         before the link it merges with the space after "hosted in" -->
                                    <Tooltip.Content>
                                        Click to see more from this country
                                    </Tooltip.Content>
                                    <Tooltip.Trigger>
                                        {#snippet child({ props })}
                                            <a
                                                {...props}
                                                class="underline underline-offset-4 hover:no-underline"
                                                href={countrySearchUrl(
                                                    server.country,
                                                )}
                                                ><span aria-hidden="true"
                                                    >{countryFlag(
                                                        server.country,
                                                    )}</span
                                                >
                                                {countryName(server.country)}</a
                                            >
                                        {/snippet}
                                    </Tooltip.Trigger>
                                </Tooltip.Root>
                            </Tooltip.Provider>. Players closer to
                            {countryName(server.country)} will usually get lower ping.
                        {:else}
                            Location unknown. We haven't been able to work out
                            where {server.name} is hosted yet.
                        {/if}
                    </p>
                </div>

                <div>
                    <h2 class="font-heading text-xl font-bold">
                        Joining {server.name}
                    </h2>

                    <ol class="mt-2 list-outside list-decimal pl-5">
                        {#if server.whitelisted}
                            <li>
                                You must be whitelisted by the
                                {server.name}'s staff. First contact the
                                server's staff to be added to the list.
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
                    </ol>

                    {#if server.crossplay}
                        <p class="mt-3">
                            If you are using Minecraft Bedrock Edition, you may
                            be able to add the server to Minecraft with <a
                                class="underline"
                                href={`minecraft:?addExternalServer=${server.name}|${server.bedrockAddress || server.address}:${server.bedrockPort}`}
                                data-bedrock="minecraft:?addExternalServer=MINEWOLF|mc.minewolf.net:0"
                                >this link</a
                            >.
                        </p>
                    {/if}
                </div>

                {#if server.discord}
                    <div>
                        <h2 class="font-heading text-xl font-bold">
                            {server.name} has a Discord!
                        </h2>

                        <p class="mt-2">
                            {server.name} has a Discord! You can join it with
                            <a
                                rel="noopener nofollow"
                                target="_blank"
                                class="underline underline-offset-4 hover:no-underline"
                                href={server.discord}>this invite link</a
                            >. Remember to be respectful.
                        </p>
                    </div>
                {/if}

                {#if server.tags}
                    <div>
                        <h2 class="font-heading mb-2 text-xl font-bold">
                            {server.name}'s Tags
                        </h2>

                        <ul class="flex flex-wrap gap-1">
                            {#each server.tags.split(",") as tag}
                                <Badge href={tagSearchUrl(tag)}
                                    >{tag.trim()}</Badge
                                >
                            {/each}
                        </ul>
                    </div>
                {/if}
            </section>
        </div>

        <div class="flex w-2xl max-w-full flex-col gap-12 lg:gap-4 xl:w-96">
            {#if data.isAdmin && !viewAsVisitor}
                <section class="lg:panel">
                    <h2
                        class="font-heading mb-3 flex items-center gap-2 text-xl font-bold"
                    >
                        <ShieldIcon class="size-5" /> Admin
                    </h2>
                    {#if sponsorPosition !== null}
                        <p class="text-muted-foreground mb-3 text-sm">
                            Sponsor #{sponsorPosition} on the homepage.
                        </p>
                    {/if}
                    {#if form?.message}
                        <p class="text-destructive mb-3 text-sm">
                            {form.message}
                        </p>
                    {/if}
                    {#if form?.forcedVote}
                        <p class="text-muted-foreground mb-3 text-sm">
                            Vote recorded for {form.forcedVote}.
                        </p>
                    {/if}
                    <div class="flex flex-wrap gap-2">
                        <form
                            method="POST"
                            action={sponsorPosition === null
                                ? "?/sponsor"
                                : "?/unsponsor"}
                            use:enhance
                        >
                            <Button
                                type="submit"
                                variant={sponsorPosition === null
                                    ? "default"
                                    : "destructive"}
                            >
                                <StarIcon
                                    class={sponsorPosition === null
                                        ? undefined
                                        : "fill-current"}
                                />
                                {sponsorPosition === null
                                    ? "Make Sponsor"
                                    : "Remove Sponsor"}
                            </Button>
                        </form>
                        <Button variant="outline" href="?view=visitor">
                            <EyeIcon /> View as Visitor
                        </Button>
                    </div>
                    <form
                        method="POST"
                        action="?/forceVote"
                        use:enhance
                        class="mt-2 flex gap-2"
                    >
                        <Input
                            name="username"
                            placeholder="Minecraft username"
                            value={user?.name ?? ""}
                            required
                            minlength={2}
                            maxlength={100}
                        />
                        <Button type="submit" variant="outline">
                            <VoteIcon /> Force Vote
                        </Button>
                    </form>
                </section>
            {/if}

            {#if isOwner && !viewAsVisitor}
                <section class="lg:panel">
                    <h2 class="font-heading mb-3 text-xl font-bold">
                        Your Server
                    </h2>
                    <div class="flex flex-wrap gap-2">
                        <Button
                            variant="secondary"
                            href={`/dashboard/servers/${server.id}/`}
                        >
                            <GaugeIcon /> Dashboard
                        </Button>
                        {#if sponsorPosition === null}
                            <Button variant="outline" href="/sponsor/">
                                <StarIcon /> Become a Sponsor
                            </Button>
                        {/if}
                        <!-- Admins already have this in the admin section. -->
                        {#if !data.isAdmin}
                            <Button variant="outline" href="?view=visitor">
                                <EyeIcon /> View as Visitor
                            </Button>
                        {/if}
                    </div>
                </section>
            {/if}

            <section class="lg:panel">
                <InfoTable {server} uptime={data.uptime} />
            </section>

            {#if server.video && server.mapUrl && server.online}
                <section class="lg:panel">
                    <h2 class="font-heading mb-3 text-xl font-bold">
                        {server.name} Trailer
                    </h2>
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
                </section>
            {/if}
        </div>
    </div>

    <ServerHistory
        history={data.history}
        days={data.historyDays}
        uptime={data.uptime}
    />

    {#if similarServers.length > 0}
        <section class="lg:panel">
            <h2 class="font-heading mb-3 text-xl font-bold">Similar Servers</h2>

            <ul class="grid gap-x-4 sm:grid-cols-2 xl:grid-cols-3">
                {#each similarServers as similar (similar.id)}
                    <li>
                        <ServerHoverCard
                            server={similar}
                            highlightTags={similar.sharedTags}
                        >
                            {#snippet trigger({ props })}
                                <!-- The name link stretches over the whole tile so the tags can be their own links. -->
                                <div
                                    {...props}
                                    class="hover:bg-muted/50 relative flex h-full items-center gap-3 p-2 transition-colors"
                                >
                                    <div class="shrink-0">
                                        <ServerIcon src={similar.iconUrl} />
                                    </div>
                                    <div class="min-w-0 grow">
                                        <a
                                            href={`/servers/${similar.id}/`}
                                            class="block truncate font-bold after:absolute after:inset-0"
                                        >
                                            {similar.name}
                                        </a>
                                        <div class="relative z-10 mt-1">
                                            <TagLine
                                                tags={similar.sharedTags}
                                            />
                                        </div>
                                        <p class="mt-1 text-sm">
                                            {similar.onlinePlayers} / {similar.maxPlayers}
                                            ·
                                            {#if similar.online}
                                                <span class="text-green-500"
                                                    >Online</span
                                                >
                                            {:else}
                                                <span class="text-destructive"
                                                    >Offline</span
                                                >
                                            {/if}
                                            {#if similar.country}
                                                <Tooltip.Provider>
                                                    <Tooltip.Root>
                                                        <Tooltip.Trigger>
                                                            {#snippet child({
                                                                props,
                                                            })}
                                                                <!-- z-10 lifts it above the stretched name link, like the tags -->
                                                                <a
                                                                    {...props}
                                                                    href={countrySearchUrl(
                                                                        similar.country,
                                                                    )}
                                                                    aria-label="More servers from {countryName(
                                                                        similar.country,
                                                                    )}"
                                                                    class="relative z-10 ml-1 align-middle text-xl leading-none"
                                                                    >{countryFlag(
                                                                        similar.country,
                                                                    )}</a
                                                                >
                                                            {/snippet}
                                                        </Tooltip.Trigger>
                                                        <Tooltip.Content>
                                                            {countryName(
                                                                similar.country,
                                                            )}
                                                        </Tooltip.Content>
                                                    </Tooltip.Root>
                                                </Tooltip.Provider>
                                            {/if}
                                        </p>
                                    </div>
                                </div>
                            {/snippet}
                        </ServerHoverCard>
                    </li>
                {/each}
            </ul>
        </section>
    {/if}
</div>
