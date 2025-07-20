import { DeepReadonly } from "../../docs/docs";

export type TaskPriorityLevel = 0 | 1 | 2 | 3; // 0 = highest, 3 = lowest

/**
 * Represents a task to be managed in the prioritized task queue.
 * 
 * @template T The type of the result produced by the task's action.
 * @template K The shape of the metadata passed to the task's action.
 */
export interface BaseQueueTask<T = any, K extends Record<string, any> = Record<string, any>> {
    /**
     * A unique identifier for the task.
     * Can be generated via the queue manager's `generateTaskId()` method,
     * or provided by the user. Must be unique within the queue.
     */
    id?: string;

    /**
     * A string indicating the task's type or category.
     * Used for identification or filtering purposes.
     */
    type: string;

    /**
     * Task priority level, where 0 is the highest priority and 3 is the lowest.
     * Tasks with higher priority run before lower priority ones.
     * @default 3
     */
    priority?: TaskPriorityLevel;

    /**
     * An object containing metadata relevant to the task.
     * This data is passed as an argument to the `action` function,
     * providing context without requiring closures or binding.
     */
    metadata?: K;

    /**
     * The asynchronous function that performs the task's work.
     * Receives the task's metadata as an argument.
     * When resolved, the returned value will be passed to `onResolve`.
     * 
     * @param metadata The metadata object associated with this task.
     * @returns A promise resolving with a result of type `T`.
     */
    action: (metadata: DeepReadonly<K>) => T | Promise<T>;

    /**
     * Optional callback executed when the task's action resolves successfully.
     * Receives the resolved value from `action`.
     */
    onResolve?: (result: T) => any | Promise<any>;

    /**
     * Optional callback executed if the task's action rejects with an error.
     * Receives the error thrown by `action`.
     */
    onReject?: (error: Error) => any | Promise<any>;

    /** Optional callback executed when the task completes, regardless of success or failure. */
    onDone?: () => any | Promise<any>;
}

export interface InternalQueueTask extends BaseQueueTask {
    id: string;
    priority: TaskPriorityLevel;
    metadata: Record<string, any>;
}

/**
 * Configuration options for a `TasksQueue` instance.
 *
 * @property autoRun - (Optional) Determines whether the queue should start
 * processing tasks automatically as soon as they are added.
 * 
 * - If `true` (default), the queue begins processing immediately on each task addition.
 * - If `false`, you must call `.run()` manually to begin processing.
 *
 * @property concurrencyLimit - (Optional) The maximum number of tasks that can be
 * processed in parallel. Defaults to `1`, meaning tasks are processed sequentially.
 *
 * - Set a higher number to allow concurrent task execution.
 * - If set to `0` or a negative value, it will be treated as `1` internally.
 *
 * @example
 * ```ts
 * const queue = new TasksQueue({
 *   autoRun: false,
 *   concurrencyLimit: 5,
 * });
 *
 * queue.add(myTask);
 * await queue.run(); // Starts processing tasks manually
 * ```
 */
export interface TasksQueueOptions {
    /**
     * Whether to automatically start processing tasks
     * as soon as they are added to the queue.
     *
     * @default true
     *
     * If set to `false`, you must call `.run()` manually to start execution.
     */
    autoRun?: boolean;

    /**
     * The maximum number of tasks allowed to run concurrently.
     *
     * @default 1
     *
     * If not provided or set to `0` or a negative value, the queue defaults to sequential execution.
     * Increase this value to allow parallel processing.
     */
    concurrencyLimit?: number;
}

export interface AddTasksBaseOptions {
    /**
     * Whether to automatically start processing tasks
     * immediately after they are added to the queue in this call.
     * 
     * This option overrides the queue instance’s `autoRun` setting
     * only for this method invocation; it does **not** modify the queue's
     * global `autoRun` configuration.
     *
     * If set to `true`, the queue will start processing tasks right away,
     * regardless of the queue’s default `autoRun` value.
     *
     * @default false
     */
    autoRun?: boolean;
}