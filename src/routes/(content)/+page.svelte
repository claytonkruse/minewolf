<script lang="ts">
    import { Button } from "$lib/components/ui/button";
</script>

<svelte:head>
    <title>Minewolf - The Superior Minecraft Server List</title>
</svelte:head>

<hgroup class="text-center">
    <h1 class="text-4xl font-bold uppercase">Minewolf</h1>
    <h2>The Superior Minecraft Server List</h2>
</hgroup>
<br />

<!-- <p>
    Minewolf is the website dedicated to providing the best Minecraft server
    list experience for players and server owners. Here on Minewolf, servers are
    universally ranked by a multitude of factors to provide players with the
    highest quality servers, while doing everything we can to help high quality
    small servers grow. Find a hidden gem, or list your server today!
</p> -->

<p>
    Minewolf is a new Minecraft server list that is different. Add your server
    before launch day now!
</p>

<br />
<Button variant="default" href="/add-server/">Add Your Server</Button>
<br />
<Button variant="secondary" class="mt-2" href="/discord/"
    >Join us on Discord</Button
>

<!-- <iframe
    title="Discord"
    class="mx-auto mt-36"
    src="https://discord.com/widget?id=1299235285271314463&theme=dark"
    width="350"
    height="500"
    allowtransparency={true}
    frameborder="0"
    sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
></iframe> -->

<!-- <h3 class="text-xl font-bold">Sponsor Servers</h3>
<h3 class="text-xl font-bold">Featured Servers</h3>
<h3 class="text-xl font-bold">Top Servers</h3>
<h3 class="text-xl font-bold">Other Servers</h3>
<nav>
    <ul>
        <li>
            <a href="/servers/?version=1.20.4"
                >Servers on Minecraft 1.20.4 (latest)</a
            >
        </li>
        <li><a href="/servers/?crossplay=true">Servers with Crossplay</a></li>
        <li><a href="/servers/?new=true">New Servers</a></li>
    </ul>
</nav> -->
