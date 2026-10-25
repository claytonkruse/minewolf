<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import DiscordIcon from "~icons/bi/discord";
    import StarIcon from "@lucide/svelte/icons/star";
</script>

<svelte:head>
    <title>Become a Sponsor - Minewolf</title>
    <meta
        name="description"
        content="Sponsor your Minecraft server on Minewolf to be featured on the homepage."
    />
</svelte:head>

<div class="mx-auto max-w-full text-left" data-fit-panel data-panels>
    <section class="lg:panel w-2xl max-w-full">
        <h1 class="font-heading flex items-center gap-3 text-4xl font-bold">
            <StarIcon class="size-8 fill-current" /> Become a Sponsor
        </h1>
        <p class="text-muted-foreground mt-3 text-lg">
            Sponsored servers are featured in the Sponsors section at the top of
            the Minewolf homepage, so they're one of the first things players
            see.
        </p>

        <h2 class="font-heading mt-8 text-xl font-bold">
            How to get sponsored
        </h2>
        <p class="text-muted-foreground mt-2">
            Sponsorships are arranged directly with the Minewolf team for now.
            Join the Minewolf Discord and let us know which server you'd like to
            sponsor, and we'll get you the details.
        </p>

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
