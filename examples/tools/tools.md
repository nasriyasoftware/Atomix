# 🛠️ Tools Utilities
Advanced utility classes to help manage asynchronous workflows, task queues, and other generalized tools for building robust applications.

---
## Access the tools utility

```ts
import atomix from '@nasriya/atomix';

const tools = atomix.tools;
```

**OR**

```ts
import * as tools from '@nasriya/atomix/tools';
```
---
## Available Tools
| Tool                     | Description                                          | API Reference                 |
| ------------------------ | ---------------------------------------------------- | ----------------------------- |
| [TaskQueue](#️-taskqueue) | A prioritized task queue manager for async workflows | [API Details](./TaskQueue.md) |

---
## Core APIs
These utilities are available as classes under the `tools` namespace.

### 🗂️ TaskQueue
A prioritized task queue manager that helps you run async tasks with priorities and control.

```ts
const taskQueue = new atomix.tools.TaskQueue();

taskQueue.addTask({
    id: 'task1',
    priority: 2,
    action: async () => {
        console.log('Running task 1');
    }
});

await taskQueue.untilComplete();
```

**[:: See full API reference & examples → ::](./TaskQueue.md)**