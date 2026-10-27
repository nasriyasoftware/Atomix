import debouncer from '../../../src/tools/debouncer/debouncer';
import type { AnyFunction, Debounced, DebouncedSync } from '../../../src/tools/debouncer/types';

describe('Debouncer', () => {
    let syncDebouncers: DebouncedSync<AnyFunction>[];
    let asyncDebouncers: Debounced<AnyFunction>[];

    const createSyncDebouncer = <T extends AnyFunction>(
        fn: T,
        delay: number,
        options?: {
            onDone?: (result: ReturnType<T>) => void;
            onError?: (err: unknown) => void;
        }
    ): DebouncedSync<T> => {
        const debounced = debouncer.debounceSync(fn, delay, options);
        syncDebouncers.push(debounced as DebouncedSync<AnyFunction>);
        return debounced;
    };

    const createAsyncDebouncer = <T extends AnyFunction>(fn: T, delay: number): Debounced<T> => {
        const debounced = debouncer.debounce(fn, delay);
        asyncDebouncers.push(debounced as Debounced<AnyFunction>);
        return debounced;
    };

    beforeEach(() => {
        syncDebouncers = [];
        asyncDebouncers = [];
        jest.useFakeTimers();
    });

    afterEach(() => {
        for (const debounced of syncDebouncers) { debounced.cancel(); }
        for (const debounced of asyncDebouncers) { debounced.cancel(); }
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it('runs a synchronous callback once with the latest arguments after the delay', () => {
        const fn = jest.fn((value: number) => value * 2);
        const onDone = jest.fn();
        const debounced = createSyncDebouncer(fn, 100, { onDone });

        debounced(1);
        jest.advanceTimersByTime(50);
        debounced(3);

        jest.advanceTimersByTime(99);
        expect(fn).not.toHaveBeenCalled();

        jest.advanceTimersByTime(1);
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith(3);
        expect(onDone).toHaveBeenCalledWith(6);
    });

    it('cancels a pending synchronous callback', () => {
        const fn = jest.fn();
        const debounced = createSyncDebouncer(fn, 100);

        debounced('value');
        debounced.cancel();
        jest.advanceTimersByTime(100);

        expect(fn).not.toHaveBeenCalled();
    });

    it('flushes all pending synchronous callbacks when cleared', () => {
        const first = jest.fn();
        const second = jest.fn();
        const debouncedFirst = createSyncDebouncer(first, 100);
        const debouncedSecond = createSyncDebouncer(second, 200);

        debouncedFirst('first');
        debouncedFirst('latest');
        debouncedSecond('second');

        debouncer.clear();

        expect(first).toHaveBeenCalledTimes(1);
        expect(first).toHaveBeenCalledWith('latest');
        expect(second).toHaveBeenCalledTimes(1);
        expect(second).toHaveBeenCalledWith('second');

        jest.advanceTimersByTime(200);
        expect(first).toHaveBeenCalledTimes(1);
        expect(second).toHaveBeenCalledTimes(1);
    });

    it('passes synchronous callback errors to onError', () => {
        const error = new Error('sync failure');
        const onError = jest.fn();
        const debounced = createSyncDebouncer(() => { throw error; }, 100, { onError });

        debounced();
        jest.advanceTimersByTime(100);

        expect(onError).toHaveBeenCalledWith(error);
    });

    it('shares a promise for calls in one async debounce batch and uses the latest arguments', async () => {
        const fn = jest.fn(async (value: number) => value * 2);
        const debounced = createAsyncDebouncer(fn, 100);

        const firstPromise = debounced(1);
        void firstPromise.catch(() => undefined);
        const secondPromise = debounced(3);

        expect(secondPromise).toBe(firstPromise);

        await jest.advanceTimersByTimeAsync(100);

        await expect(firstPromise).resolves.toBe(6);
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith(3);
    });

    it('starts a new async batch while the previous callback is still running', async () => {
        let resolveFirst!: (value: string) => void;
        const fn = jest.fn((value: string) => {
            if (value === 'first') {
                return new Promise<string>(resolve => { resolveFirst = resolve; });
            }

            return Promise.resolve(`${value}-done`);
        });
        const debounced = createAsyncDebouncer(fn, 50);

        const firstPromise = debounced('first');
        void firstPromise.catch(() => undefined);
        await jest.advanceTimersByTimeAsync(50);

        const secondPromise = debounced('second');
        void secondPromise.catch(() => undefined);
        expect(secondPromise).not.toBe(firstPromise);

        await jest.advanceTimersByTimeAsync(50);
        await expect(secondPromise).resolves.toBe('second-done');

        resolveFirst('first-done');
        await expect(firstPromise).resolves.toBe('first-done');
        expect(fn).toHaveBeenNthCalledWith(1, 'first');
        expect(fn).toHaveBeenNthCalledWith(2, 'second');
    });

    it('rejects a pending async promise when cancelled', async () => {
        const fn = jest.fn(async (value: string) => value);
        const debounced = createAsyncDebouncer(fn, 100);
        const promise = debounced('value');
        void promise.catch(() => undefined);

        debounced.cancel();

        await expect(promise).rejects.toThrow('Debounced function cancelled');
        await jest.advanceTimersByTimeAsync(100);
        expect(fn).not.toHaveBeenCalled();
    });

    it('rejects the async promise when the callback throws', async () => {
        const error = new Error('async failure');
        const fn = jest.fn(async () => { throw error; });
        const debounced = createAsyncDebouncer(fn, 100);
        const promise = debounced();
        void promise.catch(() => undefined);

        await jest.advanceTimersByTimeAsync(100);

        await expect(promise).rejects.toBe(error);
    });
});
