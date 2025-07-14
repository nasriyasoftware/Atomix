export interface EventData {
    name: string;
    handlersNumber: number;
    handlers: {
        normal: NormalHandlers,
        before: EventHandler | undefined,
        after: EventHandler | undefined,
    }
}

export interface NormalHandlers {
    index: number;
    handlers: Map<number, EventHandler>;
    onceHandlers: Map<number, EventHandler>;
}

/**
 * Options for adding an event handler to an EventEmitter.
 */
export interface AddHandlerOptions {
    /**
     * If true, the handler will be invoked only once and then automatically removed.
     * @default false
     */
    once?: boolean;

    /**
    * The type of the event handler.
    *
    * - `"normal"` (default):  
    *   Regular handlers that are called in the order they were added each time the event is emitted.
    *
    * - `"beforeAll"`:  
    *   A unique handler that is called **before all** normal handlers every time the event is emitted.  
    *   Only one `beforeAll` handler can be assigned per event; assigning another will overwrite the previous one.
    *
    * - `"afterAll"`:  
    *   A unique handler that is called **after all** normal handlers every time the event is emitted.  
    *   Only one `afterAll` handler can be assigned per event; assigning another will overwrite the previous one.
    *
    * These special handlers let you run setup or teardown logic around the normal event handlers.
    */
    type?: 'beforeAll' | 'afterAll' | 'normal';
}

export type EventHandler = (...args: any) => any | Promise<any>;