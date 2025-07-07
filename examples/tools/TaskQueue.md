# TaskQueue

The `TaskQueue` is a general-purpose prioritized task queue manager designed to handle asynchronous workflows with multiple priority levels. It allows you to add tasks with varying priorities, automatically runs them in priority order, and provides lifecycle hooks for task completion and error handling.

---

## Importing & Creating an instance

```ts
import { TaskQueue } from '@nasriya/atomix/tools';

const taskQueue = new TaskQueue();
```
---

## Key Features
- Supports 4 priority levels (0 is highest, 3 is lowest).
- Handles asynchronous tasks with automatic scheduling.
- Task lifecycle callbacks: `onResolve`, `onReject`, `onDone`.
- Unique task IDs with automatic generation and duplication checks.
- Bulk addition of tasks.
- Access to queue statistics.
- Wait until all tasks complete with `untilComplete`().
---

## API Reference

### `BaseQueueTask`
This is the shape of a task that the queue can run. It has:

- A unique `id` (you can generate it or let the queue create one).
- A `type` that describes what kind of task it is.
- An optional `priority` (0 = highest, 3 = lowest, defaults to 3).
- Optional `metadata` with extra info for the task.
- An async `action` function that does the work, receiving the metadata.
- Optional callbacks for success (`onResolve`), failure (`onReject`), and completion (`onDone`).

```ts
interface BaseQueueTask<T = any, K extends Record<string, any> = Record<string, any>> {
    id: string;
    type: string;
    priority?: TaskPriorityLevel;
    metadata?: K;
    action: (metadata: DeepReadonly<K>) => T | Promise<T>;
    onResolve?: (result: T) => any | Promise<any>;
    onReject?: (error: Error) => any | Promise<any>;
    onDone?: () => any | Promise<any>;
}
```

### `addTask`
**Signature:** `addTask(task: BaseQueueTask): void`

Adds a single task to the queue.
- **Parameters**:
  - `task` — An object implementing the `BaseQueueTask` interface.
- **Throws**: Type errors or range errors if the task properties are invalid or duplicate IDs are detected.

### `bulkAddTasks`
**Signature:** `bulkAddTasks(tasks: BaseQueueTask[]): void`

Adds multiple tasks at once.
- **Parameters**:
    - `tasks` — Array of BaseQueueTask objects.

- **Throws**: Same validation as addTask for each task.

### `untilComplete`
**Signature:** `untilComplete(): Promise<void>`

Returns a promise that resolves when all queued tasks have completed processing.
Useful for waiting for queue idle state.

### `generateTaskId`
**Signature:** `generateTaskId(): string`

Generates a unique task ID guaranteed to not clash with current queue task IDs.

### `stats`
**Signature:**
```ts
stats: Readonly<{
    total: number;
    processed: number;
    succeeded: number;
    failed: number;
    pending: number;
}>
```

Statistics about the current state of the queue.
- `total`: Total tasks added since creation.
- `processed`: Tasks completed so far.
- `succeeded`: Number of tasks that resolved successfully.
- `failed`: Number of tasks that failed.
- `pending`: Number of tasks still in queu.

---
### Task Lifecycle Callbacks

Each task can specify optional callbacks:
- `onResolve(result: any)`: Called when the `action` resolves successfully.
- `onReject(error: any)`: Called when the `action` rejects with an error.
- `onDone()`: Called after `onResolve` or `onReject` to indicate completion.

Errors thrown inside these callbacks are caught and logged internally.

---
## Errors & Validation

- Adding tasks with duplicate IDs will throw a `RangeError`.
- Missing required properties (`type`, `action`) throws a `SyntaxError`.
- Invalid types for properties throw `TypeError`.
- Priorities outside 0–3 range throw `RangeError`.

---
## Example: Payment Processing Queue

Imagine you have an app that processes payments. You want to ensure each payment is handled in order, safely, and you want to track success or failure for each payment.

First, define a custom task interface by extending `BaseQueueTask` with payment-specific metadata and result types:

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

Next, create a `TaskQueue` instance and add payment tasks:

```ts
import { TaskQueue } from '@nasriya/atomix/tools';

const paymentQueue = new TaskQueue();

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