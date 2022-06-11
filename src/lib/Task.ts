/*
    Todo.txt format:
    x (A) 2022-05-10 2022-05-01 Description of the task with a +project and a @context due:2022-05-10
    \/\__/\_________/\_________/                               \______/       \______/ \____________/
    a  b       c          d                                       f              g           h
                                \___________________________________________________________________/
                                                e
    a: Optional - marks completion.
    b: Optional - priority of the task [A-Z].
    c: Optional - completion date.
    d: Optional - creation date (required if completion date is specified).
    e: Description of the task, plus optional tags that can be placed anywhere in the description.
    f: Project tag (can have multiple projects).
    g: Context tag (can have multiple contexts).
    h: Special key/value tag (can have multiple tags).
*/

const DATE_REGEX = /[0-9]{4}-[0-9]{2}-[0-9]{2}/;
const PROJECTS_REGEX = /(^| )(\+[^ \s]+)/g;
const CONTEXTS_REGEX = /(^| )(\@[^ \s]+)/g;
const DUE_DATE_REGEX = /(^| )due:([0-9]{4}-[0-9]{2}-[0-9]{2})($| )/g;
const NOTES_REGEX = /(^| )notes:\[\[\[([^"]+)\]\]\]($| )/g;

/** A todo.txt task. */
export default class Task {
    /** Internal ID of the task. */
    id = Symbol("id");
    /** If the task is completed. */
    completed = false;
    /** Priority of the task (upper case letter from A to Z). */
    priority: string = "";
    /** Completion date. */
    completionDate?: string;
    /** Creation date. */
    creationDate?: string;
    /** Due date. */
    dueDate?: string;
    /** Multi-line notes. */
    notes?: string;
    /** Text of the task. */
    private _text: string = "";
    /** Project tags. */
    projects = new Set<string>();
    /** Context tags. */
    contexts = new Set<string>();


    /**
     * Creates a task .
     * @param text Text of the task (or full line of the task).
     */
    constructor(text?: string) {
        if(text) {
            this.text = text;
        }
    }

    /**
     * Loads the tasks from a string.
     * @param str The string.
     * @returns The tasks.
     */
    static loadFromString(str: string): Task[] {
        let tasks: Task[] = [];
        if(str) {
            const lines = str.split("\n");
            for(let line of lines) {
                if(line.length > 0) {
                    tasks.push(new Task(line));
                }
            }
        }
        return tasks;
    }

    /**
     * Saves the tasks to a string.
     * @param tasks The tasks.
     * @returns The string.
     */
    static saveToString(tasks: Task[]): string {
        let res = "";
        if(tasks) {
            for(let task of tasks) {
                res += task.toString() + "\n";
            }
        }
        return res;
    }


    /**
     * Parses a full line of a task.
     * @param line Full line of the task.
     */
    private parseTaskLine(line: string) {
        let i = 0;
        const len = line.length;

        // Check if completed
        if(len > i + 1 && line[i] === 'x' && line[i + 1] === ' ') {
            this.completed = true;
            i += 2;
        }

        // Check if it has priority
        if(len > i + 3 && line[i] === '(' && line[i + 1].match(/[A-Z]/) && line[i + 2] === ')' && line[i + 3] === ' ') {
            this.priority = line[i + 1];
            i += 4;
        }

        // Check if it has the 1st date (creation date, or completion date if
        // it's completed and has creation date)
        if(line.length > i + 11) {
            let sub = line.substring(i, i + 10);
            if(line[i + 10] === ' ' && sub.match(DATE_REGEX)) {
                this.creationDate = sub;
                i += 11;  // includes the next space

                // Check if it has the 2nd date (creation date, if it's completed)
                if(this.completed && line.length > i + 11) {
                    sub = line.substring(i, i + 10);
                    if(line[i + 10] === ' ' && sub.match(DATE_REGEX)) {
                        // There is a 2nd date, which means this one is the
                        // creation date and the previous ones is the completion date
                        this.completionDate = this.creationDate;
                        this.creationDate = sub;
                        i += 11;  // includes the next space
                    }
                }
            }
        }

        // Text of the task
        this._text = line.substring(i, len);

        // Search the text for projects and tags
        this.projects.clear();
        this.contexts.clear();
        for(let match of this._text.matchAll(PROJECTS_REGEX)) {
            this.projects.add(match[2]);
        }
        for(let match of this._text.matchAll(CONTEXTS_REGEX)) {
            this.contexts.add(match[2]);
        }

        // Search the text for due date
        for(let match of this._text.matchAll(DUE_DATE_REGEX)) {
            this.dueDate = match[2];
        }
        this._text = this._text.replace(DUE_DATE_REGEX, " ");

        // Search the text for notes
        for(let match of this._text.matchAll(NOTES_REGEX)) {
            this.notes = match[2].replace(/\\\]/g, "]").replace(/\\n/g, "\n");
        }
        this._text = this._text.replace(NOTES_REGEX, " ");
        this._text = this._text.trim();
    }

    public clone() {
        return new Task(this.toString());
    }


    /** Text of the task. */
    get text() {
        return this._text;
    }

    set text(value) {
        this.parseTaskLine(value);
    }


    /** Returns the full line of the task. */
    toString() {
        let line = "";
        if(this.completed) line += "x ";
        if(this.priority) line += `(${this.priority}) `;

        if(this.completionDate && this.completed && this.creationDate) line += `${this.completionDate} `;
        if(this.creationDate) line += `${this.creationDate} `
        line += this.text;

        if(this.dueDate) line += ` due:${this.dueDate}`;
        if(this.notes) {
            const replaced = this.notes.replace(/\]/g, "\\]").replace(/\n/g, "\\n");
            line += ` notes:[[[${replaced}]]]`;
        }

        return line;
    }
};