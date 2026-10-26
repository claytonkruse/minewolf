<script lang="ts">
    import { Button } from "$lib/components/ui/button";
</script>

<svelte:head>
    <title>Log out - Minewolf</title>
    <meta
        name="description"
        content="Sign out of your account on this device."
    />
</svelte:head>

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
