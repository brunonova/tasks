<script lang="ts">
    import { t } from "svelte-intl-precompile";
    import { onMount } from "svelte";
    import { moveCompletedTasksToBottom, page, saveCreationAndCompletionDates, sortTasks } from "../lib/stores";
    import { today } from "../lib/stores";
    import Task from "../lib/Task";
    import TasksTable from "../components/TasksTable.svelte";
    import Dropdown from "./Dropdown.svelte";
    import Layout from "./Layout.svelte";
    import EditTask from "../components/EditTask.svelte";

    let mounted = false;
    onMount(() => { mounted = true; });
    const isMounted = () => mounted;

    let tasks = loadTasks();
    $: {
        // Saves the tasks when changed (skip execution when first mounted)
        if(isMounted()) {
            tasks;  // so Svelte sees that "tasks" is a dependency
            saveTasks();
        }
    }

    let selectedTask: Task;
    let editingTask: Task;
    let isNewTask = false;

    let searching = false;
    let searchText = "";
    $: displayTasks = sorted(tasks.filter(t => !searching || t.text.toUpperCase().includes(searchText.toUpperCase())));

    $: projects = sortedArrayNoDuplicates(tasks.reduce((list, task) => [...list, ...task.projects], <string[]>[]));
    $: contexts = sortedArrayNoDuplicates(tasks.reduce((list, task) => [...list, ...task.contexts], <string[]>[]));

    /** Loads the tasks from persistent storage. */
    function loadTasks() {
        return Task.loadFromString(localStorage.getItem("todo") ?? "");
    }

    /** Saves the tasks to persistent storage. */
    function saveTasks() {
        localStorage.setItem("todo", Task.saveToString(tasks));
    }

    /** Returns the given array sorted and without duplicates. */
    function sortedArrayNoDuplicates<T>(array: T[]): T[] {
        return [...new Set(array)].sort();
    }

    /** Sorts the tasks, if applicable, according to the user preferences. */
    function sorted(array: Task[]) {
        if($sortTasks === "auto") {
            return array.slice().sort((a, b) => {
                if($moveCompletedTasksToBottom && a.completed != b.completed) {
                    return a.completed ? 1 : -1;
                } else if(a.priority !== b.priority && (!a.completed && !b.completed)) {
                    const pa = a.priority ? a.priority : "z";  // z > Z
                    const pb = b.priority ? b.priority : "z";
                    return pa > pb ? 1 : -1;
                } else if(a.dueDate && !b.dueDate) {
                    return -1;
                } else if(!a.dueDate && b.dueDate) {
                    return 1;
                } else if(a.dueDate !== b.dueDate) {
                    return (a.dueDate < b.dueDate) ? -1 : 1;
                } else {
                    const ta = a.text.toUpperCase();
                    const tb = b.text.toUpperCase();
                    if(ta === tb) {
                        return 0;
                    } else if(ta > tb) {
                        return 1;
                    } else {
                        return -1;
                    }
                }
            });
        } else {
            return array;
        }
    }

    /** Creates a new task. */
    function newTask() {
        selectedTask = editingTask = new Task();
        isNewTask = true;
    }

    /** Edits the specified task. */
    function editTask(task: Task) {
        selectedTask = task;
        editingTask = task.clone();
        isNewTask = false;
    }

    /** Toggles the specified task's completed status. */
    function toggleComplete(task: Task) {
        task.completed = !task.completed;
        task.completionDate = (task.completed && $saveCreationAndCompletionDates) ? $today : "";
        if(task.completed && $moveCompletedTasksToBottom) moveTaskToBottom(task);
        tasks = tasks;
        if(!isNewTask && selectedTask && editingTask && selectedTask.id === task.id) {
            // It's the task being edited
            editingTask.completed = task.completed;
            if($saveCreationAndCompletionDates) {
                editingTask.completionDate = task.completionDate
            }
        }
    }

    /** Saves the specified task. */
    function saveTask(task: Task) {
        if(isNewTask) {
            if($saveCreationAndCompletionDates) {
                task.creationDate = $today;
                if(task.completed) task.completionDate = $today;
            }
            if($moveCompletedTasksToBottom && tasks.length > 0) {
                // Save new task after the last uncompleted task
                let found = false;
                for(let i = tasks.length - 1; i >= 0; i--) {
                    if(!tasks[i].completed) {
                        tasks.splice(i + 1, 0, task);
                        found = true;
                        break;
                    }
                }
                if(!found) {
                    tasks.splice(0, 0, task);
                }
                tasks = tasks;
            } else {
                // Save new task to the bottom
                tasks = [...tasks, task];
            }
        } else {
            let completed = false;
            if(selectedTask && selectedTask.completed !== task.completed) {
                task.completionDate = (task.completed && $saveCreationAndCompletionDates) ? $today : "";
                if(task.completed) completed = true;
            }

            task.id = selectedTask.id;
            const index = getTaskIndex(task.id);
            if(index >= 0) {
                tasks[index] = task;
            }
            if(completed && $moveCompletedTasksToBottom) moveTaskToBottom(task);
        }
        selectedTask = editingTask = null;
    }

    /** Moves the specified task to the bottom. */
    function moveTaskToBottom(task: Task) {
        const index = getTaskIndex(task.id);
        tasks.splice(index, 1);
        tasks = [...tasks, task];
    }

    /** Deletes the currently selected task (after confirmation). */
    function deleteSelectedTask() {
        if(selectedTask && confirm($t("deleteConfirm"))) {
            tasks = tasks.filter((task) => task.id !== selectedTask.id);
            selectedTask = editingTask = null;
        }
    }

    /** Deletes the specified task (after confirmation). */
    function deleteTask(task: Task) {
        const index = getTaskIndex(task.id);
        if(index >= 0 && confirm($t("deleteConfirm"))) {
            tasks.splice(index, 1);
            tasks = tasks;
            selectedTask = editingTask = null;
        }
    }

    /** Deletes all completed tasks. */
    function deleteCompletedTasks() {
        if(confirm($t("deleteCompletedTasksConfirm"))) {
            tasks = tasks.filter((task) => !task.completed);
        }
    }

    /** Moves a task to another position. */
    function moveTask(fromIndex: number, toIndex: number) {
        if(toIndex !== fromIndex) {
            tasks.splice(toIndex, 0, ...tasks.splice(fromIndex, 1));
            tasks = tasks;
        }
    }

    /** Moves the selected task up or down. */
    function moveSelectedTask(change: number) {
        if(selectedTask) {
            const index = getTaskIndex(selectedTask.id);
            if(index >= 0) {
                moveTask(index, index + change);
            }
        }
    }

    /** Changes the priority of the task. */
    function changePriority(task: Task, priority: string) {
        task.priority = priority;
        tasks = tasks;

        if(!isNewTask && selectedTask && editingTask && selectedTask.id === task.id) {
            // It's the task being edited
            editingTask.priority = task.priority;
        }
    }

    /** Gets the index of the task with the specified ID. */
    function getTaskIndex(id: symbol) {
        for(let i = 0; i < tasks.length; i++) {
            let t = tasks[i];
            if(t.id === id) {
                return i;
            }
        }
        return -1;
    }

    /** Toggles search on or off. */
    function toggleSearch() {
        searching = !searching;
        searchText = "";
        if(searching) {
            document.getElementById("searchBox").focus();
        }
    }

    /** Imports the tasks from a file. */
    async function importFromFile(event: Event) {
        if(confirm($t("importFromFileConfirm"))) {
            const files = (event.target as HTMLInputElement).files;
            if(files && files.length > 0) {
                try {
                    const text = await files[0].text();
                    tasks = Task.loadFromString(text);
                } catch(err) {
                    alert(err);
                }
            }
        }
    }

    /** Exports the tasks to a file. */
    function exportToFile() {
        const blob = new Blob([Task.saveToString(tasks)], {type: "text/plain"});
        const url = URL.createObjectURL(blob);

        const a = document.getElementById("downloadTasks") as HTMLAnchorElement;
        a.href = url;
        a.download = "todo.txt";
        a.click();
        URL.revokeObjectURL(url);
    }

    /** Handles keyboard shortcuts. */
    function keyboardShortcuts(event: KeyboardEvent) {
        const key = event.key.toUpperCase();
        if(key === "F" && event.ctrlKey) {
            // Shortcut to toggle search
            toggleSearch();
            event.preventDefault();
        } else if(key === "+" && event.ctrlKey && !editingTask && !searching) {
            // Shortcut to create new task
            newTask();
            event.preventDefault();
        } else if(!searching && !editingTask && !event.ctrlKey && !event.altKey && key.match(/^[a-zA-Z0-9+@]$/)) {
            // Type to search (if not editing a task)
            toggleSearch();
        }
    }
