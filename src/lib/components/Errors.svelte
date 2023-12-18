<script lang="ts">
	export let errors: Array<string> | undefined;
</script>

{#if errors}
	<small class="danger">
		{errors.join(' ')}
	</small>
{/if}
