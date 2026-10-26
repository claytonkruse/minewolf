<script lang="ts">
    import Seo from "$lib/components/Seo.svelte";
    import { Button } from "$lib/components/ui/button";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
    let user = data.user;
</script>

<Seo
    title="Dashboard - Minewolf"
    description="Your Minewolf Dashboard"
    noindex
/>

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
                <li>
                    <Button variant="outline" href="./account/">Account</Button>
                </li>
                {#if data.isAdmin}
                    <li>
                        <Button variant="outline" href="./admin/">Admin</Button>
                    </li>
                {/if}
            </ul>

            <br />
            <Button variant="destructive" href="/logout/">Logout</Button>
        </nav>
    </aside>
</div>
