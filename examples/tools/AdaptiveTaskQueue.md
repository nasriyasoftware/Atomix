# AdaptiveTaskQueue

Extends [TasksQueue](./TasksQueue.md) with dynamic concurrency adjustment based on recent task addition rate (requests per second).

It automatically scales concurrency limits up or down to optimize throughput under changing load without manual tuning.

---

## Importing & Creating an instance

```ts
import { AdaptiveTaskQueue } from '@nasriya/atomix/tools';

const queue = new AdaptiveTaskQueue({
    autoRun: true,
    windowDurationMs: 1000,    // Optional: Rolling window size for rate measurement (ms)
    recalcDebounce: 200        // Optional: Minimum delay between concurrency recalculations (ms)
});

```
---

## Added Features & Differences from TasksQueue
| Feature                        | Description                                                                                            |
| ------------------------------ | ------------------------------------------------------------------------------------------------------ |
| **Dynamic concurrency**        | Automatically increases/decreases concurrencyLimit based on task addition rate.                        |
| **RPS tracking**               | Tracks requests per second over a sliding time window (`windowDurationMs`).                            |
| **Recalculation throttling**   | Uses a throttled function (every `recalcDebounce` ms) to avoid too-frequent concurrency changes.       |
| **Event callback**             | Supports `.onConcurrencyUpdate(cb: (newLimit: number) => void)` callback for concurrency changes.      |
| **Immutable concurrencyLimit** | The concurrency limit cannot be set manually; it is controlled internally. Setting it throws an error. |


## API Reference
All methods and properties from `TasksQueue` are inherited and available.

### New / Overridden Members
| Method / Property                                           | Description                                                                         |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `addTask(task, options?)`                                   | Overrides `TasksQueue.addTask` to track rate and trigger concurrency recalculation. |
| `bulkAddTasks(tasks, options?)`                             | Overrides `TasksQueue.bulkAddTasks` similarly for bulk additions.                   |
| `readonly rps: number`                                      | Current measured requests per second over the rolling window.                       |
| `readonly concurrencyLimit: number`                         | Overrides getter to expose current concurrencyLimit but prevents manual setting.    |
| `onConcurrencyUpdate(callback: (newLimit: number) => void)` | Register a listener invoked after concurrency changes.                              |

---

## Configuration Options
### `AdaptiveTaskQueueOptions`

```ts
type AdaptiveTaskQueueOptions = {
    /**
     * Whether to automatically start processing tasks
     * as soon as they are added to the queue.
     *
     * @default true
     *
     * If set to `false`, you must call `.run()` manually to start execution.
     */
    autoRun?: boolean;

    /**
     * The duration (in milliseconds) over which to calculate the average requests per second (RPS).
     * @default 1000
     * @since 1.0.23
     */
    windowDurationMs?: number;

    /**
     * The delay (in milliseconds) before recalculating the concurrency limit.
     * @default 200
     * @since 1.0.23
     */
    recalcDebounce?: number;
}
```

---
## Examples

### Usage Example: Adaptive Task Processing for API Requests

Imagine you have an API server that processes incoming requests which vary widely in volume. You want to automatically scale the number of concurrent workers handling requests based on how busy the server is — to maximize throughput without overwhelming resources.

```ts
import { AdaptiveTaskQueue } from '@nasriya/atomix/tools';

const apiQueue = new AdaptiveTaskQueue({
  autoRun: true,
  windowDurationMs: 500,   // Measure RPS over last 500ms
  recalcDebounce: 200      // Recalculate concurrency every 200ms at most
});

apiQueue.onConcurrencyUpdate(newLimit => {
  console.log(`Adjusted concurrency limit to: ${newLimit}`);
});

// Simulate incoming API requests
function simulateApiRequest(id: number) {
  apiQueue.addTask({
    type: 'apiRequest',
    action: async () => {
      console.log(`Processing request #${id}`);
      // Simulate async work like DB call or external API fetch
      await new Promise(res => setTimeout(res, 50));
    }
  });
}

// Simulate bursty traffic of 2000 requests
for (let i = 1; i <= 2000; i++) {
  simulateApiRequest(i);
}

await apiQueue.untilComplete();

console.log('All API requests processed.');
console.log(`Final concurrency limit: ${apiQueue.concurrencyLimit}`);
```
---
## Notes & Best Practices

- Use small `windowDurationMs` and `recalcDebounce` values for more responsive scaling, but beware of increased CPU overhead.
- `concurrencyLimit` is managed internally to avoid race conditions or invalid states.
- If you need manual control, prefer extending `TasksQueue` directly.
- The adaptive logic suits bursty workloads where static concurrency limits either underperform or waste resources.
---

## See Also
- [TasksQueue](./TasksQueue.md) — base class with static concurrency and priority queuing.
- [atomix.tools namespace](./tools.md) - overview of all available tools.