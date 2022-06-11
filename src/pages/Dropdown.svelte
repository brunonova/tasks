<script lang="ts">
    /** Icon of the dropdown button (optional). */
    export let icon = "";
    /** Label of the dropdown button (optional). */
    export let label = "";
    /** Tooltipo of the dropdown button (optional) */
    export let title = "";
</script>

<div class="dropdown" tabindex="0">
    <!-- Mask to make clicks on the button to close the dropdown menu -->
    <div class="dropdown-mask" tabindex="0"></div>

    <!-- Button to open/close the dropdown menu -->
    <!-- svelte-ignore a11y-missing-attribute -->
    <a {title}><i class={icon}></i>{label}</a>

    <!-- Content of the dropdown -->
    <div class="dropdown-content">
        <slot></slot>
    </div>
</div>

<style lang="scss">
    .dropdown {
        position: relative;

        .dropdown-content {
            position: absolute;
            visibility: hidden;
            display: inline-block;
            opacity: 0;
            top: 80%;
            right: 0;
            background-color: var(--color-background);
            border: solid 1px var(--color-border);
            border-radius: 6px;
            text-align: left;
            color: var(--color-font);
            box-shadow: 2px 2px 8px 2px #00000020;
            transition: all 0.3s;
            font-size: 20px;
            font-weight: normal;
            z-index: 100;

            :global(a) {
                display: block;
                color: var(--color-font);
                text-decoration: none;
                font-size: inherit;
                padding: 10px 20px;
                text-align: right;
                white-space: nowrap;
                cursor: pointer;
                transition: background-color 0.2s;

                &:hover {
                    background-color: var(--color-hover);
                }
            }

            :global(hr) {
                border: none;
                border-top: solid 1px var(--color-border);
                margin: 5px 0;
            }
        }

        .dropdown-mask {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            cursor: pointer;
            visibility: hidden;
        }

        &:focus {
            .dropdown-content {
                visibility: visible;
                opacity: 1;
                top: 100%;
            }

            .dropdown-mask {
                visibility: visible;
            }
        }
    }
</style>