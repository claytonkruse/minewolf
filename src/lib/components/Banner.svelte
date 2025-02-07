<script lang="ts">
    import { AspectRatio } from "$lib/components/ui/aspect-ratio";
    let { src, alt = "Banner", ...props } = $props();
</script>

<div class="h-[60px] w-[468px]">
    <AspectRatio
        {...props}
        ratio={468 / 60}
        class="flex content-center items-center justify-center overflow-hidden rounded-sm bg-muted"
    >
        <img {src} {alt} class="min-h-full min-w-full" />
    </AspectRatio>
</div>
