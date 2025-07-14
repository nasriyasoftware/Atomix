# EventEmitter

The `EventEmitter` is a powerful and lightweight event management utility designed to handle synchronous or asynchronous events with full control over the event lifecycle. It supports `beforeAll`, `normal`, and `afterAll` handler types for fine-grained behavior control, handler limits with customizable overflow behavior, and a clean interface for removing handlers.

---

## Importing & Creating an instance

```ts
import { EventEmitter } from '@nasriya/atomix/tools';

const emitter = new EventEmitter();
```
---

## Key Features
- Supports three types of handlers: `beforeAll`, `normal`, `afterAll`.
- `beforeAll` runs before all normal handlers, `afterAll` runs after.
- `normal` handlers can be persistent or one-time (`once`).
- Maximum handler limit enforcement with custom or built-in overflow handlers.
- Global wildcard event `*` support.
- Removes handlers by reference or clears all.
- Async-safe event emission with automatic error routing.
---

## API Reference

### `on`
**Signature:** `on(eventName, handler, options?): this`

Registers an event handler.

- `eventName`: The name of the event (string).
- `handler`: The function to execute.
- `options` (optional):
    - `type`: `'beforeAll' | 'normal' | 'afterAll'` — default is `'normal'`.
    - `once`: If `true`, the handler is removed after the first invocation.

```ts
emitter.on('load', () => console.log('Loaded'));
emitter.on('load', () => console.log('Init'), { type: 'beforeAll' });
emitter.on('load', () => console.log('Done'), { type: 'afterAll' });
```

### `emit`
**Signature:** `emit(eventName, ...args): Promise<void>`

Triggers all handlers for the given event.

```ts
await emitter.emit('load', 123);
```

Handlers are run in the order: `beforeAll` → `normal` → `afterAll`. If any are async, emit will await them.

### `onMaxHandlers`
**Signature:** `onMaxHandlers(handlerOrError): this`

Defines what happens when the number of handlers exceeds the limit.
- Pass a function `(eventName) => {}` to be notified when the limit is exceeded.
- Or pass an `Error` to be thrown immediately when the limit is breached.

```ts
emitter.maxHandlers = 5;
emitter.onMaxHandlers(new Error('Too many listeners'));
```

### `remove.handler`
**Signature:** `remove.handler(eventName, handler): boolean`

Removes a specific handler for a given event name.

```ts
function onLoad() {}
emitter.on('load', onLoad);
emitter.remove.handler('load', onLoad);
```


### `remove.allHandlers`
**Signature:** `remove.allHandlers(eventName?): boolean`

Removes all handlers for a specific event or for all events if no name is provided.

```ts
emitter.remove.allHandlers('load');
// or
emitter.remove.allHandlers();
```

### `eventNames`

Returns an array of all active event names (excluding `*`).

```ts
console.log(emitter.eventNames); // ['load', 'save']
```

### `handlersCount`

Returns the total number of handlers registered.

```ts
console.log(emitter.handlersCount); // 3
```

### `maxHandlers`

Controls or retrieves the maximum allowed number of handlers.

```ts
emitter.maxHandlers = 5;
console.log(emitter.maxHandlers); // 5
```

---
## Handler Types
- `beforeAll` — A singleton handler that runs before any normal handlers. Only one `beforeAll` can exist per event.
- `normal` — Regular handlers registered in order. Can be configured to run once or persist.
- `afterAll` — A singleton handler that runs after all normal handlers. Only one `afterAll` can exist per event.

---
## Example: User Login Event

```ts
const authEmitter = new EventEmitter();

authEmitter.on('login', () => {
  console.log('Main handler: user logged in');
});

authEmitter.on('login', () => {
  console.log('Preparing login context');
}, { type: 'beforeAll' });

authEmitter.on('login', () => {
  console.log('Logging activity');
}, { type: 'afterAll' });

await authEmitter.emit('login');

// Output:
// Preparing login context
// Main handler: user logged in
// Logging activity
```

---
## Error Handling
- Errors thrown inside any handler are caught and logged by default.
- You can override the `onMaxHandlers` behavior to throw custom errors.

---
## See Also

- [atomix.tools namespace](./tools.md) - overview of all available tools.