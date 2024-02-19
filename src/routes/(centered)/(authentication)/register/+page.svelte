<script lang="ts">
	import { enhance } from '$app/forms';
	import { beforeSubmit } from '../beforeSubmit';
	import LinkFrom from '$lib/components/LinkFrom.svelte';
	import Errors from '$lib/components/Errors.svelte';

	export let form;

	let username = form?.data?.username;
	let email = form?.data?.email;
	$: errors = form?.errors;

	let registerButton: HTMLButtonElement;
</script>

<article>
	<hgroup>
		<h1>Register</h1>
		<h2>
			Create an account. An email is optional, although required to reset your
			password.
		</h2>
	</hgroup>

	<form method="POST" use:enhance={() => beforeSubmit(registerButton)}>
		<label for="register-username">
			<input
				class="input"
				type="text"
				name="username"
				id="register-username"
				aria-label="Username"
				placeholder="Username"
				bind:value={username}
				required
			/>
			<Errors errors={errors?.username} />
		</label>
		<label for="register-password">
			<input
				class="input"
				type="text"
				name="password"
				id="register-password"
				aria-label="Password"
				placeholder="Password"
			/>
			<Errors errors={errors?.password} />
		</label>
		<label for="register-email">
			<input
				class="input"
				type="email"
				name="email"
				id="register-email"
				aria-label="Email (optional, required for password reset)"
				placeholder="Email (optional, required for password reset)"
				bind:value={email}
			/>
			<Errors errors={errors?.email} />
		</label>

		<button type="submit" bind:this={registerButton}>Register</button>
	</form>

	<nav aria-label="breadcrumb">
		<ul>
			<li><LinkFrom href="/login/">Login</LinkFrom></li>
			<li><a href="/reset-password">Reset Password</a></li>
		</ul>
	</nav>
</article>

<style lang="scss">
	@import '../style.scss';
</style>
