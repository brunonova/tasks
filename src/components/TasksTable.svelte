<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { fade, fly } from 'svelte/transition';
    import { flip } from 'svelte/animate';
    import { t } from "svelte-intl-precompile";
    import type Task from "../lib/Task";
    import { today, tomorrow } from "../lib/stores";
    import { priorities } from "../lib/utils";

    export let tasks: Task[];
    export let selectedTask: Task;
    export let draggable = false;
    let highlightIndex = -1;

    const dispatch = createEventDispatcher<{
        edit: Task,
        delete: Task,
        toggleComplete: Task,
        move: {fromIndex: number, toIndex: number},
        changePriority: {task: Task, priority: string},
    }>();

    function onDragStart(event: DragEvent, index: number) {
        event.dataTransfer.setData("task.index", index.toString());
        event.dataTransfer.dropEffect = "move";
    }

    function onDrop(event: DragEvent, index: number) {
        if(draggable && event.dataTransfer.getData("task.index")) {
            dispatch("move", {
                fromIndex: Number(event.dataTransfer.getData("task.index")),
                toIndex: index,
            });
        }
    }

    function changePriority(event: Event, task: Task) {
        dispatch("changePriority", {task, priority: (event.target as HTMLInputElement).value});
    }
</script>

<div>
    {#each tasks as task, index (task.id)}
        <div class="task-line priority-{task.priority}"
             class:completed={task.completed}
             class:highlighted={task === selectedTask || index === highlightIndex}
             {draggable}
             on:dragover="{(event) => draggable && event.preventDefault()}"
             on:dragstart="{(event) => onDragStart(event, index)}"
             on:drop|preventDefault="{(event) => onDrop(event, index)}"
             on:dragenter="{() => highlightIndex = index}"
             on:dragend="{() => highlightIndex = -1}"
             in:fade={{duration: 300}}
             out:fly={{x: -100, duration: 300, opacity: 0}}
             animate:flip={{duration: 300}}>
            <div class="task-text" title={$t("task.clickToComplete") + (task.notes ? ("\n\n" + task.notes) : "")} on:click={() => dispatch("toggleComplete", task)}>
                <span>{task.text}</span>
                {#if task.dueDate && !task.completed}
                    <div class="due" class:overdue={task.dueDate < $today} class:due-today={task.dueDate === $today} class:due-tomorrow={task.dueDate === $tomorrow}>
                        {$t("task.due")}: {task.dueDate}
                    </div>
                {/if}
            </div>
            {#if !task.completed}
                <div class="task-priority" title={$t("task.priority")}>
                    <select value={task.priority} class="priority-{task.priority}" on:change={(event) => changePriority(event, task)}>
                        {#each priorities as priority}
                            <option value={priority} class="priority-item priority-{priority}">{priority ? priority : "-"}</option>
                        {/each}
                    </select>
                </div>
            {/if}
            <div class="task-actions">
                <button type="button" class="icon-button" title={$t("edit")} on:click={() => dispatch("edit", task)}>
                    <i class="fa fa-pencil-alt"></i>
                </button>
                <button type="button" class="icon-button btn-danger" title={$t("delete")} on:click={() => dispatch("delete", task)}>
                    <i class="fa fa-trash"></i>
                </button>
            </div>
        </div>
    {/each}
</div>

<style lang="scss">
    .task-line {
        display: flex;
        flex-direction: row;
        align-items: stretch;
        transition: background-color 0.2s;

        &:not(:last-child) {
            border-bottom: solid 1px var(--color-border);
        }

        &:hover {
            background-color: var(--color-hover);
        }

        & > .task-text {
            display: flex;
            flex-direction: column;
            flex-grow: 1;
            justify-content: center;
            padding-left: 10px;
            cursor: pointer;

            .due {
                color: var(--color-font);
                font-size: 0.9em;
                font-weight: normal;

                &.overdue, &.due-today, &.due-tomorrow {
                    animation: blink 1.5s linear infinite;
                }
            }
        }

        &.completed .task-text {
            text-decoration: line-through;
            color: var(--color-disabled);
        }

        & > .task-priority select {
            background: none;
            border: none;
            min-width: 50px;
            height: 100%;
            cursor: pointer;

            &:hover {
                background: var(--color-hover);
            }

            & > option {
                background-color: var(--color-background);
            }
        }

        &.highlighted {
            background-color: var(--color-primary);
            color: #ffffff;

            select, .due {
                color: #ffffff !important;
            }
        }

        & > .task-actions {
            min-width: 90px;
            text-align: center;
        }
    }
</style>