import { RandomOptions } from "./docs";

class CommonUtils {
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
     * Returns a debounced version of the given function.
     *
     * When the given function is called, it will wait the specified delay before
     * actually calling the function. If the function is called multiple times
     * within that delay, it will only call the function once after the delay
     * has passed.
     *
     * @param fn - The function to debounce.
     * @param delay - The number of milliseconds to delay calling the function.
     * @returns A debounced version of the given function that returns a promise.
     * @since v1.0.0
     */
    debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => Promise<ReturnType<T>> {
        let timeout: NodeJS.Timeout | null = null;
        let resolveFn: ((value: any) => void) | null = null;
        let rejectFn: ((reason?: any) => void) | null = null;

        return (...args: Parameters<T>) => {
            if (timeout) clearTimeout(timeout);

            return new Promise<ReturnType<T>>((resolve, reject) => {
                resolveFn = resolve;
                rejectFn = reject;
                timeout = setTimeout(async () => {
                    try {
                        const result = await fn(...args);
                        resolveFn?.(result);
                    } catch (error) {
                        rejectFn?.(error);
                    }
                }, delay);
            });
        };
    }

    /**
     * Returns a debounced version of the given function that does not return a promise.
     *
     * When the given function is called, it will wait the specified delay before
     * actually calling the function. If the function is called multiple times
     * within that delay, it will only call the function once after the delay
     * has passed.
     *
     * @param fn - The function to debounce.
     * @param delay - The number of milliseconds to delay calling the function.
     * @returns A debounced version of the given function.
     * @since v1.0.8
     */
    debounceSync<T extends (...args: any[]) => any>(
        fn: T,
        delay: number,
        options?: {
            onDone?: (result: ReturnType<T>) => void;
            onError?: (err: unknown) => void;
        }
    ): (...args: Parameters<T>) => void {
        let timeout: ReturnType<typeof setTimeout> | null = null;

        return (...args: Parameters<T>) => {
            if (timeout) clearTimeout(timeout);

            timeout = setTimeout(() => {
                try {
                    const result = fn(...args);
                    options?.onDone?.(result);
                } catch (error) {
                    options?.onError?.(error);
                }
            }, delay);
        };
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