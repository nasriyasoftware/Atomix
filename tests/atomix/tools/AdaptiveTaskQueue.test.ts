import AdaptiveTaskQueue from '../../../src/tools/queues/AdaptiveTaskQueue';

describe('AdaptiveTaskQueue', () => {
    it('should inherit task queue behavior and complete tasks as expected', async () => {
        const queue = new AdaptiveTaskQueue({ autoRun: true });
        const output: number[] = [];

        queue.bulkAddTasks([
            {
                type: 'job',
                priority: 1,
                action: async () => output.push(1),
            },
            {
                type: 'job',
                priority: 2,
                action: async () => output.push(2),
            },
        ]);

        await queue.untilComplete();
        expect(output).toEqual([1, 2]);
    });

    it('should dynamically adjust concurrency based on task rate', async () => {
        const queue = new AdaptiveTaskQueue({ autoRun: true, windowDurationMs: 500, recalcDebounce: 100 });

        const seen: number[] = [];

        // Force fast task addition to simulate high RPS
        for (let i = 0; i < 1500; i++) {
            queue.addTask({
                type: 'load',
                action: async () => seen.push(i)
            });
        }

        await queue.untilComplete();
        // Since RPS > 1000, we expect concurrency to have gone above 100
        expect(queue.concurrencyLimit).toBeGreaterThanOrEqual(200);
    });

    it('should call onConcurrencyUpdate under real stress', async () => {
        const queue = new AdaptiveTaskQueue({ autoRun: true });

        const updates: number[] = [];

        queue.onConcurrencyUpdate(newLimit => {
            updates.push(newLimit);
        });

        // Push 10,000 tasks with a tiny delay to simulate load burst
        for (let i = 0; i < 3_000; i++) {
            queue.addTask({
                type: 'adaptive',
                action: async () => {
                    // Small delay to simulate some work
                    await new Promise(res => setTimeout(res, 1));
                }
            });
        }

        // Wait until all tasks complete
        await queue.untilComplete();

        expect(updates.length).toBeGreaterThan(0);
        // Because 3k tasks with delays -> RPS high enough to increase concurrency limit
        expect(updates[updates.length - 1]).toBeGreaterThanOrEqual(200);
    });

    it('should ignore manual changes to concurrencyLimit', async () => {
        const queue = new AdaptiveTaskQueue({ autoRun: true, windowDurationMs: 100, recalcDebounce: 100 });

        // @ts-expect-error - concurrencyLimit setter is intentionally inaccessible
        expect(() => { queue.concurrencyLimit = 999 }).toThrow();

        for (let i = 0; i < 1500; i++) {
            queue.addTask({ type: 'a', action: async () => { } });
        }

        await queue.untilComplete();

        expect(queue.concurrencyLimit).toBeGreaterThanOrEqual(200);
    });

    it('should not recalculate concurrency if no tasks are added in the debounce window', async () => {
        const queue = new AdaptiveTaskQueue({ autoRun: true });

        const updates: number[] = [];

        queue.onConcurrencyUpdate((limit) => {
            updates.push(limit);
        });

        // Add a batch quickly
        for (let i = 0; i < 500; i++) {
            queue.addTask({ type: 'quiet', action: async () => { } });
        }

        // Re-run queue with no new additions
        await queue.untilComplete();

        // Shouldn't trigger a second adjustment
        expect(updates.length).toBe(1);
    });
});
