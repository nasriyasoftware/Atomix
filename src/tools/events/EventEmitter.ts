import valueIs from '../../valueIs';
import commonUtils from '../../domains/utils/utils';
import recordsUtils from '../../domains/data-types/record/records-utils';
import type { EventData, EventHandler, AddHandlerOptions, EventName, GlobalEventHandler, ProcessorMetaData, ProcessorEventsConfigs } from './docs';

/**
 * A flexible and lightweight event emitter class with full TypeScript support.
 *
 * Features:
 * - Strongly typed event names and handler arguments using generics (`EventsMap`).
 * - Global `'*'` handlers that receive the event name as the first argument, followed by the event's arguments.
 * - `beforeAll` and `afterAll` handler types for lifecycle-style hooks.
 * - One-time handlers via `on` with `{ once: true }` option (removed automatically after first execution).
 * - Handler limits with overflow detection via `maxTotalHandlers` and custom overflow behavior.
 * - Backward-compatible `maxHandlers` property (deprecated in favor of `maxTotalHandlers`).
 *
 * This implementation allows both standard event handlers and advanced lifecycle hooks,
 * while supporting both typed and untyped usage.
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
 * // Global handler receives the event name first
 * emitter.on(`'*'`, (event, ...args) => console.log(`Global: ${event}`, args));
 *
 * // Emit the event
 * await emitter.emit('data', 42);
 * ```
 *
 * @example
 * ```ts
 * const emitter = new atomix.tools.EventEmitter();
 *
 * // Option 1: Throw an Error immediately when the limit is exceeded
 * emitter.maxTotalHandlers = 2;
 * emitter.onMaxHandlers(new Error('Handler limit exceeded'));
 *
 * emitter.on('load', () => {});
 * emitter.on('load', () => {});
 * emitter.on('load', () => {}); // throws immediately
 *
 * // Option 2: Use a custom function to handle overflows (debounced)
 * emitter.onMaxHandlers((eventName) => {
 *   console.warn(`Handler overflow on event: ${eventName}`);
 * });
 * ```
 *
 * @template EventsMap - Optional type map for event names and handler signatures. Defaults to `{}` for untyped usage.
 *
 * @since v1.0.8
 */
export class EventEmitter<EventsMap extends Record<string, EventHandler> = {}> {
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

    readonly #_processor = {
        process: async (events: ProcessorEventsConfigs, ...args: any[]) => {
            const { emittedBy, data, isGlobal } = events;

            if (data.handlers.before) {
                await this.#_processor.processHandler(
                    data.handlers.before,
                    { triggeredBy: emittedBy, isGlobal },
                    ...args
                );
            }

