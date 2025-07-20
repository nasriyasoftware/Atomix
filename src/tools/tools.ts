import TasksQueue from "./queues/TasksQueue";
import EventEmitter from "./events/EventEmitter";

class Tools {
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
    readonly TasksQueue = TasksQueue;

    /**
    * A flexible and lightweight event emitter class that supports advanced features like:
    * - `beforeAll` and `afterAll` handler types
    * - One-time (`once`) handlers
    * - Handler limits with overflow detection
    * - Custom max-handler overflow behavior
    *
    * This implementation allows both standard event handlers and lifecycle-style hooks around them.
    *
    * @example
    * ```ts
    * const emitter = new atomix.tools.EventEmitter();
    *
    * // Regular handler (called in the order added)
    * emitter.on('data', (value) => console.log('Received:', value));
    *
    * // One-time handler
    * emitter.on('data', (value) => console.log('Once:', value), { once: true });
    *
    * // Setup logic before all regular handlers
    * emitter.on('data', () => console.log('Before All'), { type: 'beforeAll' });
    *
    * // Cleanup logic after all regular handlers
    * emitter.on('data', () => console.log('After All'), { type: 'afterAll' });
    *
    * // Emit the event
    * await emitter.emit('data', 42);
    * ```
    *
    * @example
    * ```ts
    * // Custom behavior when handler count exceeds limit
    * emitter.maxHandlers = 2;
    * emitter.onMaxHandlers((eventName) => {
    *   throw new Error(`Handler overflow on ${eventName}`);
    * });
    *
    * emitter.on('load', () => {});
    * emitter.on('load', () => {});
    * emitter.on('load', () => {}); // throws
    * ```
    *
    * @since v1.0.8
    */
    readonly EventEmitter = EventEmitter
}

const tools = new Tools();
export default tools;