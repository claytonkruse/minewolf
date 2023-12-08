<script lang="ts">
    export let errors: Array<string> | undefined;
</script>

{#if errors}
    <span class="danger">
        {#each errors as error}{error}{/each}
    </span>
{/if}