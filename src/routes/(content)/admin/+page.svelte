<script lang="ts">
    let { data } = $props();
    let { ip, headers } = data;
</script>

<h1>Admin Debug Information</h1>
<p>This is currently unsecured because it is not private.</p>

<p>IP: {ip}</p>
<p>Headers: {JSON.stringify(headers)}</p>
