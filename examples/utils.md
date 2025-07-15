# 📦 Common Utilities
Helpful utility functions for text generation, timing, and function control.

---
## Access the utilities
```ts
import atomix from '@nasriya/atomix';

const utils = atomix.utils;
```

---
## The APIs
| API                                | Description                                                          |
| ---------------------------------- | -------------------------------------------------------------------- |
| [generateRandom](#-generaterandom) | Generate customizable random strings with optional character sets    |
| [sleep](#-sleep)                   | Pause execution for a specified time using a Promise                 |
| [debounce](#-debounce)             | Delay async function execution until no calls occur for a set time   |
| [debounceSync](#-debouncesync)     | Delay synchronous function calls until no calls occur for a set time |
| [throttle](#-throttle)             | Limit function calls to at most once per specified delay             |
| [once](#-once)                     | Ensure a function can only be executed a single time                 |
| [noop](#-noop)                     | A function that performs no operation (no-op)                        |



---
## API Details:

### 📌 `generateRandom`
Signature: `generateRandom(length, options?)`

Generate a random string with fine-grained control over included character types.

```ts
utils.generateRandom(12);
// "A8k$2Lp^Zr7!"

utils.generateRandom(8, {
  includeSymbols: false,
  includeUpperCaseChars: false,
  noSimilarChars: true,
});
// "a4dh8xke"
```

### ⏱ `sleep`
Signature: `sleep(ms)`

Pause execution for a given number of milliseconds.

```ts
await utils.sleep(1500);
// waits for 1.5 seconds
```

### 🌀 `debounce`
Signature: `debounce(fn, delay)`

Delays execution of `fn` until no calls have occurred within the specified delay. Returns a debounced function that returns a Promise resolving to the result of `fn`.

**Usage Example:**
```ts
const debouncedLog = utils.debounce((msg: string) => {
    console.log('Debounced:', msg);
    return msg.length;
}, 1000);

debouncedLog('Hello');
debouncedLog('World').then(length => {
    console.log(`Last message length: ${length}`);
});
```

**Canceling a Pending Call:**

Delays execution of a synchronous function `fn` until no calls have occurred within the specified delay. Returns a debounced function with a `.cancel()` method.

**Usage Example:**
```ts
const debouncedLog = utils.debounce((msg) => {
  console.log('Debounced:', msg);
}, 1000);

debouncedLog('Hello');
debouncedLog.cancel(); // Cancel the pending call; promise from last call rejects
```

### 🌀 `debounceSync`
Signature: `debounceSync(fn, delay)`

Delays execution of `fn` until no calls have occurred within the specified delay. Returns a debounced function that returns a Promise resolving to the result of `fn`.

```ts
const debouncedLog = utils.debounceSync((msg: string) => {
  console.log('Debounced:', msg);
}, 1000);

debouncedLog('Hello');
debouncedLog('World'); 
// Only logs "Debounced: World" after 1 second
```

**Canceling a Pending Call:**

The returned debounced function includes a `.cancel()` method to cancel any pending invocation before it happens.

```ts
const debouncedLog = utils.debounceSync((msg) => {
  console.log('Debounced:', msg);
}, 1000);

debouncedLog('Hello');
debouncedLog.cancel(); // Cancel the pending call silently, no log will happen
```

### 🚦 `throttle`
Signature: `throttle(fn, delay)`

Limit function execution to once per delay interval.

```ts
const throttledLog = utils.throttle((msg) => {
  console.log('Throttled:', msg);
}, 1000);

throttledLog('First');
setTimeout(() => throttledLog('Second'), 300);
setTimeout(() => throttledLog('Third'), 1200);
// Logs "Throttled: First" and "Throttled: Third"
```

### 🔁 `once`
Signature: `once(fn)`

nsure a function only runs once, caching its result.

```ts
let count = 0;
const initialize = utils.once(() => ++count);

initialize(); // 1
initialize(); // 1
initialize(); // 1
```

### 🙈 noop
Signature: `noop()`

A no-op function that does nothing.

```ts
const fallback = utils.noop;

fallback(); // does nothing
```