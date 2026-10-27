/**
 * A callable function accepted by the debouncer.
 *
 * @since v1.0.27
 */
export type AnyFunction = (...args: any[]) => any;

/**
 * The call signature of a debounced synchronous function.
 * Calling it schedules the function and returns immediately.
 *
 * @template T - The function being debounced.
 * @since v1.0.27
 */
export type DebouncedSyncReturnType<T extends AnyFunction> = (...args: Parameters<T>) => void;

/**
 * A debounced synchronous function with a method for cancelling its pending call.
 *
 * @template T - The function being debounced.
 * @since v1.0.27
 */
export type DebouncedSync<T extends AnyFunction> = DebouncedSyncReturnType<T> & {
    /**
     * Cancels the pending call and clears its timer without invoking the function.
     *
     * @since v1.0.27
     */
    cancel: () => void
};

/**
 * The call signature of a debounced function that returns a promise for the
 * awaited result of the original function.
 *
 * @template T - The function being debounced.
 * @since v1.0.27
 */
export type DebouncedReturnType<T extends AnyFunction> =
    (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>;

/**
 * A promise-returning debounced function with a method for cancelling its pending call.
 *
 * @template T - The function being debounced.
 * @since v1.0.27
 */
export type Debounced<T extends AnyFunction> = DebouncedReturnType<T> & {
    /**
     * Cancels the pending call, clears its timer, and rejects its promise.
     *
     * @since v1.0.27
     */
    cancel: () => void
}

/**
 * Internal representation of a pending synchronous debounced function.
 *
 * @internal
 * @template T - The function being debounced.
 * @since v1.0.27
 */
export type DebouncedSyncInternal<T extends AnyFunction = AnyFunction> = DebouncedSync<T> & {
    /**
     * Identifier used to track this debouncer's pending call.
     * @since v1.0.27
     */
    readonly _id: symbol;
    /**
     * Pending invocation, or `null` when there is no scheduled call.
     * @since v1.0.27
     */
    readonly _fn: (() => void) | null;
    /**
     * Clears the pending timer without invoking the function.
     * @since v1.0.27
     */
    _clearTimer(): void;
}