</script>

<svelte:window on:keydown={keyboardShortcuts} />

<!-- svelte-ignore a11y-missing-attribute -->
<Layout title={$t("tasks")}>
    <!-- Hidden button for file downloads -->
    <a id="downloadTasks" style="display:none">Download</a>

    <!-- Hidden input for file uploads -->
    <input id="uploadTasks" type="file" accept=".txt" style="display:none" on:change={importFromFile} />

    <svelte:fragment slot="actions">
        <input id="searchBox"
               type="text"
               list="projectsAndTags"
               placeholder={$t("search")}
               class="search-box"
               class:searching
               bind:value={searchText}
               on:keydown={(event) => {if(event.key === "Escape" && searching){event.preventDefault(); toggleSearch();}}} />
        <datalist id="projectsAndTags">
            {#each projects as project}
                <option value={project} />
            {/each}
            {#each contexts as context}
                <option value={context} />
            {/each}
        </datalist>

        <button type="button" title="{$t('search')} (Ctrl+F)" on:click={toggleSearch}>
            <i class="fa fa-search"></i>
        </button>
        <button type="button" title="{$t('task.new')} (Ctrl++)" on:click={newTask}>
            <i class="fa fa-plus"></i>
        </button>
        <Dropdown icon="fa fa-ellipsis-v" title={$t("moreOptions")}>
            <a on:click={deleteCompletedTasks}>{$t("deleteCompletedTasks")}</a>
            <hr />
            <a on:click={() => document.getElementById('uploadTasks').click()}>{$t("importFromFile")}</a>
            <a on:click={exportToFile}>{$t("exportToFile")}</a>
            <hr />
            <a on:click={() => page.push("preferences")}>{$t("preferences")}</a>
        </Dropdown>
    </svelte:fragment>

    <div class="container" class:editing={editingTask}>
        <div class="tasks-panel">
            <TasksTable tasks={displayTasks}
                        selectedTask={selectedTask}
                        draggable={$sortTasks === "manual"}
                        on:toggleComplete={(event) => toggleComplete(event.detail)}
                        on:edit={(event) => editTask(event.detail)}
                        on:delete={(event) => deleteTask(event.detail)}
                        on:move={(event) => moveTask(event.detail.fromIndex, event.detail.toIndex)}
                        on:changePriority={(event) => changePriority(event.detail.task, event.detail.priority)} />
        </div>
        <div class="edit-panel">
            {#if editingTask}
                <EditTask
                    task={editingTask}
                    isNewTask={isNewTask}
                    on:cancel={() => selectedTask = editingTask = undefined}
                    on:save={(event) => saveTask(event.detail)}
                    on:delete={deleteSelectedTask}
                    on:moveUp={() => moveSelectedTask(-1)}
                    on:moveDown={() => moveSelectedTask(+1)} />
            {/if}
        </div>
    </div>
</Layout>

<style lang="scss">
    /* Bigger screens */
    :global(.header) :global(.actions) .search-box {
        margin: 0;
        width: 0;
        min-width: 0;
        max-width: 0;
        padding: 0;
        opacity: 0;
        pointer-events: none;
        background: transparent;
        border: none;
        color: #FFFFFF;
        border-bottom: solid 3px #FFFFFF;
        border-radius: 0;
        font-size: 20px;
        outline: none;
        transition: all 0.2s;

        &::placeholder {
            color: #FFFFFF80;
        }

        &.searching {
            width: 300px;
            max-width: 50vw;
            padding: 5px;
            opacity: 1;
            pointer-events: all;
        }
    }

    .container {
        display: flex;
        min-height: calc(100vh - 80px);

        & > * {
            flex: 1;
        }

        & > .tasks-panel {
            transition: all 0.3s;
        }

        & > .edit-panel {
            padding-left: 0;
            flex: 0.000001;
            opacity: 0;
            border-left: solid 1px var(--color-border);
            transition: all 0.3s;

            & :global(form) {
                position: sticky;
                top: 70px;
            }
        }
        &.editing > .tasks-panel {
            padding-right: 20px;
        }
        &.editing > .edit-panel {
            flex: 1;
            opacity: 1;
            padding-left: 20px;
        }
    }

    /* Smaller screens*/
    @media(max-width: 800px) {
        .container {
            & > .edit-panel {
                width: 0;
                flex: 0.000001;
                opacity: 0;
                border-left: none;

                & :global(form) {
                    position: static;
                }
            }

            &.editing {
                & > .tasks-panel {
                    width: 0;
                    flex: 0.000001;
                    opacity: 0;
                    padding-right: 0;
                    max-height: calc(100vh - 80px);
                    overflow: hidden;
                }

                & > .edit-panel {
                    width: auto;
                    flex: 1;
                    opacity: 1;
                    padding-left: 0;
                }
            }
        }
    }
</style>