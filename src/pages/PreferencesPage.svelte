<script lang="ts">
    import { t } from "svelte-intl-precompile";
    import { moveCompletedTasksToBottom, saveCreationAndCompletionDates, sortTasks, theme } from "../lib/stores";
    import Layout from "./Layout.svelte";

    function onChangeMoveCompletedTasksToBottom(event: Event) {
        $moveCompletedTasksToBottom = (event.target as HTMLInputElement).value;
    }

    function onChangeSaveCreationAndCompletionDates(event: Event) {
        $saveCreationAndCompletionDates = (event.target as HTMLInputElement).value;
    }
</script>

<Layout title={$t("preferences")}>
    <div class="preferences">
        <div class="group">
            <h1>{$t("pref.appearance")}</h1>

            <div class="preference">
                <label for="theme">{$t("pref.theme.label")}</label>
                <select id="theme" bind:value={$theme}>
                    <option value="system">{$t("pref.theme.system")}</option>
                    <option value="light">{$t("pref.theme.light")}</option>
                    <option value="dark">{$t("pref.theme.dark")}</option>
                </select>
            </div>
        </div>

        <div class="group">
            <h1>{$t("pref.behavior")}</h1>

            <div class="preference">
                <label for="sortTasks">{$t("pref.sortTasks.label")}</label>
                <select id="sortTasks" bind:value={$sortTasks}>
                    <option value="auto">{$t("pref.sortTasks.auto")}</option>
                    <option value="manual">{$t("pref.sortTasks.manual")}</option>
                </select>
            </div>

            <div class="preference">
                <label for="moveCompletedTasksToBottom">{$t("pref.moveCompletedTasksToBottom")}</label>
                <select id="moveCompletedTasksToBottom" value={$moveCompletedTasksToBottom.toString()} on:change={onChangeMoveCompletedTasksToBottom}>
                    <option value="true">{$t("yes")}</option>
                    <option value="false">{$t("no")}</option>
                </select>
            </div>

            <div class="preference">
                <label for="saveCreationAndCompletionDates">{$t("pref.saveCreationAndCompletionDates")}</label>
                <select id="saveCreationAndCompletionDates" value={$saveCreationAndCompletionDates.toString()} on:change={onChangeSaveCreationAndCompletionDates}>
                    <option value="true">{$t("yes")}</option>
                    <option value="false">{$t("no")}</option>
                </select>
            </div>
        </div>
    </div>
</Layout>

<style lang="scss">
    .preferences {
        max-width: 800px;
        margin-left: auto;
        margin-right: auto;

        .group {
            padding: 10px;
            background-color: var(--color-area);
            box-shadow: 2px 2px 8px 2px #00000020;
            border-radius: 10px;
            margin-bottom: 20px;

            h1 {
                margin: -10px -10px 10px -10px;
                padding: 5px 10px;
                border-top-left-radius: 10px;
                border-top-right-radius: 10px;
                background: var(--color-area-title);
                font-size: 20px;
            }

            .preference {
                &:not(:last-child) {
                    margin-bottom: 15px;
                }

                label {
                    display: block;
                    font-size: 16px;
                    font-weight: bold;
                    margin-bottom: 5px;

                }
            }

        }
    }
</style>