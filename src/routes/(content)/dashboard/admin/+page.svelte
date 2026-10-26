<script lang="ts">
    import Seo from "$lib/components/Seo.svelte";
    import { Button } from "$lib/components/ui/button";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb";
    import * as Card from "$lib/components/ui/card";
    import * as Table from "$lib/components/ui/table";
    import { Input } from "$lib/components/ui/input";
    import { enhance } from "$app/forms";
    import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
    import ArrowDownIcon from "@lucide/svelte/icons/arrow-down";
    import type { PageData, ActionData } from "./$types";

    let { data, form }: { data: PageData; form: ActionData } = $props();
    const { stats, roles } = data;
    let sponsors = $derived(data.sponsors);
    let sponsorQuery = $derived(data.sponsorQuery);
    let sponsorResults = $derived(data.sponsorResults);
</script>

<Seo
    title="Admin Dashboard - Minewolf"
    description="Minewolf site administration."
    noindex
/>

<Breadcrumb.Root>
    <Breadcrumb.List>
        <Breadcrumb.Item>
            <Breadcrumb.Link href="/dashboard/">Dashboard</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>
            <Breadcrumb.Page>Admin</Breadcrumb.Page>
        </Breadcrumb.Item>
    </Breadcrumb.List>
</Breadcrumb.Root>

<div class="m-auto max-w-3xl">
    <h1 class="text-2xl font-bold">Admin Dashboard</h1>

    <br />

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {#each [["Users", stats.users], ["Servers", stats.servers], ["Votes", stats.votes]] as [label, value]}
            <Card.Root>
                <Card.Header>
                    <Card.Description>{label}</Card.Description>
                    <Card.Title class="text-3xl">{value}</Card.Title>
                </Card.Header>
            </Card.Root>
        {/each}
    </div>

    <br />

    <h2 class="mb-2 text-xl font-bold">Roles</h2>
    <Table.Root class="text-left">
        <Table.Header>
            <Table.Row>
                <Table.Head>User</Table.Head>
                <Table.Head>Discord ID</Table.Head>
                <Table.Head>Role</Table.Head>
                <Table.Head>Granted</Table.Head>
            </Table.Row>
        </Table.Header>
        <Table.Body>
            {#each roles as r}
                <Table.Row>
                    <Table.Cell>{r.user.name}</Table.Cell>
                    <Table.Cell class="font-mono">{r.user.discordId}</Table.Cell
                    >
                    <Table.Cell>{r.role}</Table.Cell>
                    <Table.Cell>{r.createdAt.toLocaleDateString()}</Table.Cell>
                </Table.Row>
            {/each}
        </Table.Body>
    </Table.Root>

    <br />

    <h2 class="mb-2 text-xl font-bold">Sponsors</h2>
    <p class="text-muted-foreground mb-2 text-sm">
        Sponsor servers are shown on the homepage in this order.
    </p>
    {#if form?.message}
        <p class="text-destructive mb-2 text-sm">{form.message}</p>
    {/if}
    <Table.Root class="text-left">
        <Table.Header>
            <Table.Row>
                <Table.Head>#</Table.Head>
                <Table.Head>Server</Table.Head>
                <Table.Head class="text-right">Actions</Table.Head>
            </Table.Row>
        </Table.Header>
        <Table.Body>
            {#each sponsors as sponsor, i (sponsor.id)}
                <Table.Row>
                    <Table.Cell>{i + 1}</Table.Cell>
                    <Table.Cell>
                        <a href={`/servers/${sponsor.id}/`}>{sponsor.name}</a>
                    </Table.Cell>
                    <Table.Cell>
                        <form
                            method="POST"
                            class="flex justify-end gap-1"
                            use:enhance
                        >
                            <input
                                type="hidden"
                                name="serverId"
                                value={sponsor.id}
                            />
                            <Button
                                type="submit"
                                variant="outline"
                                size="icon-sm"
                                formaction="?/moveSponsor"
                                name="direction"
                                value="up"
                                disabled={i === 0}
                                aria-label="Move up"
                            >
                                <ArrowUpIcon />
                            </Button>
                            <Button
                                type="submit"
                                variant="outline"
                                size="icon-sm"
                                formaction="?/moveSponsor"
                                name="direction"
                                value="down"
                                disabled={i === sponsors.length - 1}
                                aria-label="Move down"
                            >
                                <ArrowDownIcon />
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                size="sm"
                                formaction="?/removeSponsor"
                            >
                                Remove
                            </Button>
                        </form>
                    </Table.Cell>
                </Table.Row>
            {:else}
                <Table.Row>
                    <Table.Cell colspan={3} class="text-muted-foreground">
                        No sponsors.
                    </Table.Cell>
                </Table.Row>
            {/each}
        </Table.Body>
    </Table.Root>

    <h3 class="mt-4 mb-2 font-bold">Add a Sponsor</h3>
    <form method="GET" class="flex gap-2" data-sveltekit-keepfocus>
        <Input
            type="search"
            name="q"
            value={sponsorQuery}
            placeholder="Search servers"
            aria-label="Search servers to add as sponsors"
        />
        <Button type="submit">Search</Button>
    </form>

    {#if sponsorQuery}
        <Table.Root class="mt-2 text-left">
            <Table.Body>
                {#each sponsorResults as server (server.id)}
                    <Table.Row>
                        <Table.Cell>
                            <a href={`/servers/${server.id}/`}>{server.name}</a>
                        </Table.Cell>
                        <Table.Cell class="text-muted-foreground font-mono">
                            {server.address ?? "Private address"}
                        </Table.Cell>
                        <Table.Cell>
                            <form
                                method="POST"
                                action="?/addSponsor"
                                class="flex justify-end"
                                use:enhance
                            >
                                <input
                                    type="hidden"
                                    name="serverId"
                                    value={server.id}
                                />
                                <Button type="submit" size="sm">Add</Button>
                            </form>
                        </Table.Cell>
                    </Table.Row>
                {:else}
                    <Table.Row>
                        <Table.Cell class="text-muted-foreground">
                            No servers found that aren't already sponsors.
                        </Table.Cell>
                    </Table.Row>
                {/each}
            </Table.Body>
        </Table.Root>
    {/if}

    <br />
    <Button variant="outline" href="..">Go Back</Button>
</div>
