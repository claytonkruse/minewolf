<script lang="ts">
	import Navbar from './Navbar.svelte';
	import './style.scss';
</script>

<Navbar />
<main class="container">
	<slot />
</main>
