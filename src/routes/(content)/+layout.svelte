<script lang="ts">
    import { temp_url } from "$lib/utils/redirect_urls";
    import { page } from "$app/state";

    import { Button, buttonVariants } from "$lib/components/ui/button";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import * as Sheet from "$lib/components/ui/sheet";
    import { Separator } from "$lib/components/ui/separator";
    import { cn } from "$lib/utils";
    import logo from "$lib/assets/logo.png";

    import DiscordIcon from "~icons/bi/discord";
    import MenuIcon from "@lucide/svelte/icons/menu";
    import UserIcon from "@lucide/svelte/icons/circle-user";
    import DashboardIcon from "@lucide/svelte/icons/gauge";
    import ServerIcon from "@lucide/svelte/icons/server";
    import PlusIcon from "@lucide/svelte/icons/plus";
    import SettingsIcon from "@lucide/svelte/icons/settings";
    import ShieldIcon from "@lucide/svelte/icons/shield";
    import LogOutIcon from "@lucide/svelte/icons/log-out";

    import type { LayoutProps } from "./$types";
    let { data, children }: LayoutProps = $props();
    let user = $derived(data.user);
    let isAdmin = $derived(data.isAdmin);

    let isMap = $derived(page.route.id?.split("/").slice(-1)[0] === "map");
    let mobileNavOpen = $state(false);

    const navLinks = [
        { href: "/", label: "Home" },
        { href: "/servers/", label: "Browse" },
        { href: "/add-server/", label: "Add Server" },
    ];

    const footerLinks = [
        { href: "/servers/", label: "Browse Servers" },
        { href: "/add-server/", label: "Add Your Server" },
        { href: "/about/", label: "About" },
        { href: "/about/#contact", label: "Contact" },
    ];

    function isActive(href: string) {
        const path = page.url.pathname;
        return href === "/" ? path === "/" : path.startsWith(href);
    }
</script>

