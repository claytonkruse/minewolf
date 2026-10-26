<script lang="ts">
    import RenderMarkdown from "$lib/components/RenderMarkdown";

    interface Props {
        body: string;
    }
    let { body }: Props = $props();
</script>

<div
    class="break-words *:*:not-last:mb-3 [&_ol]:list-outside [&_ol]:pl-6 [&_ul]:list-outside [&_ul]:pl-6"
>
    <RenderMarkdown markdown={body} paragraphs />
</div>
