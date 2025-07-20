import uuidX from "@nasriya/uuidx";
import { AddTasksBaseOptions, BaseQueueTask, InternalQueueTask, TaskPriorityLevel, TasksQueueOptions } from "./docs";
import recordsUtils from "../../domains/data-types/record/records-utils";
import objectUtils from "../../domains/data-types/object/objects-utils";
import valueIs from "../../valueIs";

/**
 * A general-purpose, prioritized task queue utility for managing and executing
 * asynchronous tasks with optional concurrency control and auto-start behavior.
 *
 * Tasks are processed based on their priority, and the queue can be configured
 * to either auto-run on task addition or wait until manually triggered.
 *
 * Supports lifecycle hooks such as `onResolve`, `onReject`, and `onDone`
 * for per-task handling.
 *
 * @example
 * // Basic usage with autoRun (default true)
 * const queue = new atomix.tools.TasksQueue();
 * 
 * queue.addTask({
 *     id: 'task-1',
 *     type: 'email',
 *     priority: 2,
 *     action: async () => {
 *         await sendEmail();
 *     },
 *     onResolve: () => console.log('Email sent!'),
 *     onReject: (err) => console.error('Failed to send email:', err)
 * });
 * 
 * await queue.untilComplete();
 * // All tasks have finished processing
 *
 * @example
 * // Usage with manual execution control
 * import { TasksQueue } from '@nasriya/atomix/tools';
 * 
 * const queue = new TasksQueue({ autoRun: false });
 * 
 * queue.addTask({ id: 'x', type: 'job', priority: 1, action: async () => doWork() });
 * 
 * await queue.run(); // Start processing tasks manually
 *
 * @since v1.0.2
 */
