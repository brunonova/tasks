<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
    import { t } from "svelte-intl-precompile";
    import { fade } from "svelte/transition";
    import { sortTasks, today, tomorrow } from "../lib/stores";
    import type Task from "../lib/Task";
    import { priorities } from "../lib/utils";

    export let task: Task;
    export let isNewTask = false;

    let lastTaskId: symbol;  // to check if the task instance has changed
    let text: string;
    let textInput: HTMLElement;

    const dispatch = createEventDispatcher<{
        cancel: void,
        save: Task,
        delete: void,
        moveUp: void,
        moveDown: void,
    }>();

    $: {
        if(task && task.id !== lastTaskId) {
            text = task.text;
            lastTaskId = task.id;
            if(textInput) {
                textInput.focus();
            }
        }
    }

    onMount(() => {
        textInput.focus();
    });

    function saveTask() {
        if(task && text) {
            task.text = text;
            dispatch("save", task);
        }
    }

    /** Handles keyboard shortcuts. */
    function keyboardShortcuts(event: KeyboardEvent) {
        if(task && event.key === "Enter" && event.ctrlKey) {
            event.preventDefault();
            saveTask();
        }
    }
</script>

<svelte:window on:keydown={keyboardShortcuts} />

<form on:submit|preventDefault={saveTask}
      on:keydown={(event) => event.key === "Escape" && dispatch("cancel")}
      transition:fade={{duration: 300}}>
    <button type="button" class="icon-button close-button" on:click={() => dispatch("cancel")}>
        <i class="fa fa-times"></i>
    </button>
    <h1>{isNewTask ? $t("task.new") : $t("task.edit")}</h1>

    <div class="row">
        <input
            bind:this={textInput}
            type="text"
            bind:value={text}
            placeholder={$t("task.textPlaceholder")}
            required={true} />
    </div>

    <div class="row">
        <div>
            <label for="priority">{$t("task.priority")}:</label>
            <select id="priority" bind:value={task.priority} class="priority-{task.priority}">
                {#each priorities as priority}
                    <option value={priority} class="priority-item priority-{priority}">{priority ? priority : "-"}</option>
                {/each}
            </select>
        </div>

        <div>
            <input id="done" type="checkbox" bind:checked={task.completed} />
            <label for="done">{$t("task.done")}</label>
        </div>
    </div>

    <div class="row">
        <div class="flex-control">
            <label for="dueDate">{$t("task.dueDate")}:</label>
            <input type="date" pattern="yyyy-MM-dd" bind:value={task.dueDate} style="width:auto" class:overdue={task.dueDate < $today} class:due-today={task.dueDate === $today} class:due-tomorrow={task.dueDate === $tomorrow} />
        </div>
    </div>

    <div class="row">
            <label for="notes">{$t("task.notes")}:</label><br />
            <textarea bind:value={task.notes} rows="5"></textarea>
    </div>

    {#if task.creationDate || task.completionDate}
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <div class="row">
            {#if task.creationDate}
                <div class="thin">
                    <label>{$t("task.created")}:</label>
                    <span>{task.creationDate}</span>
                </div>
            {/if}

            {#if task.completionDate}
                <div class="thin">
                    <label>{$t("task.completed")}:</label>
                    <span>{task.completionDate}</span>
                </div>
            {/if}
        </div>
    {/if}

    {#if $sortTasks === "manual" && !isNewTask}
        <div class="row">
            <div class="buttons">
                <button type="button" class="btn btn-secondary" on:click={() => dispatch("moveUp")}><i class="fa fa-arrow-up"></i> {$t("task.moveUp")}</button>
                <button type="button" class="btn btn-secondary" on:click={() => dispatch("moveDown")}><i class="fa fa-arrow-down"></i> {$t("task.moveDown")}</button>
            </div>
        </div>
    {/if}

    <div class="action-buttons">
        <button type="submit" class="btn btn-primary" title="{$t("save")} (Ctrl+Enter)"><i class="fa fa-check"></i> {$t("save")}</button>
        <button type="button" class="btn btn-secondary" on:click={() => dispatch("cancel")}>{$t("cancel")}</button>
        {#if !isNewTask}
            <button type="button" class="btn btn-danger" on:click={() => dispatch("delete")}><i class="fa fa-trash"></i> {$t("delete")}</button>
        {/if}
    </div>
</form>

<style lang="scss">
    .close-button {
        float: right;
        font-size: 20px;
        width: 40px;
        height: 40px;
        line-height: 40px;
    }

    h1 {
        margin-top: 0;
        font-size: 20px;
        line-height: 40px;
        margin-bottom: 10px;
    }

    .row {
        margin-bottom: 20px;
        font-size: 16px;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;

        label {
            padding-right: 5px;
        }

        select {
            width: auto;
        }

        .flex-control {
            display: flex;
            align-items: center;

            & > :first-child {
                white-space: nowrap;
            }
            & > :last-child {
                flex-grow: 1;
            }
        }
    }

    .action-buttons .btn-danger {
        margin-left: auto;
    }
</style>