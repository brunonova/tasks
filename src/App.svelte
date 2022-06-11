<script lang="ts">
    import { onMount } from "svelte";
    import { t, locale } from "svelte-intl-precompile";
    import { page } from "./lib/stores";
    import PreferencesPage from "./pages/PreferencesPage.svelte";
    import TasksPage from "./pages/TasksPage.svelte";

    onMount(() => {
        // Register the service worker in production
        if(process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
            navigator.serviceWorker.register("sw.js");
        };
    });
</script>

<svelte:head>
    <title>{$t("appName")}</title>

    <!-- Localized PWA manifest -->
    {#if $locale.toLowerCase().startsWith("pt")}
        <link rel="manifest" href="site.pt.webmanifest" />
    {:else}
        <link rel="manifest" href="site.webmanifest" />
    {/if}
</svelte:head>

{#if $page === "tasks"}
    <TasksPage />
{:else if $page == "preferences"}
    <PreferencesPage />
{/if}

<style global lang="scss">
    @import "./assets/global.scss";
</style>