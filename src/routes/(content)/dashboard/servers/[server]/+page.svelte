<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb";
    import ViewIcon from "@lucide/svelte/icons/eye";
    import EditIcon from "@lucide/svelte/icons/pencil";
    import RemoveIcon from "@lucide/svelte/icons/trash-2";
    import BackIcon from "@lucide/svelte/icons/arrow-left";
    import ServerAnalytics from "./ServerAnalytics.svelte";

    let { data } = $props();
    let { server, analytics, analyticsDays } = data;
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
    <Button variant="secondary" href={`/servers/${server.id}/`}>
        <ViewIcon data-icon="inline-start" /> View Server
    </Button>
    <Button variant="secondary" href="./edit/">
        <EditIcon data-icon="inline-start" /> Edit Server
    </Button>
    <Button variant="destructive" href="./remove/">
        <RemoveIcon data-icon="inline-start" /> Remove Server
    </Button>
    <Button variant="outline" href="../">
        <BackIcon data-icon="inline-start" /> Go Back
    </Button>
</nav>
<ServerAnalytics {analytics} days={analyticsDays} />
