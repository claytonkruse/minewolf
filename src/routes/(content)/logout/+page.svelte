<script lang="ts">
    import { Button } from "$lib/components/ui/button";
</script>

<svelte:head>
    <title>Logout - Minewolf</title>
    <meta
        name="description"
        content="Sign out of your account on this device."
    />
</svelte:head>

<div class="text-center">
    <h1 class="text-2xl font-bold">Do you want to logout?</h1>
    <br />
    <form method="POST">
        <Button variant="destructive" type="submit">Logout</Button>
    </form>
</div>
