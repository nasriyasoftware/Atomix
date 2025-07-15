import valueIs from '../../valueIs';
import commonUtils from '../../domains/utils/utils';
import recordsUtils from '../../domains/data-types/record/records-utils';
import { EventData, EventHandler, AddHandlerOptions } from './docs';

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
export class EventEmitter {
    readonly #_events: Map<string, EventData> = new Map();
    readonly #_stats = {
        handlers: { number: 0, max: 10 },
    }

    readonly #_helpers = {
        getEvents: (eventName: string): EventData => {
            if (this.#_events.has(eventName)) {
                return this.#_events.get(eventName)!;
            }

            const events = {
                name: eventName,
                handlersNumber: 0,
                handlers: {
                    before: undefined,
                    after: undefined,
                    normal: {
                        index: 0,
                        handlers: new Map(),
                        onceHandlers: new Map(),
                    },
                }
            }

            this.#_events.set(eventName, events);
            return events;
        },
        onMaxHandlers: {
            builtInHandler: commonUtils.debounceSync(() => {
                if (this.#_stats.handlers.number > this.#_stats.handlers.max) {
                    console.warn(`[WARN] The maximum number of handlers has been reached (${this.#_stats.handlers.max}). Current number of handlers: ${this.#_stats.handlers.number}.`);
                }
            }, 1000),
            customHandler: null as null | ((eventName: string) => any) | Error,
            check: (eventName: string) => {
                const customHandler = this.#_helpers.onMaxHandlers.customHandler;
                if (customHandler instanceof Error) {
                    if (this.#_stats.handlers.number > this.#_stats.handlers.max) {
                        const newErr = new Error();
                        newErr.message = `[WARN] ${customHandler.message}`;
                        newErr.cause = customHandler.cause;
                        throw newErr;
                    }

                    return;
                };

                const builtInHandler = this.#_helpers.onMaxHandlers.builtInHandler;
                const toInvoke = customHandler !== null ? customHandler : builtInHandler;
                toInvoke(eventName);
            }
        },
        updateEventHandlersNum: (events: EventData, delta: number) => {
            events.handlersNumber += delta;
            this.#_stats.handlers.number += delta;
            if (events.handlersNumber === 0) { events.handlers.normal.index = 0; }
        },
    }

    readonly #_runner = {
        processEvents: async (events: EventData, ...args: any) => {
            if (events.handlers.before) {
                await this.#_runner.runHandler(events.handlers.before, events.name, ...args);
            }

            // Handle normal events
            for (let i = 0; i < events.handlers.normal.index; i++) {
                const handler = (events.handlers.normal.handlers.get(i) || events.handlers.normal.onceHandlers.get(i))!;
                if (!handler) { continue }
                await this.#_runner.runHandler(handler, events.name, ...args);
            }

            if (events.handlers.after) {
                await this.#_runner.runHandler(events.handlers.after, events.name, ...args);
            }

            const onceHandlersCount = events.handlers.normal.onceHandlers.size;
            this.#_helpers.updateEventHandlersNum(events, -onceHandlersCount);
            events.handlers.normal.onceHandlers.clear();
        },
        runHandler: async (handler: EventHandler, eventName: string, ...args: any) => {
            try {
                await handler(...args);
            } catch (error) {
                this.#_runner.onError(error, eventName);
            }
        },
        onError: (err: unknown, eventName: string) => {
            console.error(`[HandlerError] (${eventName})`, err);
        },
    }

    /**
     * Emits an event, triggering all registered handlers for the given event name.
     *
     * Handlers are invoked in the following order for each `emit` call:
     * 1. The `beforeAll` handler (if set) runs before all `normal` handlers.
     * 2. All `normal` handlers (in the order they were registered).
     * 3. The `afterAll` handler (if set) runs after all `normal` handlers.
     *
     * `beforeAll` and `afterAll` are special singleton handlers — only one of each
     * may be set per event name. They are not removed automatically and are executed
     * on every `emit` call.
     *
     * `normal` handlers may be marked as `once`, in which case they will be removed
     * after their first invocation.
     *
     * Global (`'*'`) handlers are triggered on every emit and receive the actual event
     * name as their first argument.
     *
     * @async
     * @param eventName - The name of the event to emit. Must be a non-empty string.
     * @param args - Arguments to pass to all applicable handler functions.
     *
     * @throws {TypeError} If the event name is not a string.
     * @throws {RangeError} If the event name is an empty string.
     *
     * @example
     * ```ts
     * const emitter = new EventEmitter();
     *
     * emitter.on('data', (value) => console.log('Normal:', value));
     * emitter.on('data', () => console.log('Before All'), { type: 'beforeAll' });
     * emitter.on('data', () => console.log('After All'), { type: 'afterAll' });
     *
     * await emitter.emit('data', 123);
     * // Output:
     * // Before All
     * // Normal: 123
     * // After All
     * ```
     *
     * @example
     * ```ts
     * emitter.on('*', (event, ...args) => {
     *   console.log(`Global handler: ${event}`, args);
     * });
     *
     * await emitter.emit('load', true);
     * // Output:
     * // Global handler: load [true]
     * ```
     *
     * @since v1.0.8
     */
    async emit(eventName: string, ...args: any): Promise<void> {
        if (!valueIs.string(eventName)) { throw new TypeError(`The provided event name (${eventName}) is not a string.`) }
        if (eventName.length === 0) { throw new RangeError(`The provided event name (${eventName}) is an empty string.`) }

        const globalEvents = this.#_helpers.getEvents('*');
        const namedEvents = eventName === '*' ? undefined : this.#_helpers.getEvents(eventName);

        if (namedEvents) {
            await this.#_runner.processEvents(namedEvents, ...args);
        }

        if (globalEvents) {
            await this.#_runner.processEvents(globalEvents, ...args);
        }
    }

    /**
     * Adds a handler to an event.
     *
     * @param eventName - The name of the event to add the handler to.
     * @param handler - The handler function to add.
     * @param options - (Optional) Additional configuration options for the handler. If not provided, defaults to `{ once: false, type: 'normal' }`.
     * @param options.once - (Optional) If true, the handler is removed after being called once. Defaults to false.
     * @param options.type - (Optional) The type of event handler to add. One of "before", "after", or "normal". Defaults to "normal".
     *
     * @throws {TypeError} Throws if the event name is not a string or the handler is not a function.
     * @throws {RangeError} Throws if the event name is an empty string or the type is not a valid event type.
     *
     * @returns The EventEmitter instance.
     * @since v1.0.8
     */
    on(eventName: string, handler: EventHandler, options?: AddHandlerOptions) {
        const configs: Required<AddHandlerOptions> = {
            once: false,
            type: 'normal',
        }

        if (!valueIs.string(eventName)) { throw new TypeError(`The provided event name (${eventName}) is not a string.`) }
        if (eventName.length === 0) { throw new RangeError(`The provided event name (${eventName}) is an empty string.`) }
        if (typeof handler !== 'function') { throw new TypeError(`The provided handler (${handler}) is not a function.`) }
        if (options !== undefined) {
            if (!valueIs.record(options)) { throw new TypeError(`The provided options (${options}) is not a record.`) }

            if (recordsUtils.hasOwnProperty(options, 'once')) {
                if (typeof options.once !== 'boolean') { throw new TypeError(`The "once" property of the provided options (${options}) is not a boolean.`) }
                configs.once = options.once;
            }

            if (recordsUtils.hasOwnProperty(options, 'type')) {
                if (!valueIs.string(options.type)) { throw new TypeError(`The "type" property of the provided options (${options}) is not a string.`) }
                if (!['beforeAll', 'afterAll', 'normal'].includes(options.type)) { throw new RangeError(`The "type" property of the provided options (${options}) is not a valid event type.`) }
                configs.type = options.type;
            }
        }

        const events = this.#_helpers.getEvents(eventName);
        if (configs.type === 'beforeAll' || configs.type === 'afterAll') {
            if (configs.type === 'beforeAll') { events.handlers.before = handler }
            if (configs.type === 'afterAll') { events.handlers.after = handler }
        } else {
            const id = events.handlers.normal.index++;
            events.handlers.normal[configs.once ? 'onceHandlers' : 'handlers'].set(id, handler);
        }

        this.#_helpers.updateEventHandlersNum(events, 1);
        this.#_helpers.onMaxHandlers.check(eventName);

        return this;
    }

    /**
     * Registers a custom handler for the "max handlers exceeded" event.
     *
     * When the number of handlers for an event exceeds the maximum allowed, this handler is called with the event name as an argument.
     * 
     * The handler is debounced to prevent excessive calls when the maximum number of handlers is exceeded multiple times in quick succession.
     *
     * @param handler - A function to call when the maximum number of handlers is exceeded or an error to throw.
     * @returns The EventEmitter instance.
     * @throws {TypeError} If the handler is not a function or an error.
     * @since v1.0.8
     */
    onMaxHandlers(handler: ((eventName: string) => any) | Error) {
        const isFunction = typeof handler === 'function';
        const isError = handler instanceof Error;

        if (!isFunction && !isError) { throw new TypeError(`The provided handler (${handler}) is not a function or an error.`) }

        if (isError) {
            this.#_helpers.onMaxHandlers.customHandler = handler;
        }

        if (isFunction) {
            this.#_helpers.onMaxHandlers.customHandler = commonUtils.debounceSync((eventName: string) => {
                if (this.#_stats.handlers.number <= this.#_stats.handlers.max) { return }
                handler(eventName);
            }, 100, {
                onError: (err) => { throw err }
            });
        }

        return this
    }

    /**
     * Cleans up any internal resources used by this instance.
     * 
     * Specifically, cancels any pending debounced handlers (such as
     * warnings about maximum handlers) to prevent timers from
     * keeping the process alive or causing side effects after disposal.
     * 
     * This method should be called when the instance is no longer needed,
     * such as during test teardown or object cleanup.
     * 
     * @since v1.0.15
     */
    dispose() {
        const { builtInHandler, customHandler } = this.#_helpers.onMaxHandlers;
        (builtInHandler as any)?.cancel();
        if (typeof customHandler !== 'function') { return }
        (customHandler as any)?.cancel();
    }

    /**
     * Retrieves the maximum number of event handlers allowed for this EventEmitter instance.
     * 
     * The value is a positive integer or Infinity. If set to Infinity, there is no limit to the number of handlers.
     * 
     * @returns {number} The maximum number of handlers. A positive integer or Infinity.
     * @since v1.0.8
     */
    get maxHandlers(): number { return this.#_stats.handlers.max; }

    /**
     * Sets the maximum number of event handlers allowed for this EventEmitter instance.
     * 
     * The value must be a positive integer or Infinity. If set to Infinity, there is no limit to the number of handlers.
     * 
     * @param {number} value The maximum number of handlers. Must be a positive integer or Infinity.
     * @throws {TypeError} If the provided value is not a number or not an integer.
     * @throws {RangeError} If the provided value is not greater than 0.
     * @since v1.0.8
     */
    set maxHandlers(value: number) {
        if (!valueIs.number(value)) { throw new TypeError('maxHandlers must be a number') }
        if (value === Infinity) {
            this.#_stats.handlers.max = value;
            return;
        }

        if (value <= 0) { throw new RangeError('maxHandlers must be greater than 0') }
        if (!valueIs.integer(value)) { throw new TypeError('maxHandlers must be an integer') }
        this.#_stats.handlers.max = value;
    }

    /**
     * Retrieves the total number of event handlers registered with this EventEmitter instance.
     * @returns {number} The total number of event handlers.
     * @since v1.0.8
     */
    get handlersCount(): number { return this.#_stats.handlers.number }

    /**
     * Retrieves the names of all registered events for this EventEmitter instance.
     * 
     * @returns {string[]} An array of event names.
     * @since v1.0.8
     */
    get eventNames(): string[] { return Array.from(this.#_events.keys()).filter(name => name !== '*'); }

    /**
     * A collection of methods to remove event handlers.
     *
     * This allows removing specific handlers or clearing all handlers from one or more events.
     *
     * @example
     * ```ts
     * const emitter = new EventEmitter();
     * const handler = () => console.log('Hello');
     *
     * emitter.on('greet', handler);
     * emitter.remove.handler('greet', handler); // Removes just this one
     * ```
     *
     * @example
     * ```ts
     * emitter.on('load', () => {});
     * emitter.on('error', () => {});
     * emitter.remove.allHandlers(); // Removes everything
     * ```
     *
     * @example
     * ```ts
     * emitter.remove.allHandlers('load'); // Removes all "load" handlers only
     * ```
     *
     * @since v1.0.8
     */
    readonly remove = {
        /**
         * Removes a specified event handler for a given event name.
         *
         * @param eventName - The name of the event for which the handler should be removed.
         * @param handler - The handler function to remove.
         * @returns {boolean} True if the handler was successfully removed, otherwise false.
         * @throws {TypeError} Throws if the event name is not a string or the handler is not a function.
         * @since v1.0.8
         */
        handler: (eventName: string, handler: EventHandler): boolean => {
            if (!valueIs.string(eventName)) { throw new TypeError(`The provided event name (${eventName}) is not a string.`) }
            if (eventName.length === 0) { throw new RangeError(`The provided event name (${eventName}) is an empty string.`) }
            if (typeof handler !== 'function') { throw new TypeError(`The provided handler (${handler}) is not a function.`) }

            const events = this.#_events.get(eventName);
            if (!events) { return false }
            const removed = (() => {
                const isBefore = events.handlers.before === handler;
                const isAfter = events.handlers.after === handler;
                if (isBefore || isAfter) {
                    if (isBefore) { events.handlers.before = undefined }
                    if (isAfter) { events.handlers.after = undefined }
                    return true;
                }

                for (let i = 0; i < events.handlers.normal.index; i++) {
                    const storedHandler = events.handlers.normal.handlers.get(i);
                    if (storedHandler === handler) {
                        events.handlers.normal.handlers.delete(i);
                        return true;
                    }

                    const storedOnceHandler = events.handlers.normal.onceHandlers.get(i);
                    if (storedOnceHandler === handler) {
                        events.handlers.normal.onceHandlers.delete(i);
                        return true;
                    }
                }

                return false;
            })();

            if (removed) {
                this.#_helpers.updateEventHandlersNum(events, -1);
            }

            return removed;
        },

        /**
         * Removes all handlers for a given event name or all events if no name is specified.
         *
         * @param eventName - (Optional) The name of the event for which handlers should be removed. If not provided, handlers for all events are removed.
         * @returns {boolean} True if any handlers were removed, otherwise false.
         * @throws {TypeError} Throws if the event name is not a string.
         * @throws {RangeError} Throws if the event name is an empty string.
         * @since v1.0.8
         */
        allHandlers: (eventName?: string): boolean => {
            if (eventName !== undefined) {
                if (!valueIs.string(eventName)) { throw new TypeError(`The provided event name (${eventName}) is not a string.`) }
                if (eventName.length === 0) { throw new RangeError(`The provided event name (${eventName}) is an empty string.`) }
            }

            const events = eventName ? [this.#_events.get(eventName)] : Array.from(this.#_events.values());
            let anyRemoved = false;
            for (const event of events) {
                if (!event) { continue }

                let removed = 0;
                if (event.handlers.before) { removed++ }
                if (event.handlers.after) { removed++ }
                removed += event.handlers.normal.handlers.size + event.handlers.normal.onceHandlers.size;

                this.#_events.delete(event.name);
                this.#_helpers.updateEventHandlersNum(event, -removed);
                anyRemoved = removed > 0;
            }

            return anyRemoved;
        }
    }
}

export default EventEmitter;