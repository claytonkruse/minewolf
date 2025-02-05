<script lang="ts">
    import type { PageData } from "./$types";
    import { Input } from "$lib/components/ui/input";
    import { Button } from "$lib/components/ui/button";
    import { browser } from "$app/environment";

    let { data }: { data: PageData } = $props();
    let { server } = data;

    let username = $state("");

    if (browser) {
        username = localStorage.getItem("minecraft_username") || "";
    }

    function onsubmit(event: SubmitEvent) {
        localStorage.setItem("minecraft_username", username);
    }
</script>

<div class="mx-auto max-w-lg">
    <h1 class="text-2xl font-bold">Cast your vote for {server.name}?</h1>
    <br />
    <form method="POST" class="text-left" {onsubmit}>
        <label class="text-sm" for="vote-username"> Minecraft Username </label>

        <div class="flex gap-1">
            <Input
                type="text"
                name="vote-username"
                id="vote-username"
                bind:value={username}
                placeholder="notch"
            />
            <Button type="submit">Vote</Button>
        </div>
    </form>

    <nav>
        <ul class="flex justify-between">
            <li>
                <Button
                    variant="link"
                    class="px-0 text-xs text-muted-foreground"
                    href="..">Cancel</Button
                >
            </li>
            <li>
                <Button
                    variant="link"
                    class="px-0 text-xs text-muted-foreground"
                    href="../map/"
                ></Button>
            </li>
        </ul>
    </nav>
</div>
