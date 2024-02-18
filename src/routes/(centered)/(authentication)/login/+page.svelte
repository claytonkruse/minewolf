<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { beforeSubmit } from '../beforeSubmit';
	import LinkFrom from '$lib/components/LinkFrom.svelte';
	import Errors from '$lib/components/Errors.svelte';
	import type { ActionData } from './$types';

	$: from = $page.url.searchParams.get('from');

	export let form: ActionData;
	let username = form?.data?.username;
	$: errors = form?.errors;

	let loginButton: HTMLButtonElement;
</script>

<article>
	<hgroup>
		<h1>Login</h1>
		<h2>To log in via an email sent to your inbox, omit your password.</h2>
	</hgroup>

	<form method="POST" use:enhance={() => beforeSubmit(loginButton)}>
		<label for="login-username">
			<input
				class="input"
				type="text"
				name="username"
				id="login-username"
				aria-label="Username"
				placeholder="Username"
				bind:value={username}
				required
			/>
			<Errors errors={errors?.username} />
		</label>
		<label for="login-password">
			<input
				class="input"
				type="password"
				name="password"
				id="login-password"
				aria-label="Password"
				placeholder="Password"
			/>
			<Errors errors={errors?.password} />
		</label>
		<!-- <fieldset>
			<label for="remember-me">
				<input type="checkbox" role="switch" id="remember-me" name="remember-me" />
				Remember me
			</label>
		</fieldset> -->

		<button type="submit" bind:this={loginButton}>Login</button>
	</form>

	<nav aria-label="breadcrumb">
		<ul>
			<li>
				<LinkFrom href="/register/">Register</LinkFrom>
			</li>
			<li><a href="/reset-password">Reset Password</a></li>
		</ul>
	</nav>
</article>

<style lang="scss">
	@import '../style.scss';
</style>
