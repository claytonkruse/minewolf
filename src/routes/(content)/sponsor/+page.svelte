<script lang="ts">
    import Seo from "$lib/components/Seo.svelte";
    import { Button } from "$lib/components/ui/button";
    import DiscordIcon from "~icons/bi/discord";
    import StarIcon from "@lucide/svelte/icons/star";
</script>

<Seo
    title="Become a Sponsor - Minewolf"
    description="Sponsor your Minecraft server on Minewolf to be featured on the homepage."
/>

<div class="mx-auto max-w-full text-left" data-fit-panel data-panels>
    <section class="lg:panel w-2xl max-w-full">
        <h1 class="font-heading flex items-center gap-3 text-4xl font-bold">
            <StarIcon class="size-8 fill-current" /> Become a Sponsor
        </h1>
        <p class="text-muted-foreground mt-3 text-lg">
            Sponsor servers are featured in the Sponsors section at the top of
            the Minewolf homepage, so they're one of the first things players
            see.
        </p>

        <h2 class="font-heading mt-8 text-xl font-bold">
            How to get sponsored
        </h2>
        <p class="text-muted-foreground mt-2">
            Sponsorships are arranged directly with the Minewolf team for now.
            Join the Minewolf Discord and let us know you want to become a sponsor,
            and we'll get you the details.
        </p>

        <Button class="mt-6" size="lg" href="/discord/">
            <DiscordIcon /> Join our Discord
        </Button>
    </section>
</div>
