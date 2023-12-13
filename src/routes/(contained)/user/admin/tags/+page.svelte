<h1>Tags Management</h1>

<article>
	<h2>Create Tag</h2>
	<form action="/actions/" method="POST">
		<label for="tag-name">
			Name
			<input type="text" name="tag-name" id="tag-name" placeholder="creative, survival, pvp" />
		</label>
		<label for="tag-type">
			Type
			<select name="tag-type" id="tag-type">
				<option value="feature">Feature</option>
				<option value="interest">Interest</option>
				<option value="gamemode">Gamemode</option>
			</select>
		</label>
		<input type="submit" />
	</form>
</article>

<section>
	<h2>Tags</h2>
</section>
