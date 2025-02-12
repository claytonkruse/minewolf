<script lang="ts">
    import DOMPurify from "isomorphic-dompurify";
    import { marked } from "marked";

    const purify = DOMPurify;

    marked.setOptions({
        breaks: true,
    });

    const allowedTags = [
        "a",
        "strong",
        "em",
        "code",
        "pre",
        "br",
        "ol",
        "ul",
        "li",
    ];
    const allowedAttributes = ["href", "title"];
    const purifyConfig = {
        ALLOWED_TAGS: allowedTags,
        ADD_ATTR: allowedAttributes,
    };

    // Add a hook to make all links open a new window
    purify.addHook("afterSanitizeAttributes", (node: any) => {
        if ("target" in node) {
            node.setAttribute("target", "_blank");
            node.setAttribute("rel", "nofollow noopener");
        }
        if (
            !node.hasAttribute("target") &&
            (node.hasAttribute("xlink:href") || node.hasAttribute("href"))
        ) {
            node.setAttribute("xlink:show", "new");
        }
    });

    // add Tailwind classes
    purify.addHook("afterSanitizeElements", (node: any) => {
        if (node.tagName === "OL") {
            node.setAttribute("class", "list-inside list-decimal");
        }
        if (node.tagName === "UL") {
            node.setAttribute("class", "list-inside list-disc");
        }

        if (node.tagName === "A") {
            node.setAttribute(
                "class",
                "underline-offset-4 underline hover:no-underline",
            );
        }
    });

    interface Props {
        markdown: string;
    }
    let props: Props = $props();
</script>

<div>
    <svelte:boundary>
        {#await marked(props.markdown)}
            <p>Rendering Markdown...</p>
        {:then dirty_html}
            {@html purify.sanitize(dirty_html, purifyConfig)}
        {/await}
    </svelte:boundary>
</div>
