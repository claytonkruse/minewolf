<script lang="ts">
	let ip = '';
	let port_input: HTMLInputElement;

	function on_ip_input() {
		if (!ip.includes(':')) return;
		const ip_parts = ip.split(':');
		ip = ip_parts[0];
		port_input.value = ip_parts[1];
		port_input.focus();
	}
</script>

<h1>Add Your Server</h1>
<form>
	<label for="server-name">
		Server Name
		<input type="text" name="name" id="server-name" placeholder="Minewolf" />
	</label>
	<label for="server-slogan">
		Slogan
		<input type="text" name="slogan" id="server-slogan" placeholder="A Minecraft server." />
	</label>
	<div class="address">
		<label for="server-ip">
			Server IP
			<input
				type="text"
				name="ip"
				id="server-ip"
				placeholder="0.0.0.0"
				bind:value={ip}
				on:input={on_ip_input}
			/>
		</label>
		<label for="server-port">
			Server Port
			<input type="text" name="port" id="server-port" placeholder="25565" bind:this={por} />
		</label>
	</div>
	<fieldset>
		<legend>Minecraft Edition</legend>
		<label for="edition-java">
			<input type="radio" name="edition" id="edition-java" value="java" checked />
			Java
		</label>
		<label for="edition-bedrock">
			<input type="radio" name="edition" id="edition-bedrock" value="bedrock" />
			Bedrock
		</label>
		<label for="edition-both-separate">
			<input type="radio" name="edition" id="edition-both-separate" value="separate" />
			Both, but seperate
		</label>
		<label for="edition-crossplay">
			<input type="radio" name="edition" id="edition-crossplay" value="crossplay" />
			Both, with crossplay
		</label>
	</fieldset>
	<fieldset>
		<legend>Whitelisted?</legend>
		<label for="server-whitelisted-yes">
			<input type="radio" name="whitelisted" id="server-whitelisted-yes" value="yes" />
			Yes
		</label>
		<label for="server-whitelisted-no">
			<input type="radio" name="whitelisted" id="server-whitelisted-no" value="no" checked />
			No
		</label>
	</fieldset>
	<label for="server-tags">
		Additional Tags
		<input
			type="text"
			name="tags"
			id="server-tags"
			placeholder="survival, creative, pvp, skyblock, hunger games, bedwars"
		/>
	</label>
	<label for="server-banner">
		Banner
		<input type="file" name="banner" id="server-banner" />
		<small>jpeg, png, or gif</small>
	</label>
	<label for="server-description">
		Description
		<textarea name="server-description" id="" cols="30" rows="10"></textarea>
		<small
			>If this is a whitelisted server, you may want to include instructions on how to be added.</small
		>
	</label>
	<label for="server-video">
		YouTube Video
		<input type="text" name="video" id="server-video" placeholder="https://youtu.be/bnAQQEHtoW0" />
		<small>This video may be embedded on the server page.</small>
	</label>
	<label for="server-website">
		Website
		<input type="text" name="website" id="server-website" placeholder="https://minewolf.net" />
	</label>
	<label for="server-dynmap">
		Dynmap URL
		<input type="text" name="dynmap" id="server-dynmap" placeholder="https://dynmap.minewolf.net" />
	</label>
	<!-- <label for="server-email">
		Email
		<input type="text" name="server-email" id="server-email" placeholder="support@minewolf.net" />
	</label> -->
	<label for="server-discord">
		Discord Invite
		<input
			type="text"
			name="discord"
			id="server-discord"
			placeholder="https://discord.gg/DiSCoRdIsEVil"
		/>
	</label>
	<button type="submit">Post</button>
</form>

<style lang="scss">
	textarea {
		resize: vertical;
		min-height: 5rem;
	}

	.address {
		display: grid;
		grid-template-columns: 1fr max-content;
		gap: 1rem;
	}

	#server-port {
		display: block;
		width: 5rem;
	}
</style>
