<script lang="ts">
    import { temp_url } from "$lib/utils/redirect_urls";
    import { page } from "$app/state";

    import { Button } from "$lib/components/ui/button";
    // import { Input } from "$lib/components/ui/input";
    import logo from "$lib/images/logo.png";
    import DiscordIcon from "~icons/bi/discord";
    import YouTubeIcon from "~icons/bi/youtube";
    import TwitterIcon from "~icons/bi/twitter-x";
    import PersonIcon from "~icons/material-symbols/person-2-rounded";

    import type { LayoutProps } from "./$types";
    let { data, children }: LayoutProps = $props();
    let user = data.user;

    let isMap = $derived(page.route.id?.split("/").slice(-1)[0] === "map");
</script>

<div class="flex h-full flex-col">
    <header class="flex justify-between px-10 py-2 lg:block">
        <nav class="lg:float-left">
            <a href="/" class="inline-block">
                <img src={logo} alt="Minewolf" class="inline-block" />
            </a>

            <Button variant="link" href="/">Home</Button>
            <!-- <Button variant="link" href="/articles/">Articles</Button> -->
            <!-- <Button variant="link" href="/servers/">Browse</Button> -->
        </nav>

        <nav class="lg:float-right">
            <ul class="flex gap-2">
                <li>
                    <Button
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        variant="ghost"
                        href="/discord/"><DiscordIcon /> Discord</Button
                    >
                </li>
                <li>
                    {#if user}
                        <Button
                            variant="outline"
                            class="align-bottom"
                            href="/dashboard/"
                        >
                            <PersonIcon /> {user.name}</Button
                        >
                    {:else}
                        <Button
                            variant="outline"
                            href={temp_url("/login/", page.url)}>Login</Button
                        >
                    {/if}
                </li>
            </ul>
        </nav>

        <!-- <div class="hidden text-center lg:block">
            <form method="GET" action="/servers/" class="inline-flex gap-1">
                <Input
                    type="text"
                    name="q"
                    class="lowercase"
                    placeholder="Search for Servers"
                />
                <Button type="submit" variant="outline">Search</Button>
            </form>
        </div> -->
    </header>

    {#if !isMap}
        <main
            id="main"
            class="w-full flex-grow flex-col px-10 py-5 text-center"
        >
            {@render children()}
        </main>
        <footer class="footer flex justify-between gap-6 border-t-2 p-10">
            <aside>
                <p>
                    <span class="text-xl font-bold uppercase">Minewolf</span>
                    <br />
                    The Minecraft Server Directory
                </p>
            </aside>
            <!-- <nav>
                <h6 class="font-bold">Created By</h6>

                <a href="https://claytonkruse.com" class="link">Clayton Kruse</a
                >
            </nav>
            <nav>
                <h6 class="font-bold">Navigation</h6>

                <ul class="text-sm">
                    <li>
                        <a href="/servers/">Browse Servers</a>
                    </li>
                    <li><a href="/add-server/">Add Your Server</a></li>
                    <li>
                        <a href="/dashboard/">Manage Your Listings</a>
                    </li>
                </ul>
            </nav>
            <nav>
                <h6 class="font-bold">Catagories</h6>

                <ul class="text-sm">
                    <li><a href="/">Survival</a></li>
                    <li><a href="/">Towny</a></li>
                    <li><a href="/">Factions</a></li>
                </ul>
            </nav>
            <nav>
                <h6 class="font-bold">Support Me</h6>

                <ul class="text-sm">
                    <li><a href="/premium/">Minewolf Premium</a></li>
                    <li>
                        <a href="/">Minecraft Server Sponsor Slots</a>
                    </li>
                    <li>
                        <a href="/">Become a Minecraft Hosting Sponsor</a>
                    </li>
                </ul>
            </nav> -->
            <nav>
                <h6 class="mb-1 font-bold">Socials</h6>

                <ul class="flex gap-2">
                    <li><a href="/discord/"><DiscordIcon /></a></li>
                    <li>
                        <a href="https://x.com/minewolfdotnet"
                            ><TwitterIcon /></a
                        >
                    </li>
                    <li>
                        <a href="https://www.youtube.com/@minewolfdotnet"
                            ><YouTubeIcon /></a
                        >
                    </li>
                </ul>
            </nav>
        </footer>
    {:else}
        <main id="main" class="h-full">
            {@render children()}
        </main>
    {/if}
</div>
