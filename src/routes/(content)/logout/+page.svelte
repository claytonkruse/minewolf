<script lang="ts">
    import Seo from "$lib/components/Seo.svelte";
    import { Button } from "$lib/components/ui/button";
</script>

<Seo
    title="Log out - Minewolf"
    description="Sign out of your account on this device."
    noindex
/>

<div class="text-center">
    <h1 class="text-2xl font-bold">Do you want to log out?</h1>
    <br />
    <form method="POST">
        <Button variant="destructive" type="submit">Log out</Button>
    </form>

    <nav class="mt-2">
        <ul class="flex flex-col gap-2">
            <li>
                <Button variant="link" class="text-xs" href="./all/"
                    >Log out of All Devices</Button
                >
            </li>

            <li>
                <br /><br /><br />
                <Button variant="link" href="/dashboard/">Cancel</Button>
            </li>
        </ul>
    </nav>
</div>
