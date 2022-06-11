<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import { t } from "svelte-intl-precompile";
    import { page } from "../lib/stores";

    export let title = $t("appName");
</script>

<div class="body-wrapper" in:fly={{x: 0, y: -1000, duration: 200}} out:fade={{duration: 200}}>
    <div class="header">
        {#if page.hasPrevious()}
            <button type="button" on:click={() => page.pop()}>
                <i class="fa fa-arrow-left"></i>
            </button>
        {/if}

        <h1>{title}</h1>

        <div class="actions">
            <slot name="actions"></slot>
        </div>
    </div>
    <div class="content">
        <slot></slot>
    </div>
</div>

<style lang="scss">
    .body-wrapper {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
    }

    .header {
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        display: flex;
        align-items: center;
        background-color: var(--color-primary);
        color: white;
        padding: 10px 20px;
        box-shadow: 0px 2px 4px 2px #00000040;
        font-size: 32px;
        font-weight: 500;
        z-index: 10;

        h1 {
            margin: 0;
            font-size: 1em;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .actions {
            display: flex;
            margin-left: auto;
            align-items: center;
        }

        &, .actions {
            & > :global(*) {
                margin-left: 10px;
            }

            & > :global(button),
            & > :global(a),
            & > :global(.dropdown) > :global(a) {
                padding: 0;
                display: inline-block;
                border: none;
                background: none;
                color: white;
                font-size: inherit;
                cursor: pointer;
                width: 40px;
                min-width: 40px;
                text-align: center;
                border-radius: 10px;
                transition: background-color 0.2s;

                &:hover {
                    background-color: #00000030;
                }
            }
        }

        & > button {
            margin: 0;
            margin-right: 10px;
        }
    }

    .content {
        margin: 10px 20px;
        margin-top: 70px;
    }
</style>