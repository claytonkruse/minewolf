<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
    let user = data.user;
</script>

<svelte:head>
    <title>Dashboard - Minewolf</title>
    <meta name="description" content="Your Minewolf Dashboard" />
</svelte:head>

<div>
    <h1 class="text-4xl font-bold">{user.name}'s Minewolf Dashboard</h1>

    <br />

    <aside>
        <nav>
            <ul class="flex flex-col gap-2">
                <li>
                    <Button variant="outline" href="/add-server/"
                        >Add Server</Button
                    >
                </li>

                <li>
                    <Button variant="outline" href="/dashboard/servers/"
                        >My Servers</Button
                    >
                </li>
            </ul>

            <br />
            <Button variant="destructive" href="/logout/">Logout</Button>
        </nav>
    </aside>
</div>
