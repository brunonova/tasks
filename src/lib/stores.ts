import { derived, writable } from "svelte/store";
import { dateToString } from "./utils";


function createPref<T extends string>(name: string, defaultValue: T) {
    const store = writable<T>((localStorage.getItem(name) ?? defaultValue) as T);
    return {
        subscribe: store.subscribe,
        set(val: T) {
            store.set(val);
            localStorage.setItem(name, val);
        }
    }
}

function createBooleanPref(name: string, defaultValue: boolean) {
    const store = writable<boolean>((localStorage.getItem(name) ?? defaultValue.toString()) === "true");
    return {
        subscribe: store.subscribe,
        set(val: boolean | string) {
            if(typeof(val) === "string") {
                store.set(val === "true");
            } else {
                store.set(val);
            }
            localStorage.setItem(name, val.toString());
        }
    }
}


function createToday() {
    const getDate = () => dateToString(new Date());
    const store = writable<string>(getDate());

    setTimeout(() => {
        store.set(getDate());
    }, 60000);

    return {
        subscribe: store.subscribe,
    };
}

/** Today's date as a string. Refreshes every minute. */
export const today = createToday();

/** Tomorrow's date as a string. Refreshes every minute. */
export const tomorrow = derived(today, (date) => {
    const d = new Date(date);
    return dateToString(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1));
});


type PageType = "tasks" | "preferences";
function createPage() {
    const store = writable<PageType>("tasks");
    const stack: PageType[] = ["tasks"];

    return {
        subscribe: store.subscribe,
        push(val: PageType) {
            stack.push(val);
            store.set(val);
        },
        pop() {
            if(this.hasPrevious()) {
                stack.pop();
                store.set(stack[stack.length - 1]);
            }
        },
        hasPrevious: () => stack.length > 1,
    };
}

/** The current page (use push() and pop() methods to navigate). */
export const page = createPage();


type Theme = "system" | "light" | "dark";
function createTheme() {
    const initialTheme = (localStorage.getItem("theme") ?? "system") as Theme;
    const store = writable<Theme>(initialTheme);
    applyTheme(initialTheme);

    function applyTheme(theme: Theme) {
        document.body.classList.remove("dark");
        document.body.classList.remove("light");
        if(theme === "light" || theme === "dark") {
            document.body.classList.add(theme);
        }
    }

    return {
        subscribe: store.subscribe,
        set(val: Theme) {
            store.set(val);
            applyTheme(val);
            localStorage.setItem("theme", val);
        },
    }
}

/** Current theme. */
export const theme = createTheme();


/** Sort tasks automatically or manually. */
export const sortTasks = createPref<"manual" | "auto">("sortTasks", "auto");

/** Move completed tasks to the bottom? */
export const moveCompletedTasksToBottom = createBooleanPref("moveCompletedTasksToBottom", true);

/** Save creation and completion dates? */
export const saveCreationAndCompletionDates = createBooleanPref("saveCreationAndCompletionDates", true);