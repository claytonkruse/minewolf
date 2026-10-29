<script lang="ts">
    import type { PageData } from "./$types";
    import { goto } from "$app/navigation";
    import { page as pageState } from "$app/state";
    import { ServerList } from "$lib/components/ServerList";
    import Pagination, { pageSuffix } from "$lib/components/Pagination.svelte";
    import Seo from "$lib/components/Seo.svelte";
    import { trackViews } from "$lib/utils/trackViews";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Checkbox } from "$lib/components/ui/checkbox";
    import * as Select from "$lib/components/ui/select";
    import * as Empty from "$lib/components/ui/empty";
    import { SORTS, SORT_LABELS, type Sort } from "$lib/serverSearch";
    import { countryFlag, countryName } from "$lib/utils/country";
    import SearchIcon from "@lucide/svelte/icons/search";
    import ShuffleIcon from "@lucide/svelte/icons/shuffle";
    import SearchXIcon from "@lucide/svelte/icons/search-x";

    let { data }: { data: PageData } = $props();
    let page = $derived(data.page);
    // The random button picks from all results, so pass the filters along.
    // Page and sort don't change which servers match.
    let randomHref = $derived.by(() => {
        const params = new URLSearchParams(pageState.url.search);
        params.delete("page");
        params.delete("sort");
        const search = params.toString();
        return `/servers/random${search ? `?${search}` : ""}`;
    });
    let servers = $derived(data.servers);
    let tag = $derived(data.tag);

    // Form state. Each value can be edited locally and resets to the URL's
    // value on every navigation.
    let name = $derived(data.name ?? "");
    let tagValue = $derived(data.tag?.toLowerCase() ?? "");
    let version = $derived(data.version ?? "");
    let country = $derived(data.country ?? "");
    let sort = $derived<string>(data.sort);
    let offline = $derived(data.offline);
    let crossplay = $derived(data.crossplay);
    let open = $derived(data.open);

    let sortOptions = $derived(
        SORTS.filter((s) => s !== "relevance" || data.name),
    );
    let tagLabel = $derived(
        data.tagOptions.find((t) => t.label.toLowerCase() === tagValue)
            ?.label ?? data.tag,
    );
    let hasFilters = $derived(
        !!(
            data.name ||
            data.tag ||
            data.version ||
            data.country ||
            data.offline ||
            data.crossplay ||
            data.open ||
            data.sort !== data.defaultSort
        ),
    );

    // Builds the URL from the form, leaving out defaults so links stay short.
    // Changing any filter goes back to page 1.
    function apply() {
        const params = new URLSearchParams();
        const query = name.trim();
        if (query) params.set("name", query);
        if (tagValue) params.set("tag", tagLabel ?? tagValue);
        if (version) params.set("version", version);
        if (country) params.set("country", country);
        if (offline) params.set("offline", "1");
        if (crossplay) params.set("crossplay", "1");
        if (open) params.set("open", "1");
        const defaultSort = query ? "relevance" : "rank";
        if (sort !== defaultSort && (sort !== "relevance" || query))
            params.set("sort", sort);
        const search = params.toString();
        goto(`/servers/${search ? `?${search}` : ""}`, { keepFocus: true });
    }

    $effect(() => {
        trackViews(
            "listing",
            servers.map((server) => server.id),
        );
    });
</script>

<!-- Searches and filter combos are endless near-duplicates, so only plain
     tag pages get indexed. -->
<Seo
    title="{tag
        ? `${tag[0].toUpperCase() + tag.slice(1)} Minecraft Servers`
        : 'Search Minecraft Servers'}{pageSuffix(page)} - Minewolf"
    description={tag
        ? `Browse Minecraft servers tagged ${tag} on Minewolf.`
        : "Search Minecraft servers by name, tag, version and country, and filter by online status, crossplay and whitelist."}
    noindex={!!(
        data.name ||
        data.version ||
        data.country ||
        data.offline ||
        data.crossplay ||
        data.open ||
        data.sort !== data.defaultSort
    )}
/>

<h1 class="text-4xl font-bold">Search Minecraft Servers</h1>

<form
    action="/servers/"
    method="GET"
    role="search"
    class="mx-auto mt-6 flex max-w-4xl flex-col gap-3"
    onsubmit={(e) => {
        e.preventDefault();
        apply();
    }}
