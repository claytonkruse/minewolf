<script lang="ts">
    interface Props {
        errors: Array<string> | undefined;
    }

    let { errors }: Props = $props();
</script>

{#if errors}
    <small class="danger">
        {errors.join(" ")}
    </small>
{/if}