            // Handle normal events
            for (let i = 0; i < data.handlers.normal.index; i++) {
                const handler = (data.handlers.normal.handlers.get(i) || data.handlers.normal.onceHandlers.get(i))!;
                if (!handler) { continue }
                await this.#_processor.processHandler(
                    handler,
                    { triggeredBy: emittedBy, isGlobal },
                    ...args
                )
            }

            if (data.handlers.after) {
                await this.#_processor.processHandler(
                    data.handlers.after,
                    { triggeredBy: emittedBy, isGlobal },
                    ...args
                );
            }

            const onceHandlersCount = data.handlers.normal.onceHandlers.size;
            this.#_helpers.updateEventHandlersNum(data, -onceHandlersCount);
            data.handlers.normal.onceHandlers.clear();
        },
        processHandler: async (
            handler: EventHandler,
            meta: ProcessorMetaData,
            ...args: any[]
        ) => {
            const triggeredBy = meta.triggeredBy;
            const isGlobal = meta.isGlobal;

            try {
                if (isGlobal) {
                    await handler(triggeredBy, ...args);
                } else {
                    await handler(...args);
                }
            } catch (error) {
                this.#_processor.onError(error, meta);
            }
        },
        onError(error: unknown, meta: ProcessorMetaData) {
            const errMsg = `[Atomix][EventEmitter:UserHandlerError]: An error occurred while processing event '${meta.triggeredBy}'.`;
            console.error(errMsg, error);
        }
    }

    /**
     * Emits an event, triggering all registered handlers for the given event name.
     *
     * This method supports both **typed** and **untyped** emitters:
     *
     * - In a **typed emitter** (`EventEmitter<{ load: () => void; data: (value: number) => void }>`), 
     *   the `eventName` parameter is restricted to the keys of the provided map, 
     *   and the `args` are automatically typed according to the event's parameters.
     *
     * - In an **untyped emitter** (`EventEmitter` with default `{}`), `eventName` can be any string, 
     *   and `args` are of type `any[]`.
     *
     * Global (`'*'`) handlers are triggered on every emit and receive the actual event name as the first argument.
     *
     * Handlers are invoked in the following order for each `emit` call:
     * 1. The `beforeAll` handler (if set) runs before all `normal` handlers.
     * 2. All `normal` handlers (in the order they were registered).
     * 3. The `afterAll` handler (if set) runs after all `normal` handlers.
     *
     * `beforeAll` and `afterAll` are singleton handlers — only one of each may be set per event name. 
     * They are not removed automatically and are executed on every `emit` call.
     *
     * `normal` handlers may be marked as `once`, in which case they are removed after their first invocation.
     *
     * @template E - The event name type; inferred automatically.
     * @param eventName - The name of the event to emit, or `'*'` for global handlers. Must be a non-empty string.
     * @param args - Arguments to pass to all applicable handlers. Automatically typed for typed emitters.
     *
     * @throws {TypeError} If the event name is not a string.
     * @throws {RangeError} If the event name is an empty string.
     *
     * @example
     * // Untyped emitter
     * const emitter = new EventEmitter();
     * emitter.on('*', (event, ...args) => console.log(`Global: ${event}`, args));
     * await emitter.emit('load', true);
     *
     * @example
     * // Typed emitter
     * type MyEvents = { load: (ok: boolean) => void; data: (value: number) => void };
     * const typedEmitter = new EventEmitter<MyEvents>();
     * typedEmitter.on('data', (value) => console.log('Data:', value));
     * typedEmitter.on('*', (event, ...args) => console.log(`Global: ${event}`, args));
     * await typedEmitter.emit('data', 42); // value typed as number
     *
     * @since v1.0.8
     */
    async emit<E extends EventName<EventsMap>>(
        eventName: [E] extends [never] ? string : E,
        ...args: [E] extends [never] ? any[] : Parameters<EventsMap[E]>
    ): Promise<void> {
        if (!valueIs.string(eventName)) { throw new TypeError(`The provided event name (${eventName}) is not a string.`) }
        if (eventName.length === 0) { throw new RangeError(`The provided event name (${eventName}) is an empty string.`) }

        const globalEvents = this.#_helpers.getEvents('*');
        const namedEvents = eventName === '*' ? undefined : this.#_helpers.getEvents(eventName);

        if (namedEvents) {
            await this.#_processor.process({ emittedBy: eventName, data: namedEvents }, ...args);
        }

        if (globalEvents) {
            await this.#_processor.process({ emittedBy: eventName, data: globalEvents, isGlobal: true }, ...args);
        }
    }

    /**
     * Adds a handler to an event.
     *
     * This method supports both **typed** and **untyped** event emitters.
     *
     * ### Typed vs untyped emitters
     * - In a **typed emitter** (`EventEmitter<{ load: () => void; data: (value: number) => void }>`),
     *   `eventName` is restricted to the keys of the provided map, and `handler` is fully type-safe.
     * - In an **untyped emitter** (`EventEmitter` with the default `{}`), `eventName` may be any string.
     *
     * ### Global handlers (`'*'`)
     * Passing `'*'` as the event name registers a **global handler** that listens to all events.
     * The handler receives the actual event name as the first argument, followed by the event arguments.
     *
     * ### Handler types
     * - `"normal"`: Runs on every emit (default)
     * - `"beforeAll"`: Runs before all normal handlers for the event
     * - `"afterAll"`: Runs after all normal handlers for the event
     *
     * ### Intentional no-op handlers
     * This method explicitly supports passing `atomix.utils.noop` as the handler.
     *
     * Doing so **preserves the semantic intent of attaching a handler** without:
     * - allocating a new function,
     * - storing it in memory,
     * - or creating misleading empty implementations.
     *
     * No-op handlers are ignored internally while keeping the event registration intentional and explicit.
     *
     * @template E - The event name type (inferred automatically).
     * @param eventName - The name of the event to add the handler to, or `'*'` for a global handler.
     * @param handler - The handler function for the event, or `atomix.utils.noop` to intentionally register a no-op.
     * @param options - Optional configuration for the handler. Defaults to `{ once: false, type: 'normal' }`.
     * @param options.once - If true, the handler is removed after being called once.
     * @param options.type - The type of handler. One of `"normal"`, `"beforeAll"`, or `"afterAll"`.
     *
     * @throws {TypeError} If `eventName` is not a string, or `handler` is not a function.
     * @throws {RangeError} If `eventName` is an empty string, or `options.type` is invalid.
     *
     * @returns The EventEmitter instance, allowing method chaining.
     *
     * @example
     * // Intentional placeholder handler
     * emitter.on('ready', atomix.utils.noop);
     *
     * @example
     * // Typed emitter
     * type Events = { ready: () => void };
     * const typedEmitter = new EventEmitter<Events>();
     * typedEmitter.on('ready', atomix.utils.noop);
     *
     * @since v1.0.8
     */
    on<E extends EventName<EventsMap> | '*'>(
        eventName: [Exclude<E, '*'>] extends [never] ? string : E,
        handler: E extends '*' ? GlobalEventHandler<EventsMap> : EventsMap[E],
        options?: AddHandlerOptions
    ): this {
        const configs: Required<AddHandlerOptions> = {
            once: false,
            type: 'normal',
        }

        if (!valueIs.string(eventName)) { throw new TypeError(`The provided event name (${eventName}) is not a string.`) }
        if (eventName.length === 0) { throw new RangeError(`The provided event name (${eventName}) is an empty string.`) }
        if (typeof handler !== 'function') { throw new TypeError(`The provided handler (${handler}) is not a function.`) }
        if (handler === commonUtils.noop) { return this }

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
     * - If a **function** is provided, it is debounced (100ms) to prevent excessive calls during rapid handler additions.
     * - If an **Error** object is provided, it will be thrown immediately when the limit is exceeded.
     *
     * @param handler - A function to call when the maximum number of handlers is exceeded, or an Error to throw.
     * @returns The EventEmitter instance, allowing method chaining.
     *
     * @throws {TypeError} If the handler is not a function or an Error instance.
     *
     * @example
     * ```ts
     * const emitter = new atomix.tools.EventEmitter();
     *
     * // Throw an error when the max handlers limit is exceeded
     * emitter.onMaxHandlers(new Error('Handler limit exceeded'));
     *
     * // Or provide a custom function
     * emitter.onMaxHandlers((eventName) => {
     *   console.warn(`Handler overflow on event: ${eventName}`);
     * });
     * ```
     *
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
     * @since v1.0.24
     */
    get maxTotalHandlers(): number { return this.#_stats.handlers.max }

    /**
     * Sets the maximum number of event handlers allowed for this EventEmitter instance.
     * 
     * The value must be a positive integer or Infinity. If set to Infinity, there is no limit to the number of handlers.
     * 
     * @param {number} value The maximum number of handlers. Must be a positive integer or Infinity.
     * @throws {TypeError} If the provided value is not a number or not an integer.
     * @throws {RangeError} If the provided value is not greater than 0.
     * @since v1.0.24
     */
    set maxTotalHandlers(value: number) {
        if (!valueIs.number(value)) { throw new TypeError('maxTotalHandlers must be a number') }
        if (value === Infinity) {
            this.#_stats.handlers.max = value;
            return;
        }

        if (value <= 0) { throw new RangeError('maxTotalHandlers must be greater than 0') }
        if (!valueIs.integer(value)) { throw new TypeError('maxTotalHandlers must be an integer') }
        this.#_stats.handlers.max = value;
    }

    /**
     * Retrieves the maximum number of event handlers allowed for this EventEmitter instance.
     * 
     * The value is a positive integer or Infinity. If set to Infinity, there is no limit to the number of handlers.
     * 
     * @returns {number} The maximum number of handlers. A positive integer or Infinity.
     * @deprecated Use {@link maxTotalHandlers} getter/setter instead.
     * @since v1.0.8
     */
    get maxHandlers(): number { return this.maxTotalHandlers }

    /**
     * Sets the maximum number of event handlers allowed for this EventEmitter instance.
     * 
     * The value must be a positive integer or Infinity. If set to Infinity, there is no limit to the number of handlers.
     * 
     * @param {number} value The maximum number of handlers. Must be a positive integer or Infinity.
     * @throws {TypeError} If the provided value is not a number or not an integer.
     * @throws {RangeError} If the provided value is not greater than 0.
     * @deprecated Use {@link maxTotalHandlers} getter/setter instead.
     * @since v1.0.8
     */
    set maxHandlers(value: number) {
        this.maxTotalHandlers = value
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