<script>
    import { Button } from "$lib/components/ui/button";
</script>

<svelte:head>
    <title>Delete Account - Minewolf</title>
</svelte:head>

<hgroup>
    <h1 class="text-2xl font-bold">
        Are you sure you want to
        <span class="underline">permanently delete your account</span>?
    </h1>

    <h2 class="text-sm">This cannot be undone.</h2>
</hgroup>

<br />

<form method="POST">
    <Button variant="destructive" type="submit">Delete Account</Button>
</form>

<nav class="mt-2">
    <ul>
        <li>
            <Button variant="link" href="/dashboard/">Cancel</Button>
        </li>
    </ul>
</nav>