{#if !isMap}
    <div
        class="fixed inset-x-0 top-14 bottom-0 -z-10 bg-cover bg-center"
        style:background-image="url({data.wallpaper})"
        aria-hidden="true"
    ></div>
{/if}

<div class={cn("flex flex-col", isMap ? "h-full" : "min-h-full")}>
    <header
        class="bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 border-b backdrop-blur"
    >
        <div class="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-10 lg:w-[calc(100%-4rem)]">
            <Sheet.Root bind:open={mobileNavOpen}>
                <Sheet.Trigger
                    class={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "md:hidden",
                    )}
                    aria-label="Open menu"
                >
                    <MenuIcon />
                </Sheet.Trigger>
                <Sheet.Content side="left">
                    <Sheet.Header>
                        <Sheet.Title>
                            <img src={logo} alt="Minewolf" class="h-6 w-auto" />
                        </Sheet.Title>
                    </Sheet.Header>
                    <nav class="flex flex-col gap-1 px-4">
                        {#each navLinks as link}
                            <Button
                                variant={isActive(link.href)
                                    ? "secondary"
                                    : "ghost"}
                                class="justify-start"
                                href={link.href}
                                onclick={() => (mobileNavOpen = false)}
                            >
                                {link.label}
                            </Button>
                        {/each}
                        <Separator class="my-2" />
                        <Button
                            variant="ghost"
                            class="justify-start"
                            href="/discord/"
                            target="_blank"
                            rel="nofollow noopener noreferrer"
                        >
                            <DiscordIcon /> Discord
                        </Button>
                    </nav>
                </Sheet.Content>
            </Sheet.Root>

            <a href="/" class="shrink-0">
                <img src={logo} alt="Minewolf" class="h-7 w-auto" />
            </a>

            <nav class="hidden items-center gap-1 md:flex">
                {#each navLinks as link}
                    <a
                        href={link.href}
                        class={cn(
                            "hover:text-foreground px-3 py-2 text-sm font-medium transition-colors",
                            isActive(link.href)
                                ? "text-foreground"
                                : "text-muted-foreground",
                        )}
                        aria-current={isActive(link.href) ? "page" : undefined}
                    >
                        {link.label}
                    </a>
                {/each}
            </nav>

            <div class="ml-auto flex items-center gap-2">
                {#if user}
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger
                            class={buttonVariants({
                                variant: "ghost",
                                size: "sm",
                            })}
                        >
                            <UserIcon />
                            <span class="max-w-32 truncate">{user.name}</span>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content align="end" class="w-48">
                            <DropdownMenu.Label class="truncate">
                                {user.name}
                            </DropdownMenu.Label>
                            <DropdownMenu.Separator />
                            <DropdownMenu.Group>
                                <DropdownMenu.Item>
                                    {#snippet child({ props })}
                                        <a href="/dashboard/" {...props}>
                                            <DashboardIcon /> Dashboard
                                        </a>
                                    {/snippet}
                                </DropdownMenu.Item>
                                <DropdownMenu.Item>
                                    {#snippet child({ props })}
                                        <a
                                            href="/dashboard/servers/"
                                            {...props}
                                        >
                                            <ServerIcon /> My Servers
                                        </a>
                                    {/snippet}
                                </DropdownMenu.Item>
                                <DropdownMenu.Item>
                                    {#snippet child({ props })}
                                        <a href="/add-server/" {...props}>
                                            <PlusIcon /> Add Server
                                        </a>
                                    {/snippet}
                                </DropdownMenu.Item>
                                <DropdownMenu.Item>
                                    {#snippet child({ props })}
                                        <a
                                            href="/dashboard/account/"
                                            {...props}
                                        >
                                            <SettingsIcon /> Account
                                        </a>
                                    {/snippet}
                                </DropdownMenu.Item>
                                {#if isAdmin}
                                    <DropdownMenu.Item>
                                        {#snippet child({ props })}
                                            <a
                                                href="/dashboard/admin/"
                                                {...props}
                                            >
                                                <ShieldIcon /> Admin
                                            </a>
                                        {/snippet}
                                    </DropdownMenu.Item>
                                {/if}
                            </DropdownMenu.Group>
                            <DropdownMenu.Separator />
                            <DropdownMenu.Item variant="destructive">
                                {#snippet child({ props })}
                                    <a href="/logout/" {...props}>
                                        <LogOutIcon /> Log out
                                    </a>
                                {/snippet}
                            </DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu.Root>
                {:else}
                    <Button size="sm" href={temp_url("/login/", page.url)}>
                        Log in
                    </Button>
                {/if}
            </div>
        </div>
    </header>

    {#if !isMap}
        <main
            id="main"
            class="bg-background mx-auto w-full max-w-6xl grow px-4 py-5 text-center sm:px-10 lg:my-8 lg:w-[calc(100%-4rem)] lg:panel lg:has-[[data-fit-panel]]:w-fit lg:has-[[data-fit-panel]]:grow-0 lg:has-[[data-panels]]:border-0 lg:has-[[data-panels]]:bg-transparent lg:has-[[data-panels]]:p-0 lg:has-[[data-panels]]:shadow-none"
        >
            {@render children()}
        </main>
        <footer class="bg-background mt-auto border-t">
            <div
                class="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 text-left sm:px-10 md:flex-row md:items-center md:justify-between lg:w-[calc(100%-4rem)]"
            >
                <div>
                    <a href="/" class="inline-block">
                        <img src={logo} alt="Minewolf" class="h-6 w-auto" />
                    </a>
                    <p class="text-muted-foreground mt-1 text-sm">
                        The Minecraft Server Directory
                    </p>
                    <p class="text-muted-foreground mt-3 text-xs">
                        © {new Date().getFullYear()}
                        <a
                            href="https://claytonkruse.com"
                            class="hover:text-foreground underline-offset-4 transition-colors hover:underline"
                            >Clayton Kruse</a
                        >
                    </p>
                </div>

                <nav aria-label="Footer">
                    <ul class="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                        {#each footerLinks as link}
                            <li>
                                <a
                                    href={link.href}
                                    class="text-muted-foreground hover:text-foreground transition-colors"
                                    >{link.label}</a
                                >
                            </li>
                        {/each}
                    </ul>
                </nav>

                <Button
                    variant="outline"
                    href="/discord/"
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                >
                    <DiscordIcon /> Join our Discord
                </Button>
            </div>
        </footer>
    {:else}
        <main id="main" class="h-full">
            {@render children()}
        </main>
    {/if}
</div>
