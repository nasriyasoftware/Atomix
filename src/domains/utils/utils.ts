import debouncer from "../../tools/debouncer/debouncer";
import type { AnyFunction, Debounced, DebouncedSync } from "../../tools/debouncer/types";
import type { RandomOptions } from "./docs";

export class CommonUtils {
    /**
     * Generate a random text
     * @param length The length of the text. Minimum of `4`
     * @param [options] Options for generating the text
     * @returns The generated text
     * @since v1.0.0
     */
    generateRandom(length: number, options: RandomOptions = {}): string {
        const {
            includeNumbers = true,
            includeLetters = true,
            includeSymbols = true,
            includeLowerCaseChars = true,
            includeUpperCaseChars = true,
            beginWithLetter = true,
            noSimilarChars = true,
            noDuplicateChars = false,
            noSequentialChars = true
        } = options;

        let chars = '';
        let text = '';

        if (includeNumbers) chars += '0123456789';
        if (includeLetters) {
            if (includeLowerCaseChars) chars += 'abcdefghijklmnopqrstuvwxyz';
            if (includeUpperCaseChars) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        }

        if (includeSymbols) chars += '!";#$%&\'()*+,-./:;<=>?@[]^_`{|}~';

        if (beginWithLetter && (includeLetters || includeNumbers || includeSymbols)) {
            const validChars = includeLetters && includeNumbers && includeSymbols ? chars : chars.slice(10);
            text += validChars.charAt(Math.floor(Math.random() * validChars.length));
        }

        while (text.length < length) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            const char = chars[randomIndex];

            if (
                (noSimilarChars && /[il1LoO]/.test(char)) ||
                (noDuplicateChars && text.includes(char)) ||
                (noSequentialChars && text.length > 0 && text[text.length - 1].charCodeAt(0) + 1 === char.charCodeAt(0))
            ) {
                continue;
            }

            text += char;
        }

        return text;
    }

    /**
     * Pauses execution for a specified number of milliseconds.
     * 
     * This function returns a promise that resolves after the given duration,
     * allowing for asynchronous code to wait before proceeding.
     * 
     * @param ms - The number of milliseconds to sleep.
     * @returns A promise that resolves after the specified delay.
     * @since v1.0.0
     */
    sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Creates a trailing-edge debounce for a function that may return a promise.
     *
     * Calls made before the delay expires reset the delay, replace the arguments
     * passed to `fn`, and share one promise for that debounce batch. The promise
     * resolves or rejects with the result of that invocation. A call made after
     * an invocation starts begins a new batch. The timer remains referenced so
     * Node.js does not exit before the delay elapses and the invocation starts.
     *
     * The returned function has a `cancel()` method. It rejects the promise for
     * a pending batch and clears its timer; it does not cancel an invocation
     * that has already started.
     *
     * @param fn - The function to debounce.
     * @param delay - The number of milliseconds to delay the invocation of the function.
     * @returns A debounced function that returns a promise for the awaited result.
     * @since v1.0.0
     */
    debounce<T extends AnyFunction>(fn: T, delay: number): Debounced<T> {
        return debouncer.debounce(fn, delay);
    }

    /**
     * Creates a trailing-edge debounce for a synchronous function.
     *
     * Each call resets the delay; only the most recent call's arguments are
     * passed to `fn`. Its timer is unreferenced so it does not keep Node.js
     * running. A pending call is invoked immediately when the process exits or
     * when the shared debouncer is cleared.
     *
     * The function's return value is passed to `options.onDone`. Synchronous
     * errors from `fn` or `onDone` are passed to `options.onError` when supplied.
     * The returned function has a `cancel()` method that clears the pending call
     * without invoking it.
     *
     * @param fn - The synchronous function to debounce.
     * @param delay - The number of milliseconds to wait after the most recent call.
     * @param options - Optional callbacks for the result or a synchronous error.
     * @param options.onDone - Called with the return value after `fn` completes.
     * @param options.onError - Called when `fn` or `onDone` throws.
     * @returns A debounced function with a `cancel()` method.
     * @since v1.0.8
     */
    debounceSync<T extends AnyFunction>(
        fn: T,
        delay: number,
        options?: {
            onDone?: (result: ReturnType<T>) => void;
            onError?: (err: unknown) => void;
        }
    ): DebouncedSync<T> {
        return debouncer.debounceSync(fn, delay, options);
    }

    /**
     * Returns a throttled version of the given function.
     *
     * The throttled function will only invoke the original function at most
     * once in the specified delay period. If the function returns a promise,
     * it will maintain the promise chain and resolve with the promise's value.
     * If the throttled function is called again before the delay has passed,
     * it will return the pending promise or resolve immediately if there is none.
     *
     * @param fn - The function to throttle.
     * @param delay - The number of milliseconds to throttle invocations to.
     * @returns A throttled version of the given function that returns a promise.
     * @since v1.0.0
     */
    throttle<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => Promise<ReturnType<T>> | void {
        let lastTime = 0;
        let pendingPromise: Promise<ReturnType<T>> | null = null;

        return (...args: Parameters<T>) => {
            const now = Date.now();
            if (now - lastTime < delay) {
                return pendingPromise || Promise.resolve();
            }

            lastTime = now;
            const result = fn(...args);
            if (result instanceof Promise) {
                pendingPromise = result.then((val) => {
                    pendingPromise = null;
                    return val;
                });
                return pendingPromise;
            } else {
                return Promise.resolve(result);
            }
        };
    }

    /**
     * A no-operation function useful as a placeholder callback.
     * @since v1.0.0
     */
    noop() { }

    /**
     * Wraps a function such that it will only be called once.
     *
     * All subsequent calls will return the cached result of the first call.
     *
     * @param fn - The function to wrap.
     * @returns A wrapped version of the function that will only be called once.
     * @since v1.0.0
     */
    once<T extends (...args: any[]) => any>(fn: T): (...args: Parameters<T>) => ReturnType<T> {
        let called = false;
        let result: ReturnType<T>;

        return (...args: Parameters<T>): ReturnType<T> => {
            if (!called) {
                called = true;
                result = fn(...args);
            }
            return result;
        };
    }
}

const commonUtils = new CommonUtils();
export default commonUtils;
