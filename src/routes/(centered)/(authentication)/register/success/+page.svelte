<script lang="ts">
	import { page } from "$app/stores";

    $: from = $page.url.searchParams.get('from');
</script>

<hgroup>
    <h1>Account Created</h1>
    <h2>You have successfully created an account.</h2>
</hgroup>
<p>Now you may visit the <a href={'/login' + (from ? `?from=${from}` : '')}>login</a> page or check your email.</p>

<style>
    hgroup {
        text-align: center;
    }
</style>