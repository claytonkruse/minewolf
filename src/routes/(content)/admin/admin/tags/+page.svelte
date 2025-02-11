<script lang="ts">
    import type { PageData } from "./$types";
    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();
</script>

<h1>Tags Management</h1>

<form method="POST" action="?/deleteVersions">
    <button type="submit">Delete All Versions</button>
</form>

<article>
    <h2>Create Tag</h2>

    <form method="POST" action="/actions/">
        <label for="tag-name">
            Name
            <input
                type="text"
                name="tag-name"
                id="tag-name"
                placeholder="creative, survival, pvp"
            />
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
    <table>
        <thead>
            <tr>
                <th>id</th>
                <th>type</th>
                <th>name</th>
            </tr>
        </thead>
        <tbody>
            {#each data.tags as tag}
                <tr>
                    <td>{tag.id}</td>
                    <td>{tag.type}</td>
                    <td>{tag.name}</td>
                </tr>
            {/each}
        </tbody>
    </table>
</section>
