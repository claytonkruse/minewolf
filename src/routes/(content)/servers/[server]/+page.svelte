<script lang="ts">
    import type { PageData, ActionData } from "./$types";
    import InfoTable from "./InfoTable.svelte";
    import { Badge } from "$lib/components/ui/badge";
    import { Button } from "$lib/components/ui/button";
    import { ytEmbedUrl } from "$lib/utils/ytEmbedUrl";
    import * as Tooltip from "$lib/components/ui/tooltip";
    import * as HoverCard from "$lib/components/ui/hover-card";
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
    import EyeIcon from "@lucide/svelte/icons/eye";
    import StarIcon from "@lucide/svelte/icons/star";
    import ShieldIcon from "@lucide/svelte/icons/shield";
    import GaugeIcon from "@lucide/svelte/icons/gauge";

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

<svelte:head>
    <title>{server.name} - Servers - Minewolf</title>
    <meta name="description" content={server.description.replaceAll("*", "")} />
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

    <div class="flex flex-col gap-12 lg:gap-4 xl:w-6xl xl:flex-row xl:items-start">
        <div class="flex w-2xl max-w-full flex-col gap-12 lg:gap-4 xl:w-auto xl:min-w-0 xl:flex-1">
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

                    <ul class="mt-2 list-inside list-disc">
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
                        Joining {server.name}
                    </h2>

                    <ol class="mt-2 list-inside list-decimal">
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
                <InfoTable {server} />
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

    {#if similarServers.length > 0}
        <section class="lg:panel">
            <h2 class="font-heading mb-3 text-xl font-bold">Similar Servers</h2>

            <ul class="grid gap-x-4 sm:grid-cols-2 xl:grid-cols-3">
                {#each similarServers as similar (similar.id)}
                    <li>
                        <HoverCard.Root openDelay={300}>
                            <HoverCard.Trigger>
                                {#snippet child({ props })}
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
                                                    <span
                                                        class="text-destructive"
                                                        >Offline</span
                                                    >
                                                {/if}
                                            </p>
                                        </div>
                                    </div>
                                {/snippet}
                            </HoverCard.Trigger>
                            <HoverCard.Content
                                class="w-80 p-0 text-left"
                                side="top"
                            >
                                {#if similar.bannerUrl}
                                    <img
                                        src={similar.bannerUrl}
                                        alt={`${similar.name} Banner`}
                                        class="aspect-[468/60] w-full object-cover"
                                    />
                                {:else if similar.htmlMotd}
                                    <div
                                        class="bg-muted max-h-16 overflow-hidden p-2"
                                    >
                                        {@html similar.htmlMotd}
                                    </div>
                                {/if}
                                <div class="space-y-3 p-3">
                                    <div
                                        class="flex items-baseline justify-between gap-2"
                                    >
                                        <p
                                            class="font-heading truncate text-base font-bold"
                                        >
                                            {similar.name}
                                        </p>
                                        <span
                                            class="text-muted-foreground shrink-0"
                                        >
                                            {similar.rank
                                                ? `#${similar.rank}`
                                                : "Unranked"}
                                        </span>
                                    </div>

                                    {#if similar.description}
                                        <p
                                            class="text-muted-foreground line-clamp-3"
                                        >
                                            {similar.description.replaceAll(
                                                "*",
                                                "",
                                            )}
                                        </p>
                                    {/if}

                                    <dl
                                        class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1"
                                    >
                                        <dt class="text-muted-foreground">
                                            Status
                                        </dt>
                                        <dd>
                                            {#if similar.online}
                                                <span class="text-green-500"
                                                    >Online</span
                                                >
                                            {:else}
                                                <span class="text-destructive"
                                                    >Offline</span
                                                >
                                            {/if}
                                        </dd>
                                        <dt class="text-muted-foreground">
                                            Players
                                        </dt>
                                        <dd>
                                            {similar.onlinePlayers} / {similar.maxPlayers}
                                        </dd>
                                        <dt class="text-muted-foreground">
                                            Version
                                        </dt>
                                        <dd>{similar.versionString}</dd>
                                        <dt class="text-muted-foreground">
                                            Whitelisted
                                        </dt>
                                        <dd>
                                            {similar.whitelisted ? "Yes" : "No"}
                                        </dd>
                                        <dt class="text-muted-foreground">
                                            Crossplay
                                        </dt>
                                        <dd>
                                            {similar.crossplay ? "Yes" : "No"}
                                        </dd>
                                    </dl>

                                    {#if similar.allTags.length > 0}
                                        <div class="flex flex-wrap gap-1">
                                            {#each similar.allTags as tag}
                                                <Badge
                                                    variant={similar.sharedTags.includes(
                                                        tag,
                                                    )
                                                        ? "default"
                                                        : "secondary"}
                                                    href={tagSearchUrl(tag)}
                                                    >{tag}</Badge
                                                >
                                            {/each}
                                        </div>
                                    {/if}
                                </div>
                            </HoverCard.Content>
                        </HoverCard.Root>
                    </li>
                {/each}
            </ul>
        </section>
    {/if}
</div>
