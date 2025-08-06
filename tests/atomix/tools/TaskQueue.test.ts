import { BaseQueueTask } from '../../../src/tools/queues/docs';
import TasksQueue from '../../../src/tools/queues/TasksQueue';

describe('TasksQueue - extended behaviors', () => {
    it('should process a task immediately if method-level autoRun is true, regardless of queue autoRun setting', async () => {
        const queue = new TasksQueue({ autoRun: false });

        const result: number[] = [];

        queue.addTask({
            type: 'test',
            priority: 2,
            action: async () => {
                result.push(42);
            }
        }, { autoRun: true });

        await queue.untilComplete();
        expect(result).toEqual([42]);
    });

    it('should call onResolve, onReject, and onDone callbacks appropriately', async () => {
        const queue = new TasksQueue({ autoRun: true });

        const events: string[] = [];

        queue.addTask({
            type: 'success',
            action: async () => 'ok',
            onResolve: (res) => events.push(`resolved:${res}`),
            onReject: () => events.push('rejected'),
            onDone: () => events.push('done-success')
        });

        queue.addTask({
            type: 'failure',
            action: async () => {
                throw new Error('fail');
            },
            onResolve: () => events.push('should-not-resolve'),
            onReject: (err) => events.push(`rejected:${err.message}`),
            onDone: () => events.push('done-failure')
        });

        await queue.untilComplete();

        expect(events).toEqual([
            'resolved:ok',
            'done-success',
            'rejected:fail',
            'done-failure'
        ]);
    });

    it('should handle strongly typed tasks with metadata and result', async () => {
        interface Meta {
            name: string;
            age: number;
        }

        type Result = { ok: true; userId: string } | { ok: false; error: Error };

        const queue = new TasksQueue({ autoRun: true });

        const meta: Meta = {
            name: 'Jane',
            age: 28
        };

        const action = async (meta: Meta): Promise<Result> => {
            if (meta.age >= 18) {
                return { ok: true, userId: 'abc123' };
            }
            return { ok: false, error: new Error('Too young') };
        };

        const task: BaseQueueTask<Result, Meta> = {
            type: 'typed',
            metadata: meta,
            action: () => action(meta),
            onResolve: (res) => {
                expect(res.ok).toBe(true);
                if (res.ok) {
                    expect(res.userId).toBe('abc123');
                }
            }
        };

        queue.addTask(task);
        await queue.untilComplete();
    });

    it('should prioritize higher priority tasks even when autoRun is enabled', async () => {
        const queue = new TasksQueue({ autoRun: true });

        const calls: string[] = [];

        queue.bulkAddTasks([
            {
                type: 'low',
                priority: 3,
                action: async () => calls.push('low')
            },
            {
                type: 'high',
                priority: 1,
                action: async () => calls.push('high')
            },
            {
                type: 'medium',
                priority: 2,
                action: async () => calls.push('medium')
            }
        ]);

        await queue.untilComplete();
        expect(calls).toEqual(['high', 'medium', 'low']);
    });
});