>
    <div class="flex gap-2">
        <Input
            type="search"
            name="name"
            bind:value={name}
            placeholder="Search by name, address, tag or description"
            aria-label="Search servers"
        />
        <Button type="submit">
            <SearchIcon data-icon="inline-start" /> Search
        </Button>
    </div>

    <div class="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <Select.Root type="single" bind:value={tagValue} onValueChange={apply}>
            <Select.Trigger class="w-44" aria-label="Tag">
                {tagValue ? tagLabel : "Any tag"}
            </Select.Trigger>
            <Select.Content>
                <Select.Group>
                    <Select.Item value="" label="Any tag" />
                    {#each data.tagOptions as option (option.label)}
                        <Select.Item
                            value={option.label.toLowerCase()}
                            label={option.label}
                        >
                            {option.label}
                            <span class="text-muted-foreground ml-auto"
                                >{option.count}</span
                            >
                        </Select.Item>
                    {/each}
                </Select.Group>
            </Select.Content>
        </Select.Root>

        <Select.Root type="single" bind:value={version} onValueChange={apply}>
            <Select.Trigger class="w-36" aria-label="Version">
                {version || "Any version"}
            </Select.Trigger>
            <Select.Content>
                <Select.Group>
                    <Select.Item value="" label="Any version" />
                    {#each data.versionOptions as option (option)}
                        <Select.Item value={option} label={option} />
                    {/each}
                </Select.Group>
            </Select.Content>
        </Select.Root>

        <Select.Root type="single" bind:value={country} onValueChange={apply}>
            <Select.Trigger class="w-44" aria-label="Country">
                {#if country}
                    <span aria-hidden="true">{countryFlag(country)}</span>
                    {countryName(country)}
                {:else}
                    Any country
                {/if}
            </Select.Trigger>
            <Select.Content>
                <Select.Group>
                    <Select.Item value="" label="Any country" />
                    {#each data.countryOptions as option (option.code)}
                        <Select.Item
                            value={option.code}
                            label={countryName(option.code)}
                        >
                            <span aria-hidden="true"
                                >{countryFlag(option.code)}</span
                            >
                            {countryName(option.code)}
                            <span class="text-muted-foreground ml-auto"
                                >{option.count}</span
                            >
                        </Select.Item>
                    {/each}
                </Select.Group>
            </Select.Content>
        </Select.Root>

        <Select.Root type="single" bind:value={sort} onValueChange={apply}>
            <Select.Trigger class="w-40" aria-label="Sort by">
                Sort: {SORT_LABELS[sort as Sort]}
            </Select.Trigger>
            <Select.Content>
                <Select.Group>
                    {#each sortOptions as option (option)}
                        <Select.Item
                            value={option}
                            label={SORT_LABELS[option]}
                        />
                    {/each}
                </Select.Group>
            </Select.Content>
        </Select.Root>

        <Label class="flex items-center gap-2">
            <Checkbox bind:checked={offline} onCheckedChange={apply} />
            Show offline
        </Label>
        <Label class="flex items-center gap-2">
            <Checkbox bind:checked={crossplay} onCheckedChange={apply} />
            Crossplay
        </Label>
        <Label class="flex items-center gap-2">
            <Checkbox bind:checked={open} onCheckedChange={apply} />
            No whitelist
        </Label>
    </div>

    <div class="flex flex-wrap items-center justify-center gap-2 text-sm">
        <span class="text-muted-foreground">
            {data.total.toLocaleString()}
            {data.total === 1 ? "server" : "servers"}
        </span>
        {#if hasFilters}
            <Button variant="ghost" size="sm" href="/servers/">
                Clear filters
            </Button>
        {/if}
        <Button
            variant="outline"
            size="sm"
            href={randomHref}
            data-sveltekit-reload
        >
            <ShuffleIcon data-icon="inline-start" /> Random server
        </Button>
    </div>
</form>

{#if servers.length > 0}
    <Pagination class="mt-6" {page} pageCount={data.pageCount} />

    <div class="mt-4">
        <ServerList {servers} />
    </div>

    <Pagination class="mt-4" {page} pageCount={data.pageCount} />
{:else}
    <Empty.Root class="mt-6">
        <Empty.Header>
            <Empty.Media variant="icon">
                <SearchXIcon />
            </Empty.Media>
            <Empty.Title>No servers found</Empty.Title>
            <Empty.Description>
                Try a different search or fewer filters.
            </Empty.Description>
        </Empty.Header>
        <Empty.Content>
            <Button variant="outline" href="/servers/">Clear filters</Button>
        </Empty.Content>
    </Empty.Root>
{/if}
