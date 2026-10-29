<script lang="ts">
    import type { Snippet } from "svelte";
    import type { Server } from "$lib/server/db/drizzle/schema";
    import * as HoverCard from "$lib/components/ui/hover-card";
    import { Badge } from "$lib/components/ui/badge";
    import { tagSearchUrl } from "$lib/utils/tagSearchUrl";
    import {
        countryFlag,
        countryName,
        countrySearchUrl,
    } from "$lib/utils/country";

    type Props = {
        server: Pick<
            Server,
            | "name"
            | "rank"
            | "description"
            | "online"
            | "onlinePlayers"
            | "maxPlayers"
            | "versionString"
            | "whitelisted"
            | "crossplay"
            | "bannerUrl"
            | "htmlMotd"
            | "tags"
            | "country"
        >;
        // Tags drawn with the primary badge style, e.g. tags shared with another server.
        highlightTags?: string[];
        trigger: Snippet<[{ props: Record<string, unknown> }]>;
    };

    let { server, highlightTags = [], trigger }: Props = $props();

    let tags = $derived(
        server.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
    );
</script>

<HoverCard.Root openDelay={300}>
    <HoverCard.Trigger>
        {#snippet child({ props })}
            {@render trigger({ props })}
        {/snippet}
    </HoverCard.Trigger>
    <HoverCard.Content class="w-80 p-0 text-left" side="top">
        {#if server.bannerUrl}
            <img
                src={server.bannerUrl}
                alt={`${server.name} Banner`}
                class="aspect-[468/60] w-full object-cover"
            />
        {:else if server.htmlMotd}
            <div class="bg-muted max-h-16 overflow-hidden p-2">
                {@html server.htmlMotd}
            </div>
        {/if}
        <div class="space-y-3 p-3">
            <div class="flex items-baseline justify-between gap-2">
                <p class="font-heading truncate text-base font-bold">
                    {server.name}
                </p>
                <span class="text-muted-foreground shrink-0">
                    {server.rank ? `#${server.rank}` : "Unranked"}
                </span>
            </div>

            {#if server.description}
                <p class="text-muted-foreground line-clamp-3">
                    {server.description.replaceAll("*", "")}
                </p>
            {/if}

            <dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                <dt class="text-muted-foreground">Status</dt>
                <dd>
                    {#if server.online}
                        <span class="text-green-500">Online</span>
                    {:else}
                        <span class="text-destructive">Offline</span>
                    {/if}
                </dd>
                <dt class="text-muted-foreground">Players</dt>
                <dd>{server.onlinePlayers} / {server.maxPlayers}</dd>
                <dt class="text-muted-foreground">Version</dt>
                <dd>{server.versionString}</dd>
                <dt class="text-muted-foreground">Country</dt>
                <dd>
                    {#if server.country}
                        <a href={countrySearchUrl(server.country)}>
                            <span aria-hidden="true"
                                >{countryFlag(server.country)}</span
                            >
                            {countryName(server.country)}
                        </a>
                    {:else}
                        <span class="text-muted-foreground"
                            >Location unknown</span
                        >
                    {/if}
                </dd>
                <dt class="text-muted-foreground">Whitelisted</dt>
                <dd>{server.whitelisted ? "Yes" : "No"}</dd>
                <dt class="text-muted-foreground">Crossplay</dt>
                <dd>{server.crossplay ? "Yes" : "No"}</dd>
            </dl>

            {#if tags.length > 0}
                <div class="flex flex-wrap gap-1">
                    {#each tags as tag}
                        <Badge
                            variant={highlightTags.includes(tag)
                                ? "default"
                                : "secondary"}
                            href={tagSearchUrl(tag)}>{tag}</Badge
                        >
                    {/each}
                </div>
            {/if}
        </div>
    </HoverCard.Content>
</HoverCard.Root>
