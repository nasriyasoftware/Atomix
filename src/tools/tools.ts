import TaskQueue from "./queues/TaskQueue";
import EventEmitter from "./events/EventEmitter";

class Tools {
    /**
     * The general-purpose prioritized task queue utility.
     * @example
     * const taskQueue = new atomix.tools.TaskQueue();
     * 
     * taskQueue.addTask({
     *     id: 'test',
     *     type: 'test',
     *     priority: 1,
     *     action: async () => console.log('test')
     * });
     * 
     * await taskQueue.untilComplete();
     * // Now all tasks have been processed
     * @since v1.0.2
     */
    readonly TaskQueue = TaskQueue;

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