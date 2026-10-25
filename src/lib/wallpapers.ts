const modules = import.meta.glob<string>("$lib/assets/wallpapers/*.webp", {
    eager: true,
    import: "default",
});

export const wallpapers = Object.values(modules);
