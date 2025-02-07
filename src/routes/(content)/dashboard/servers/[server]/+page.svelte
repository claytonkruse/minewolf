<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb";

    let { data } = $props();
    let { server } = data;
</script>

<svelte:head>
    <title>{server.name} - Server Dashboard - Minewolf</title>
    <meta name="description" content="Manage your server on Minewolf" />
</svelte:head>

<Breadcrumb.Root>
    <Breadcrumb.List>
        <Breadcrumb.Item>
            <Breadcrumb.Link href="/dashboard/">Dashboard</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>
            <Breadcrumb.Link href="/dashboard/servers/">Servers</Breadcrumb.Link
            >
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>
            <Breadcrumb.Page>{server.name}</Breadcrumb.Page>
        </Breadcrumb.Item>
    </Breadcrumb.List>
</Breadcrumb.Root>
<h1 class="text-2xl font-bold">{server.name} - Server Dashboard</h1>
<nav>
    <Button variant="secondary" href={`/servers/${server.id}/`}
        >View Server</Button
    >
    <Button variant="secondary" href="./edit/">Edit Server</Button>
    <Button variant="destructive" href="./remove/">Remove Server</Button>
    <Button variant="outline" href="../">Go Back</Button>
</nav>
