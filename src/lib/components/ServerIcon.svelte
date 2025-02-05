<script lang="ts">
    import { AspectRatio } from "$lib/components/ui/aspect-ratio";
    import no_icon from "$lib/images/pack.png";

    let { src, ...props } = $props();
</script>

<div class="h-[64px] w-[64px]">
    <AspectRatio
        {...props}
        ratio={1 / 1}
        class="content-center items-center justify-center overflow-hidden bg-muted"
    >
        <img src={src || no_icon} alt="" />
    </AspectRatio>
</div>
