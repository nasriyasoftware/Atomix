import recordsUtils from "../../domains/data-types/record/records-utils";
import commonUtils from "../../domains/utils/utils";
import valueIs from "../../valueIs";
import TasksQueue from "./TasksQueue";
import { AdaptiveTaskQueueOptions, AddTasksBaseOptions, BaseQueueTask } from "./docs";

export class AdaptiveTaskQueue extends TasksQueue {
    #_addedSinceLast = 0;
    readonly #_rateWindow: number[] = [];
    readonly #_adjustRate;
    readonly #_eventHandlers = {
        userHandlers: { onConcurrencyUpdate: null as ((rps: number) => void) | null },
        internalHandlers: {
            onConcurrencyUpdate: (rps: number) => {
                this.#_eventHandlers.userHandlers.onConcurrencyUpdate?.(rps);
            }
        },
    }

    readonly #_configs = Object.seal({
        /** RPS calculation window */
        windowDurationMs: 1_000,
        /** Delay before recalculating concurrency */
        recalcDebounce: 200,
        concurrencyLimit: 50
    });

    readonly #_helpers = {
        trackRate: () => {
            const now = Date.now();
            this.#_rateWindow.push(now);

            // Trim old values outside the window
            while (this.#_rateWindow.length && this.#_rateWindow[0] < now - this.#_configs.windowDurationMs) {
                this.#_rateWindow.shift();
            }

            if (this.#_rateWindow.length > 100_000) {
                this.#_rateWindow.splice(0, this.#_rateWindow.length - 100_000);
            }

            this.#_addedSinceLast++;
        },

        determineConcurrency: () => {
            const rps = this.rps;
            if (rps >= 10_000) { return 1000 }
            if (rps > 7_000) { return 800 }
            if (rps > 5_000) { return 500 }
            if (rps > 1_000) { return 200 }
            return 100;
        },

        adjustConcurrency: () => {
            if (this.#_addedSinceLast === 0) { return }

            const newLimit = this.#_helpers.determineConcurrency();
            if (super.concurrencyLimit !== newLimit) {
                super.concurrencyLimit = newLimit;
                this.#_eventHandlers.internalHandlers.onConcurrencyUpdate(newLimit);
            }

            this.#_addedSinceLast = 0;
        }
    }

    constructor(options?: AdaptiveTaskQueueOptions) {
        super(options);

        if (options !== undefined) {
            if (recordsUtils.hasOwnProperty(options, 'windowDurationMs')) {
                const windowDurationMs = options.windowDurationMs;
                if (!valueIs.number(windowDurationMs)) { throw new TypeError(`Expected 'windowDurationMs' to be a number but received ${typeof windowDurationMs}`); }
                if (!valueIs.integer(windowDurationMs)) { throw new TypeError(`Expected 'windowDurationMs' to be an integer but received ${typeof windowDurationMs}`); }
                if (!valueIs.positiveNumber(windowDurationMs)) { throw new RangeError(`Expected 'windowDurationMs' to be a positive number but received ${typeof windowDurationMs}`); }
                this.#_configs.windowDurationMs = windowDurationMs;
            }

            if (recordsUtils.hasOwnProperty(options, 'recalcDebounce')) {
                const recalcDebounce = options.recalcDebounce;
                if (!valueIs.number(recalcDebounce)) { throw new TypeError(`Expected 'recalcDebounce' to be a number but received ${typeof recalcDebounce}`); }
                if (!valueIs.integer(recalcDebounce)) { throw new TypeError(`Expected 'recalcDebounce' to be an integer but received ${typeof recalcDebounce}`); }
                if (!valueIs.positiveNumber(recalcDebounce)) { throw new RangeError(`Expected 'recalcDebounce' to be a positive number but received ${typeof recalcDebounce}`); }
                this.#_configs.recalcDebounce = recalcDebounce;
            }
        }

        this.#_adjustRate = commonUtils.throttle(this.#_helpers.adjustConcurrency, this.#_configs.recalcDebounce);
        super.concurrencyLimit = this.#_configs.concurrencyLimit;
    }

    /**
     * Adds a task to the adaptive task queue. This method overrides the base
     * implementation to include rate tracking and dynamic concurrency adjustment
     * before delegating to the parent method.
     * 
     * @param task - The task to be added to the queue.
     * @param options - (Optional) Additional options for task handling, such as
     * whether to auto-run the queue for this task.
     * @returns The current instance of the task queue, allowing for method chaining.
     * @override
     * @since 1.0.23
     */
    override addTask(task: BaseQueueTask<any, any>, options?: AddTasksBaseOptions): this {
        this.#_helpers.trackRate();
        this.#_adjustRate();
        return super.addTask(task, options);
    }

    /**
     * Adds multiple tasks to the adaptive task queue. This method overrides the
     * base implementation to include rate tracking and dynamic concurrency
     * adjustment before delegating to the parent method.
     * 
     * @param tasks - An array of tasks to be added to the queue.
     * @param options - (Optional) Additional options for task handling, such as
     * whether to auto-run the queue for this task.
     * @returns The current instance of the task queue, allowing for method chaining.
     * @override
     * @since 1.0.23
     */
    override bulkAddTasks(tasks: BaseQueueTask[], options?: AddTasksBaseOptions): this {
        this.#_helpers.trackRate();
        this.#_adjustRate();
        return super.bulkAddTasks(tasks, options);
    }

    /**
     * The current requests per second (RPS) rate for this queue.
     *
     * This is a rolling average over the past `WINDOW_DURATION` milliseconds.
     * @readonly
     * @since 1.0.23
     */
    get rps(): number {
        return this.#_rateWindow.length / (this.#_configs.windowDurationMs / 1000);
    }

    /**
     * The current concurrency limit of the adaptive task queue.
     *
     * This value is dynamically adjusted based on the current requests per second (RPS)
     * to ensure optimal performance while avoiding overload.
     *
     * @readonly
     * @since 1.0.23
     */
    override  get concurrencyLimit() {
        return super.concurrencyLimit;
    }

    /**
     * Registers a callback function to be executed when the concurrency level is updated.
     * 
     * The provided callback will be called with the current requests per second (RPS)
     * as its argument whenever the concurrency level is adjusted.
     *
     * @param callback - A function that receives the current RPS as an argument.
     * @throws {TypeError} If the provided callback is not a function.
     * @throws {RangeError} If the callback function expects more than one parameter.
     * @since 1.0.23
     */
    onConcurrencyUpdate(callback: (rps: number) => void) {
        if (typeof callback !== 'function') { throw new TypeError(`Expected 'callback' to be a function but received ${typeof callback}`) }
        if (callback.length > 1) { throw new RangeError(`Expected 'callback' to have a maximum of 1 parameter but received ${callback.length}`) }
        this.#_eventHandlers.userHandlers.onConcurrencyUpdate = callback;
    }
}

export default AdaptiveTaskQueue;