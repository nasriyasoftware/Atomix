# TasksQueue

The `TasksQueue` is a general-purpose prioritized task queue manager designed to handle asynchronous workflows with multiple priority levels. It allows you to add tasks with varying priorities, automatically runs them in order, and provides lifecycle hooks for completion, error handling, and post-processing.

---

## Importing & Creating an instance

```ts
import { TasksQueue } from '@nasriya/atomix/tools';

const taskQueue = new TasksQueue({
    autoRun: true,         // Optional: start processing as tasks are added
    concurrencyLimit: 2    // Optional: run 2 tasks concurrently
});
```
---

## Key Features
- Supports 4 priority levels: `0` (highest) to `3` (lowest)
- Handles asynchronous task processing with concurrency control
- Per-task lifecycle callbacks: `onResolve`, `onReject`, and `onDone`
- Unique task IDs with built-in generation and collision prevention
- Supports both single and bulk task addition
- Allows manual or automatic execution (`autoRun`)
- Provides queue stats and task existence checks
- Supports pausing and cancelling pending tasks
- Offers `untilComplete()` to await full queue completion

## API Reference

| Method / Property         | Description                                                                                   |
|--------------------------|-----------------------------------------------------------------------------------------------|
| `constructor(options?)`  | Creates a new `TasksQueue` instance. Accepts optional configuration such as `autoRun`.        |
| `addTask(task, options?)`| Adds a single task to the queue. Optionally overrides `autoRun` for this call.                |
| `bulkAddTasks(tasks, options?)` | Adds multiple tasks to the queue at once. Optionally overrides `autoRun`.              |
| `run()`                  | Starts processing tasks in the queue. Can be awaited.                                         |
| `terminate()`            | Gracefully stops the queue from processing further tasks. Running tasks will continue.        |
| `untilComplete()`        | Returns a promise that resolves when all tasks are completed and the queue is idle.           |
| `isRunning`              | Indicates whether the queue is currently processing tasks.                                    |
| `pendingCount`           | Returns the number of tasks waiting to be processed.                                          |
| `activeCount`            | Returns the number of currently running tasks.                                                |
| `completedCount`         | Returns the number of successfully completed tasks.                                           |
| `failedCount`            | Returns the number of failed tasks.                                                           |
| `queueStats()`           | Returns an object with detailed statistics about queue state and lifecycle counters.          |

---

## Configuration Options
### `TasksQueueOptions`

```ts
export interface TasksQueueOptions {
  /**
   * Whether the queue should automatically start processing tasks
   * when new tasks are added.
   * @default true
   */
  autoRun?: boolean;

  /**
   * Maximum number of tasks to run concurrently.
   * @default 1
   */
  concurrencyLimit?: number;
}
```

---

## Add Options (Per Call)
### `AddTasksBaseOptions`

```ts
export interface AddTasksBaseOptions {
  /**
   * Whether to auto-run the queue for this call only,
   * regardless of the queue’s default `autoRun` setting.
   * 
   * This does not affect the global setting.
   * @default false
   */
  autoRun?: boolean;
}
```

### Lifecycle
### `BaseQueueTask`

```ts
interface BaseQueueTask<
    T = any,
    K extends Record<string, any> = Record<string, any>
> {
    id?: string;
    type: string;
    priority?: 0 | 1 | 2 | 3;
    metadata?: K;
    action: (metadata?: DeepReadonly<K>) => T | Promise<T>;
    onResolve?: (result?: T, metadata?: DeepReadonly<K>) => any | Promise<any>;
    onReject?: (error: Error) => any | Promise<any>;
    onDone?: () => any | Promise<any>;
}
```

---

### Stats Object
```ts
stats: Readonly<{
    total: number;
    processed: number;
    succeeded: number;
    failed: number;
    pending: number;
}>
```
- total: Number of tasks added since queue creation
- processed: Completed tasks (resolved or rejected)
- succeeded: Tasks resolved successfully
- failed: Tasks that threw errors
- pending: Tasks still in queue or running

---
## Examples

### Typed Signup Queue

```ts
type OKResponse = { ok: true; userId: string };
type ErrorResponse = { ok: false; error: Error };
type Response = OKResponse | ErrorResponse;

interface MetaData {
    name: string;
    age: number;
    email: string;
    password: string;
}

const taskQueue = new TasksQueue({ autoRun: true });

function createSignupTask(meta: MetaData) {
    const task: BaseQueueTask<Response, MetaData> = {
        type: "signup",
        priority: 2,
        metadata: meta,
        action: signup,
        onResolve: (response) => {
            if (response.ok) {
                console.log("User created:", response.userId);
            } else {
                console.error("Signup failed:", response.error);
            }
        },
        onDone: () => console.log("Signup task done.")
    };

    taskQueue.addTask(task);
}

async function signup(meta: MetaData): Promise<Response> {
    // Simulate async API call
    return { ok: true, userId: '123' };
}
```

### Payment Processing Queue

Imagine you have an app that processes payments. You want to ensure each payment is handled in order, safely, and you want to track success or failure for each payment.

First, define a custom task interface by extending [BaseQueueTask](#basequeuetask) with payment-specific metadata and result types:

```ts
interface PaymentResult {
    transactionId: string;
    status: 'success' | 'failed';
    amount: number;
}

interface PaymentMetadata {
    userId: string;
    amount: number;
    paymentMethod: string;
}

interface PaymentTask extends BaseQueueTask<PaymentResult, PaymentMetadata> {
    type: 'process-payment';
}
```

Next, create a `TasksQueue` instance and add payment tasks:

```ts
import { TasksQueue } from '@nasriya/atomix/tools';

const paymentQueue = new TasksQueue();

function createPaymentTask(metadata: PaymentMetadata): PaymentTask {
    return {
        id: paymentQueue.generateTaskId(),
        type: 'process-payment',
        priority: 1, // medium priority
        metadata,
        action: async (meta) => {
            // Simulate payment processing
            console.log(`Processing payment for user ${meta.userId}...`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // simulate async work

            // Return a fake result
            return {
                transactionId: `txn_${Date.now()}`,
                status: 'success',
                amount: meta.amount,
            };
        },
        onResolve: (result) => {
            console.log(`Payment successful:`, result);
        },
        onReject: (error) => {
            console.error(`Payment failed:`, error);
        },
        onDone: () => {
            console.log('Payment task done');
        }
    };
}

// Add several payment tasks to the queue
paymentQueue.addTask(createPaymentTask({ userId: 'user1', amount: 50, paymentMethod: 'card' }));
paymentQueue.addTask(createPaymentTask({ userId: 'user2', amount: 100, paymentMethod: 'paypal' }));
paymentQueue.addTask(createPaymentTask({ userId: 'user3', amount: 25, paymentMethod: 'card' }));

// Wait for all payments to finish processing
await paymentQueue.untilComplete();

console.log('All payment tasks have been processed.');
```

This way, payments are handled in order with controlled concurrency, and you get callbacks for success, failure, and completion — helping you build a reliable payment system!

---
## See Also

- [atomix.tools namespace](./tools.md) - overview of all available tools.