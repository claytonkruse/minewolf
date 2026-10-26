<script lang="ts">
    import Seo from "$lib/components/Seo.svelte";
    import { Button } from "$lib/components/ui/button";
</script>

<Seo
    title="Log out of All Devices - Minewolf"
    description="Sign out of your account on all devices."
    noindex
/>

<div class="text-center">
    <h1 class="text-2xl font-bold">
        Do you want to log out of all signed in devices?
    </h1>
    <br />
    <form method="POST">
        <Button variant="destructive" type="submit">Logout</Button>
    </form>

    <nav class="mt-2">
        <ul class="flex flex-col gap-2">
            <li>
                <Button variant="link" href="/dashboard/">Cancel</Button>
            </li>
        </ul>
    </nav>
</div>
