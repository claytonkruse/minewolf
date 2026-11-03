<script lang="ts">
    import Seo from "$lib/components/Seo.svelte";
    import { Badge } from "$lib/components/ui/badge";
    import { Button } from "$lib/components/ui/button";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb";
    import * as Table from "$lib/components/ui/table";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
    let member = $derived(data.member);
    let servers = $derived(data.servers);
</script>

<Seo
    title="{member.name} - Admin Dashboard - Minewolf"
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
            <Breadcrumb.Link href="/dashboard/admin/">Admin</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>
            <Breadcrumb.Page>{member.name}</Breadcrumb.Page>
        </Breadcrumb.Item>
    </Breadcrumb.List>
</Breadcrumb.Root>

<div class="m-auto max-w-3xl">
    <h1 class="flex flex-wrap items-center gap-2 text-2xl font-bold">
        {member.name}
        {#each member.roles as r}
            <Badge variant="secondary">{r.role}</Badge>
        {/each}
    </h1>

    <dl class="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <dt class="text-muted-foreground">Discord ID</dt>
        <dd class="font-mono">{member.discordId}</dd>
        <dt class="text-muted-foreground">Email</dt>
        <dd>{member.email}</dd>
        <dt class="text-muted-foreground">Joined</dt>
        <dd>{member.createdAt.toLocaleString()}</dd>
        <dt class="text-muted-foreground">Last online</dt>
        <dd>{member.lastOnlineAt.toLocaleString()}</dd>
    </dl>

    <br />

    <h2 class="mb-2 text-xl font-bold">Servers</h2>
    <Table.Root class="text-left">
        <Table.Header>
            <Table.Row>
                <Table.Head>Server</Table.Head>
                <Table.Head>Address</Table.Head>
                <Table.Head>Status</Table.Head>
                <Table.Head>Rank</Table.Head>
                <Table.Head>Votes</Table.Head>
                <Table.Head>Listed</Table.Head>
            </Table.Row>
        </Table.Header>
        <Table.Body>
            {#each servers as server (server.id)}
                <Table.Row>
                    <Table.Cell>
                        <a href={`/servers/${server.id}/`}>{server.name}</a>
                        {#if server.sponsorPosition !== null}
                            <Badge variant="outline">Sponsor</Badge>
                        {/if}
                    </Table.Cell>
                    <Table.Cell class="font-mono">
                        {server.address}{server.port === 25565
                            ? ""
                            : `:${server.port}`}
                    </Table.Cell>
                    <Table.Cell
                        >{server.online ? "Online" : "Offline"}</Table.Cell
                    >
                    <Table.Cell>{server.rank || "—"}</Table.Cell>
                    <Table.Cell>{server.votes}</Table.Cell>
                    <Table.Cell
                        >{server.createdAt.toLocaleDateString()}</Table.Cell
                    >
                </Table.Row>
            {:else}
                <Table.Row>
                    <Table.Cell colspan={6} class="text-muted-foreground">
                        No servers listed.
                    </Table.Cell>
                </Table.Row>
            {/each}
        </Table.Body>
    </Table.Root>

    <br />
    <Button variant="outline" href="/dashboard/admin/">Go Back</Button>
</div>
