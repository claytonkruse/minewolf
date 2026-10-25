<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
    import DiscordIcon from "~icons/bi/discord";
</script>

<svelte:head>
    <title>About - Minewolf</title>
    <meta
        name="description"
        content="Minewolf is a Minecraft server list that keeps every listing up to date automatically."
    />
</svelte:head>

<div
    class="mx-auto flex max-w-full flex-col gap-12 text-left lg:gap-4 xl:flex-row xl:items-start"
    data-fit-panel
    data-panels
>
    <section class="lg:panel w-2xl max-w-full">
        <h1 class="font-heading text-4xl font-bold">About Minewolf</h1>
        <p class="text-muted-foreground mt-3 text-lg">
            Minewolf is a Minecraft server list built to help players find their
            next server, and to help servers of every kind get found.
        </p>

        <div class="mt-8 grid gap-4">
            <Card.Root>
                <Card.Header>
                    <Card.Title>Always up to date</Card.Title>
                </Card.Header>
                <Card.Content class="text-muted-foreground space-y-2 text-sm">
                    <p>
                        Listings shouldn't depend on someone remembering to edit
                        them. Minewolf checks every listed server on its own:
                        online status, player counts and the server's message of
                        the day are refreshed every 10 minutes, and the server's
                        version is detected automatically when it's added.
                    </p>
                    <p>What you see is the server as it is right now.</p>
                </Card.Content>
            </Card.Root>

            <Card.Root>
                <Card.Header>
                    <Card.Title>Voting</Card.Title>
                </Card.Header>
                <Card.Content class="text-muted-foreground space-y-2 text-sm">
                    <p>
                        Players can vote once every 24 hours. Servers that use
                        Votifier can reward you in-game for your vote.
                    </p>
                </Card.Content>
            </Card.Root>

            <Card.Root>
                <Card.Header>
                    <Card.Title>For server owners</Card.Title>
                </Card.Header>
                <Card.Content class="text-muted-foreground space-y-2 text-sm">
                    <p>
                        Listing your server is free. Log in with Discord, enter
                        your server's address, and Minewolf fills in the rest.
                    </p>
                </Card.Content>
                <Card.Footer>
                    <Button href="/add-server/">Add Your Server</Button>
                </Card.Footer>
            </Card.Root>
        </div>
    </section>

    <section
        id="contact"
        class="lg:panel w-2xl max-w-full scroll-mt-20 xl:w-96"
    >
        <h2 class="font-heading text-3xl font-bold">Contact</h2>
        <p class="text-muted-foreground mt-3">
            The best way to reach us is the Minewolf Discord. Whether you're a
            player or a server owner, we're happy to help.
        </p>

        <ul
            class="text-muted-foreground mt-6 grid gap-4 text-sm sm:grid-cols-2 xl:grid-cols-1"
        >
            <li class="bg-card ring-foreground/10 p-4 ring-1">
                <p class="text-foreground font-medium">
                    Help with your listing
                </p>
                <p class="mt-1">
                    Trouble adding, editing or removing a server, or your
                    server's information looks wrong.
                </p>
            </li>
            <li class="bg-card ring-foreground/10 p-4 ring-1">
                <p class="text-foreground font-medium">Report a server</p>
                <p class="mt-1">
                    A listing is misleading, offensive or isn't a real Minecraft
                    server.
                </p>
            </li>
            <li class="bg-card ring-foreground/10 p-4 ring-1">
                <p class="text-foreground font-medium">Feedback and ideas</p>
                <p class="mt-1">
                    Something you'd like Minewolf to do, or something it could
                    do better.
                </p>
            </li>
            <li class="bg-card ring-foreground/10 p-4 ring-1">
                <p class="text-foreground font-medium">Bugs</p>
                <p class="mt-1">
                    Something on the site isn't working the way it should.
                </p>
            </li>
        </ul>

        <Button
            class="mt-6"
            size="lg"
            href="/discord/"
            target="_blank"
            rel="nofollow noopener noreferrer"
        >
            <DiscordIcon /> Join our Discord
        </Button>
    </section>
</div>
