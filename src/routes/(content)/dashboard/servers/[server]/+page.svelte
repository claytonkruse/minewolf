<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    let { data } = $props();
    let { server } = data;
</script>

<h1 class="text-2xl font-bold">{server.name} - Server Dashboard</h1>
<nav>
    <Button variant="secondary" href={`/servers/${server.id}/`}
        >View Server</Button
    >
    <Button variant="secondary" href="./edit/">Edit Server</Button>
    <Button variant="destructive" href="./remove/">Remove Server</Button>
    <Button variant="outline" href="../">Go Back</Button>
</nav>
