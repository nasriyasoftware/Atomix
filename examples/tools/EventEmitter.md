# EventEmitter

The `EventEmitter` is a powerful and lightweight event management utility designed to handle synchronous or asynchronous events with full control over the event lifecycle. It supports `beforeAll`, `normal`, and `afterAll` handler types for fine-grained behavior control, handler limits with customizable overflow behavior, and a clean interface for removing handlers.

---

## Importing & Creating an instance

```ts
import { EventEmitter } from '@nasriya/atomix/tools';

const emitter = new EventEmitter();
```

You may optionally provide a type map to get full type safety for event names and arguments:

```ts
type Events = {
    load: (id: number) => void;
    ready: () => void;
};

const emitter = new EventEmitter<Events>();
```
---

## Key Features
- Supports three handler types: `beforeAll`, `normal`, `afterAll`
- `beforeAll` runs before all normal handlers, `afterAll` runs after
- One-time handlers via `{ once: true }`
- Global wildcard (`'*'`) event support
- Total handler limit enforcement with customizable overflow behavior
- Async-safe event emission
- Strong TypeScript typing via generics
---

## API Reference

### `on`
**Signature:** `on(eventName, handler, options?): this`

Registers an event handler.
- `eventName`:
  - A specific event name
  - Or `'*'` to listen to all events
- `handler`:
  - For named events: the event’s handler function
  - For `'*'`: receives the event name as the first argument, followed by the event arguments
- `options` (optional):
  - `type`: `'beforeAll' | 'normal' | 'afterAll'` (default: `'normal'`)
  - `once`: If `true`, the handler is removed after the first invocation

```ts
emitter.on('ready', () => {
    console.log('Emitter is ready');
}, { once: true });

emitter.on('ready', () => {
    console.log('Emitter is ready before all handlers');
}, { type: 'beforeAll' });

emitter.on('load', (id) => {
    console.log(`${id} is loading...`);
});
```

### `emit`
**Signature:** `emit(eventName, ...args): Promise<void>`

Emits an event and triggers all associated handlers.

- Handlers are executed in the order:
  1. `beforeAll`
  2. `normal`
  3. `afterAll`
- Global (`'*'`) handlers always run and receive the event name as their first argument
- Supports both synchronous and asynchronous handlers

```ts
await emitter.emit('load', 123);
```

### `onMaxHandlers`
**Signature:** `onMaxHandlers(handlerOrError): this`

Defines the behavior when the total number of handlers exceeds the configured limit.

- Pass a function to be notified when the limit is exceeded
- Or pass an `Error` instance to be thrown immediately

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

### `maxTotalHandlers`

Gets or sets the maximum number of handlers allowed across all events.

```ts
emitter.maxTotalHandlers = 5;
console.log(emitter.maxTotalHandlers); // 5
```

### `maxHandlers` (deprecated)

Alias for [maxTotalHandlers](#maxTotalHandlers).

> [!WARNING]
> `maxHandlers` is *deprecated* and will be removed in a future minor release.  
> Use `maxTotalHandlers` instead.

---
## Handler Types
- **`beforeAll`**  
  A singleton handler that runs before any normal handlers.
- **`normal`**  
  Standard handlers registered in order. May be one-time via `{ once: true }`.
- **`afterAll`**  
  A singleton handler that runs after all normal handlers.

---
## Error Handling
- Errors thrown inside any handler are caught and logged by default.
- You can override the `onMaxHandlers` behavior to throw custom errors.

---
## Example: Typed User Login Event

```ts
// Define the events and their argument types
type AuthEvents = {
    login: (user: { id: number; name: string }) => void;
    logout: (userId: number) => void;
};

const authEmitter = new EventEmitter<AuthEvents>();

// beforeAll: setup user session or context
authEmitter.on('login', (user) => {
    console.log(`Preparing login context for ${user.name}`);
}, { type: 'beforeAll' });

// normal: main login handler
authEmitter.on('login', (user) => {
    console.log(`User ${user.name} logged in successfully`);
});

// afterAll: logging or analytics
authEmitter.on('login', (user) => {
    console.log(`Logging login activity for ${user.name}`);
}, { type: 'afterAll' });

// global handler: runs for any event
authEmitter.on('*', (eventName, ...args) => {
    console.log(`Global handler detected event "${eventName}" with payload:`, args);
});

// simulate a user login
await authEmitter.emit('login', { id: 42, name: 'Alice' });

// TypeScript enforces correct arguments:
// authEmitter.emit('login', { id: 'wrong', name: 'Alice' }); // ❌ Error
```

## Example: Typed File Upload Event

```ts
// Define events and argument types
type UploadEvents = {
    start: (file: { name: string; size: number }) => void;
    progress: (file: { name: string }, percent: number) => void;
    complete: (file: { name: string }) => void;
    error: (file: { name: string }, error: Error) => void;
};

const uploadEmitter = new EventEmitter<UploadEvents>();

// beforeAll: prepare resources for all start events
uploadEmitter.on('start', (file) => {
    console.log(`Preparing upload resources for ${file.name}`);
}, { type: 'beforeAll' });

// normal: handle upload start
uploadEmitter.on('start', (file) => {
    console.log(`Uploading file: ${file.name} (${file.size} bytes)`);
});

// afterAll: cleanup or logging
uploadEmitter.on('start', (file) => {
    console.log(`Upload start event completed for ${file.name}`);
}, { type: 'afterAll' });

// progress: track progress
uploadEmitter.on('progress', (file, percent) => {
    console.log(`Upload progress for ${file.name}: ${percent}%`);
});

// complete: handle successful upload
uploadEmitter.on('complete', (file) => {
    console.log(`File ${file.name} uploaded successfully`);
});

// error: handle upload errors
uploadEmitter.on('error', (file, error) => {
    console.error(`Error uploading ${file.name}:`, error.message);
});

// global handler: runs for any upload event
uploadEmitter.on('*', (eventName, ...args) => {
    console.log(`Event "${eventName}" triggered with args:`, args);
});

// simulate an upload
const file = { name: 'photo.jpg', size: 1200 };
await uploadEmitter.emit('start', file);
await uploadEmitter.emit('progress', file, 50);
await uploadEmitter.emit('progress', file, 100);
await uploadEmitter.emit('complete', file);
```
---
## See Also

- [atomix.tools namespace](./tools.md) - overview of all available tools.