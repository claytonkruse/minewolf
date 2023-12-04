<script lang="ts">
    import ServerListing from "./ServerListing.svelte";
</script>

<table>
    <thead>
        <td>Rank</td>
        <td>Name</td>
        <td>Banner</td>
        <td>Players</td>
        <td>Status</td>
    </thead>
    <tbody>
        <slot></slot>
    </tbody>
</table>

