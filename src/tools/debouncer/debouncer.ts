import type {
    DebouncedSyncInternal,
    AnyFunction,
    DebouncedSync,
    Debounced
} from "./types";

/**
 * Creates and tracks debounced functions used by the shared debouncer instance.
 *
 * Synchronous debounces use unreferenced timers and are invoked immediately when
 * the process exits. Promise-returning debounces keep their timers referenced so
 * pending promises can settle while the process is running.
 *
 * @internal
 * @since v1.0.27
 */
class Debouncer {
    readonly #_debouncers: Map<Symbol, DebouncedSyncInternal> = new Map();

    /**
     * Registers process-exit cleanup for pending synchronous debounces.
     * @since v1.0.27
     */
    constructor() {
        process.once('exit', () => this.clear());
    }

    /**
     * Creates a trailing-edge debounce for a synchronous function.
     *
     * Each call resets the delay; only the most recent call's arguments are
     * passed to `fn`. Its timer is unreferenced so it does not keep Node.js
     * running. A pending call is invoked immediately when the process exits or
     * when `clear()` is called.
     *
     * The function's return value is passed to `options.onDone`. Synchronous
     * errors from `fn` or `onDone` are passed to `options.onError` when supplied.
     *
     * @template T - The synchronous function being debounced.
     * @param fn - The function to invoke after the delay.
     * @param delay - The number of milliseconds to wait after the most recent call.
     * @param options - Optional callbacks for the result or a synchronous error.
     * @param options.onDone - Called with the return value after `fn` completes.
     * @param options.onError - Called when `fn` or `onDone` throws.
     * @returns A debounced function with a `cancel()` method.
     * @since v1.0.27
     */
    debounceSync<T extends AnyFunction>(
        fn: T,
        delay: number,
        options?: {
            onDone?: (result: ReturnType<T>) => void;
            onError?: (err: unknown) => void;
        }
    ): DebouncedSync<T> {
        const metadata = {
            id: Symbol(),
            timer: null as NodeJS.Timeout | null,
            fn: null as (() => void) | null,
        }

        const invoke = (...args: Parameters<T>) => {
            try {
                const result = fn(...args);
                options?.onDone?.(result);
            } catch (error) {
                options?.onError?.(error);
            } finally {
                this.#_debouncers.delete(metadata.id);
                metadata.fn = null;

                if (metadata.timer) {
                    clearTimeout(metadata.timer);
                    metadata.timer = null;
                }
            }
        }

        const debounced = (...args: Parameters<T>) => {
            if (!this.#_debouncers.has(metadata.id)) {
                this.#_debouncers.set(metadata.id, debounced as DebouncedSyncInternal);
            }

            if (metadata.timer) { clearTimeout(metadata.timer); }

            metadata.fn = () => invoke(...args);
            metadata.timer = setTimeout(metadata.fn, delay);
            metadata.timer.unref();
        }

        Object.defineProperties(debounced, {
            _id: {
                get: () => metadata.id
            },
            _fn: {
                get: () => metadata.fn
            },
            _clearTimer: {
                enumerable: false,
                value: () => {
                    if (metadata.timer) {
                        clearTimeout(metadata.timer);
                        metadata.timer = null;
                    }
                }
            },
            cancel: {
                enumerable: false,
                value: () => {
                    this.#_debouncers.delete(metadata.id);
                    metadata.fn = null;

                    if (metadata.timer) {
                        clearTimeout(metadata.timer);
                        metadata.timer = null;
                    }
                }
            }
        })

        return debounced as DebouncedSync<T>;
    }

    /**
     * Creates a trailing-edge debounce for a function that may return a promise.
     *
     * Calls made before the delay expires share a promise, reset the delay, and
     * replace the arguments passed to `fn`; the promise resolves or rejects with
     * the result of that invocation. A call made after an invocation starts
     * begins a new debounce batch. The timer remains referenced so Node.js does
     * not exit before the delay elapses and the invocation starts.
     *
     * Calling `cancel()` rejects the promise for a pending batch. It does not
     * cancel an invocation that has already started.
     *
     * @template T - The function being debounced.
     * @param fn - The function to invoke after the delay.
     * @param delay - The number of milliseconds to wait after the most recent call.
     * @returns A debounced function that returns a promise for the awaited result.
     * @since v1.0.27
     */
    debounce<T extends AnyFunction>(
        fn: T,
        delay: number
    ): Debounced<T> {
        type Batch = {
            args: Parameters<T>;
            deferred: PromiseWithResolvers<Awaited<ReturnType<T>>>;
            timer: NodeJS.Timeout | null;
        };

        let pending: Batch | null = null;

        const debounced = (...args: Parameters<T>) => {
            if (pending === null) {
                pending = {
                    args,
                    deferred: Promise.withResolvers<Awaited<ReturnType<T>>>(),
                    timer: null,
                };
            } else {
                pending.args = args;
            }

            const batch = pending;

            if (batch.timer !== null) {
                clearTimeout(batch.timer);
            }

            batch.timer = setTimeout(() => {
                if (pending !== batch) { return }

                pending = null;
                batch.timer = null;

                try {
                    Promise.resolve(fn(...batch.args)).then(
                        result => batch.deferred.resolve(result),
                        error => batch.deferred.reject(error)
                    );
                } catch (error) {
                    batch.deferred.reject(error);
                }
            }, delay);

            return batch.deferred.promise;
        };

        debounced.cancel = () => {
            const batch = pending;
            if (batch === null) { return }

            pending = null;

            if (batch.timer !== null) {
                clearTimeout(batch.timer);
                batch.timer = null;
            }

            batch.deferred.reject(new Error('Debounced function cancelled'));
        };

        return debounced;
    }

    /**
     * Immediately invokes and clears every pending synchronous debounced call.
     * Promise-returning debounces are not managed by this method.
     *
     * @since v1.0.27
     */
    clear() {
        const debouncers = Array.from(this.#_debouncers.values());
        this.#_debouncers.clear();

        while (debouncers.length > 0) {
            const debouncer = debouncers.shift()!;
            debouncer._clearTimer();
            debouncer._fn?.();
        }
    }
}

/**
 * Shared debouncer instance used by the package.
 *
 * @since v1.0.27
 */
const debouncer = new Debouncer();
export default debouncer;