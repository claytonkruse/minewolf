<script lang="ts">
	import type { LayoutData } from './$types';
	import Navbar from './Navbar.svelte';
	import './style.scss';

	export let data: LayoutData;
	$: username = data.username;
</script>

<Navbar {username} />
<slot />
