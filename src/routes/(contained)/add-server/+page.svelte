<script lang="ts">
	import ServerEditorForm from '$lib/components/ServerEditorForm.svelte';
	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<h1>Add Your Server</h1>
<ServerEditorForm errors={form?.errors} />
