<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb";
    import * as Card from "$lib/components/ui/card";
    import * as Table from "$lib/components/ui/table";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
    const { stats, roles } = data;
</script>

<svelte:head>
    <title>Admin Dashboard - Minewolf</title>
</svelte:head>

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
    <Button variant="outline" href="..">Go Back</Button>
</div>
