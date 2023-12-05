<script lang="ts">
	// todo: if the user is logged in, autofill their username
	let username = '';
</script>

<h1>Cast your vote for SERVERNAME?</h1>
<form method="POST">
	<label for="vote-username">
		Minecraft Username
		<input
			type="text"
			name="vote-username"
			id="vote-username"
			placeholder="notch"
			value={username}
		/>
	</label>
	<button type="submit">Vote</button>
</form>
<nav aria-label="breadcrumb">
	<ul>
		<li><a href="..">Cancel</a></li>
	</ul>
</nav>