export class TasksQueue {
    readonly #_inProcess: Promise<any>[] = [];
    readonly #_flags = Object.seal({ isRunning: false });
    readonly #_signals = Object.seal({ pause: false });
    readonly #_queues: Map<TaskPriorityLevel, InternalQueueTask[]> = new Map([
        [0, []], [1, []], [2, []], [3, []],
    ]);

    readonly #_configs: Required<TasksQueueOptions> = {
        autoRun: false,
        concurrencyLimit: 1,
    }

    constructor(options?: TasksQueueOptions) {
        if (options !== undefined) {
            if (!valueIs.record(options)) { throw new TypeError(`Expected a record input but received ${typeof options}`) }

            if (recordsUtils.hasOwnProperty(options, 'autoRun')) {
                if (typeof options.autoRun !== 'boolean') { throw new TypeError(`Expected 'autoRun' to be a boolean but received ${typeof options.autoRun}`); }
                this.#_configs.autoRun = options.autoRun;
            }

            if (recordsUtils.hasOwnProperty(options, 'concurrencyLimit')) {
                if (typeof options.concurrencyLimit !== 'number') { throw new TypeError(`Expected 'concurrencyLimit' to be a number but received ${typeof options.concurrencyLimit}`); }
                this.#_configs.concurrencyLimit = options.concurrencyLimit;
            }
        }
    }

    /**
     * Retrieves the next task from the queues, with the highest priority queue
     * being searched first. If all queues are empty, returns undefined.
     * @returns the next task, or undefined if all queues are empty
     */
    #_getNextTasks(): InternalQueueTask[] {
        const priorityLevels: TaskPriorityLevel[] = [0, 1, 2, 3];
        const tasks: InternalQueueTask[] = [];
        const MAX = this.#_configs.concurrencyLimit;

        priorityLoop: for (const level of priorityLevels) {
            const queue = this.#_queues.get(level)!;
            while (queue.length > 0 && tasks.length < MAX) {
                tasks.push(queue.shift()!);
            }

            if (tasks.length === MAX) { break priorityLoop; }
        }

        return tasks;
    }

    /**
     * Returns true if there are any tasks in any of the queues, and false
     * otherwise.
     * @returns true if there are any tasks in any of the queues, and false
     * otherwise
     */
    #_hasNext(): boolean {
        for (const [_, queue] of this.#_queues) {
            if (queue.length > 0) { return true }
        }

        return false;
    }

    readonly #_stats = {
        total: 0,
        processed: 0,
        succeeded: 0,
        failed: 0,
        get pending() {
            return this.total - this.processed;
        }
    }

    readonly #_userHandlers = {
        onIdle: [] as (() => void)[],
    }

    readonly #_helpers = {
        id: {
            list: [] as string[],
            /**
             * Generates a unique identifier using the uuidX library. It ensures that 
             * the generated ID is not already present in the list of existing IDs 
             * before adding it to the list and returning it.
             * 
             * @returns {string} A unique identifier.
             */
            generate: (): string => {
                let attempts = 0
                let id = uuidX.v4();
                while (this.#_helpers.id.list.includes(id)) {
                    if (++attempts > 1000) throw new Error('Failed to generate a unique task ID');
                    id = uuidX.v4();
                }
                this.#_helpers.id.list.push(id);
                return id;
            },
            remove: (id: string) => {
                const index = this.#_helpers.id.list.indexOf(id);
                if (index !== -1) {
                    this.#_helpers.id.list.splice(index, 1);
                }
            }
        },
        logger: {
            taskCallbackError: (hook: 'onResolve' | 'onReject' | 'onDone' | 'onIdle', taskId: string, error: unknown) => {
                const err = error instanceof Error ? error : new Error(String(error));
                console.warn(`[TasksQueue] Task ${taskId} ${hook} handler threw an error: ${err.message}`);
                console.debug(err.stack);
            }
        },
        validateTask: (task: BaseQueueTask) => {
            if (!valueIs.record(task)) { throw new TypeError(`Task is expected to be a record, but got ${typeof task}`) }
            const hasOwnProperty = recordsUtils.hasOwnProperty.bind(recordsUtils);
            let id: string;

            if (hasOwnProperty(task, 'id')) {
                if (!valueIs.string(task.id)) { throw new TypeError(`Task.id is expected to be a string, but got ${typeof task.id}`) }
                if (task.id.length === 0) { throw new RangeError('Task.id is expected to be a non-empty string') }
                if (this.#_helpers.id.list.includes(task.id)) { throw new RangeError(`Task.id "${task.id}" is already in use`) }
                id = task.id;
            } else {
                id = this.generateTaskId();
            }

            if (hasOwnProperty(task, 'type')) {
                if (!valueIs.string(task.type)) { throw new TypeError(`Task.type is expected to be a string, but got ${typeof task.type}`) }
                if (task.type.length === 0) { throw new RangeError('Task.type is expected to be a non-empty string') }
            } else {
                throw new SyntaxError('Task.type is required and is missing');
            }

            if (hasOwnProperty(task, 'priority')) {
                if (!valueIs.number(task.priority)) { throw new TypeError(`Task.priority is expected to be a number, but got ${typeof task.priority}`) }
                if (task.priority < 0 || task.priority > 3) { throw new RangeError(`Task.priority is expected to be between 0 and 3, but got ${task.priority}`) }
            } else {
                task.priority = 3;
            }

            if (hasOwnProperty(task, 'action')) {
                if (typeof task.action !== 'function') { throw new TypeError(`Task.action is expected to be a function, but got ${typeof task.action}`) }
            } else {
                throw new SyntaxError('Task.action is required and is missing');
            }

            if (hasOwnProperty(task, 'onResolve')) {
                if (typeof task.onResolve !== 'function') { throw new TypeError(`Task.onResolve is expected to be a function, but got ${typeof task.onResolve}`) }
            }

            if (hasOwnProperty(task, 'onReject')) {
                if (typeof task.onReject !== 'function') { throw new TypeError(`Task.onReject is expected to be a function, but got ${typeof task.onReject}`) }
            }

            if (hasOwnProperty(task, 'onDone')) {
                if (typeof task.onDone !== 'function') { throw new TypeError(`Task.onDone is expected to be a function, but got ${typeof task.onDone}`) }
            }

            if (hasOwnProperty(task, 'metadata')) {
                if (!valueIs.record(task.metadata)) { throw new TypeError(`Task.metadata is expected to be a record, but got ${typeof task.metadata}`) }
            } else {
                task.metadata = {};
            }

            if (!this.#_helpers.id.list.includes(id)) {
                this.#_helpers.id.list.push(id);
            }
        }
    }

    readonly #_handlers = {
        onResolve: async (task: InternalQueueTask, userData: any) => {
            this.#_stats.succeeded++;

            // Run user onResolve callback
            try {
                await task?.onResolve?.(userData);
            } catch (callbackError) {
                if (typeof task.onReject === 'function') {
                    task.onReject(callbackError as any);
                    return;
                }

                this.#_helpers.logger.taskCallbackError('onResolve', task.id, callbackError);
            }
        },
        onReject: (task: InternalQueueTask, error: any) => {
            this.#_stats.failed++;

            // Run user onReject callback
            try {
                task?.onReject?.(error);
            } catch (callbackError) {
                this.#_helpers.logger.taskCallbackError('onReject', task.id, callbackError);
            }
        },
        onDone: async (task: InternalQueueTask) => {
            this.#_helpers.id.remove(task.id);
            this.#_stats.processed++;

            // Run user onDone callback
            try {
                await task?.onDone?.();
            } catch (callbackError) {
                if (typeof task.onReject === 'function') {
                    task.onReject(callbackError as any);
                    return;
                }

                this.#_helpers.logger.taskCallbackError('onDone', task.id, callbackError);
            }

            // Check if there are any more tasks to process
            if (this.#_stats.pending === 0) {
                this.#_handlers.onComplete();
            }
        },
        onComplete: () => {
            this.#_flags.isRunning = false;
            for (const callback of this.#_userHandlers.onIdle) {
                try {
                    callback();
                } catch (error) {
                    this.#_helpers.logger.taskCallbackError('onIdle', 'unknown', error);
                }
            }

            this.#_userHandlers.onIdle = [];
        }
    }

    readonly #_controller = {
        run: async () => {
            if (this.#_flags.isRunning) { return }
            this.#_flags.isRunning = true;

            try {
                while (this.#_signals.pause === false && this.#_hasNext()) {
                    const nextBatch = this.#_getNextTasks();

                    for (const task of nextBatch) {
                        const promise = (async () => {
                            try {
                                const result = await task.action(objectUtils.deepFreeze(task.metadata!));
                                await this.#_handlers.onResolve(task, result);
                            } catch (err) {
                                this.#_handlers.onReject(task, err);
                            } finally {
                                await this.#_handlers.onDone(task);
                            }
                        })();

                        this.#_inProcess.push(promise);
                    }

                    await Promise.allSettled(this.#_inProcess);
                    this.#_inProcess.length = 0;
                }
            } finally {
                this.#_flags.isRunning = false;
                if (this.#_signals.pause) { this.#_signals.pause = false }
            }
        },
        pause: async () => {
            if (this.#_signals.pause) { return }
            this.#_signals.pause = true;
            await this.untilComplete();
        },
        cancelPending: async () => {
            await this.untilComplete();
            this.#_signals.pause = true;
            for (const list of this.#_queues.values()) {
                list.length = 0;
            }
        }
    }

    /**
     * Cancels all pending tasks that have not started yet and waits for
     * the currently running task to complete before resolving.
     * 
     * After calling this method, the queue remains operational: you can
     * still add new tasks and start processing them.
     * 
     * Use this method to immediately stop processing queued tasks while
     * allowing the current task to finish gracefully.
     *
     * @returns {Promise<void>} A promise that resolves once the queue is
     *   paused and all pending tasks are cleared.
     * @since v1.0.16
     */
    cancelPending(): Promise<void> {
        return this.#_controller.cancelPending();
    }

    /**
     * Pauses the queue after the currently running task finishes.
     * Pending tasks remain in the queue and can be resumed later.
     * 
     * @returns A promise that resolves when the queue is successfully paused.
     * @since v1.0.16
     */
    pause(): Promise<void> {
        return this.#_controller.pause();
    }

    /**
     * Starts or resumes the queue execution.
     * If the queue is already running, this method returns a promise that resolves
     * when the current batch of tasks completes.
     * 
     * @returns A promise that resolves when all currently queued tasks have been processed.
     * @since v1.0.16
     */
    run(): Promise<void> {
        this.#_controller.run();
        return this.untilComplete();
    }

    /**
     * Generates and returns a unique task identifier.
     * Utilizes an internal helper to ensure that the ID is not already in use.
     * 
     * @returns A unique task identifier.
     * @since v1.0.2
     */
    generateTaskId(): string {
        return this.#_helpers.id.generate();
    }

    /**
     * Adds a task to the task queue. Tasks are added to one of four queues, based on their priority.
     * The task is validated before being added to the queue, so ensure that the task object is properly
     * configured before calling this method.
     * 
     * @param task - The task to be added to the queue.
     * @since v1.0.2
     */
    addTask(task: BaseQueueTask<any, any>, options?: AddTasksBaseOptions) {
        const configs: Required<AddTasksBaseOptions> = {
            autoRun: false,
        }

        this.#_helpers.validateTask(task);
        if (options !== undefined) {
            if (!valueIs.record(options)) { throw new TypeError(`Expected a record input but received ${typeof options}`) }

            if (recordsUtils.hasOwnProperty(options, 'autoRun')) {
                if (typeof options.autoRun !== 'boolean') { throw new TypeError(`Expected 'autoRun' to be a boolean but received ${typeof options.autoRun}`); }
                configs.autoRun = options.autoRun
            }
        }

        this.#_queues.get(task.priority ?? 3)!.push(task as InternalQueueTask);
        this.#_stats.total++;

        if (this.#_configs.autoRun || configs.autoRun) { this.#_controller.run() }

        return this;
    }

    /**
     * Adds multiple tasks to the task queue. Tasks are added to one of four queues, based on their priority.
     * The tasks are validated before being added to the queue, so ensure that each task object is properly
     * configured before calling this method.
     * 
     * @param tasks - An array of tasks to be added to the queue.
     * @since v1.0.2
     */
    bulkAddTasks(tasks: BaseQueueTask[], options?: AddTasksBaseOptions) {
        const configs: Required<AddTasksBaseOptions> = {
            autoRun: false,
        }

        tasks.forEach(task => this.#_helpers.validateTask(task));
        if (options !== undefined) {
            if (!valueIs.record(options)) { throw new TypeError(`Expected a record input but received ${typeof options}`) }

            if (recordsUtils.hasOwnProperty(options, 'autoRun')) {
                if (typeof options.autoRun !== 'boolean') { throw new TypeError(`Expected 'autoRun' to be a boolean but received ${typeof options.autoRun}`); }
                configs.autoRun = options.autoRun
            }
        }

        tasks.forEach(task => this.#_queues.get(task.priority ?? 3)!.push(task as InternalQueueTask));
        this.#_stats.total += tasks.length;

        if (this.#_configs.autoRun || configs.autoRun) { this.#_controller.run() }

        return this;
    }

    /**
     * Waits for all tasks in the task queue to finish processing. Returns a promise that is resolved
     * once all tasks have been processed and the queue is idle. This method is useful for unit testing and
     * other cases where you need to wait for all tasks to finish before proceeding.
     * 
     * @returns A promise that resolves once the queue is idle.
     * @since v1.0.2
     */
    untilComplete(): Promise<void> {
        return new Promise(resolve => {
            if (this.#_stats.pending === 0) { return resolve(); }
            this.#_userHandlers.onIdle.push(resolve);
        });
    }

    /**
     * Checks if a task with the given ID exists in the queue.
     * @param id - The ID of the task to check for.
     * @returns true if the task exists in the queue, false otherwise.
     * @since v1.0.6
     */
    hasTask(id: string): boolean {
        return this.#_helpers.id.list.includes(id);
    }

    /**
     * Retrieves a frozen copy of the current task queue statistics.
     * 
     * @returns A frozen record containing the current task queue statistics.
     * @since v1.0.2
     */
    get stats() {
        const cloned = objectUtils.smartClone(this.#_stats);
        return recordsUtils.deepFreeze(cloned);
    }

    /**
     * Indicates whether the task queue is currently processing tasks.
     * 
     * @returns A boolean that is true if the queue is active, false otherwise.
     * @since v1.0.16
     */
    get isRunning() { return this.#_flags.isRunning }

    /**
     * Retrieves the autoRun flag of the task queue. When set to true, the queue will automatically
     * start processing tasks as soon as they are added. When set to false, tasks must be started
     * manually with the `run()` method.
     * 
     * @returns The autoRun flag of the task queue.
     * @since v1.0.16
     */
    get autoRun() { return this.#_configs.autoRun }

    /**
     * Sets the autoRun flag for the task queue.
     * 
     * When set to true, the queue will automatically begin processing tasks
     * as soon as they are added. If set to false, tasks will remain in the
     * queue and must be started manually using the `run()` method.
     * 
     * @param value - A boolean indicating whether the queue should start
     * processing tasks automatically.
     * @throws TypeError if the provided value is not a boolean.
     * @since v1.0.16
     */
    set autoRun(value: boolean) {
        if (typeof value !== 'boolean') { throw new TypeError(`Expected 'autoRun' to be a boolean but received ${typeof value}`); }
        this.#_configs.autoRun = value
    }

    /**
     * Retrieves the concurrency limit for the task queue.
     * 
     * The concurrency limit controls the maximum number of tasks that can
     * be processed concurrently. If set to 1, tasks are processed
     * sequentially. If set to a number greater than 1, up to that many
     * tasks are processed in parallel. If set to 0, the concurrency limit
     * is treated as 1.
     * 
     * @returns The concurrency limit of the task queue.
     * @since v1.0.16
     */
    get concurrencyLimit() { return this.#_configs.concurrencyLimit }

    /**
     * Sets the concurrency limit for the task queue.
     * 
     * This limit defines the maximum number of tasks that can be processed
     * concurrently. The provided value must be a positive integer. If the value
     * is not a number, integer, or positive, an error is thrown.
     * 
     * @param value - A positive integer representing the maximum number of
     * concurrent tasks allowed.
     * @throws {TypeError} If the provided value is not a number.
     * @throws {RangeError} If the provided value is not an integer or is not
     * greater than zero.
     * @since v1.0.16
     */
    set concurrencyLimit(value: number) {
        if (!valueIs.number(value)) { throw new TypeError(`Expected 'concurrencyLimit' to be a number but received ${typeof value}`); }
        if (!valueIs.integer(value)) { throw new RangeError(`Expected 'concurrencyLimit' to be an integer but received ${value}`); }
        if (!valueIs.positiveNumber(value)) { throw new RangeError(`Expected 'concurrencyLimit' to be a positive number but received ${value}`); }
        this.#_configs.concurrencyLimit = value;
    }
}

export default TasksQueue;