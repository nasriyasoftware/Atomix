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
| Tool                           | Description                                          | API Reference                    |
| ------------------------------ | ---------------------------------------------------- | -------------------------------- |
| [TaskQueue](#️-taskqueue)       | A prioritized task queue manager for async workflows | [API Details](./TaskQueue.md)    |
| [EventEmitter](#️-eventemitter) | A simple event emitter for event-driven applications | [API Details](./EventEmitter.md) |

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

### 🔔 EventEmitter
A simple yet structured event system with support for lifecycle hooks and one-time handlers.

```ts
const emitter = new atomix.tools.EventEmitter();

// Add a regular handler
emitter.on('message', (text) => {
    console.log('Message received:', text);
});

// Add a one-time handler
emitter.on('message', () => {
    console.log('This runs only once');
}, { once: true });

// Add a beforeAll handler
emitter.on('message', () => {
    console.log('Preparing to emit "message" event');
}, { type: 'beforeAll' });

await emitter.emit('message', 'Hello');
await emitter.emit('message', 'World');
```

**[:: See full API reference & examples → ::](./EventEmitter.md)**