<script lang="ts">
    import type { LayoutProps } from "./$types";
    import "../app.pcss";

    let { children }: LayoutProps = $props();
</script>

<div class="contents text-center">
    {@render children()}
</div>
