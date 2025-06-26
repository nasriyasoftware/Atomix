# 🧱 Object Utilities  
Generic object helpers with deep freeze, smart cloning, and safe JSON handling for arrays and records.

---

## Access the object utility

```ts
import atomix from '@nasriya/atomix';

const object = atomix.dataTypes.object;
```
---
## APIs Overview

| API                        | Description                                                            |
| -------------------------- | ---------------------------------------------------------------------- |
| [clone](#clone)            | Creates a shallow copy using JSON.stringify and parse                  |
| [deepFreeze](#️-deepfreeze) | Recursively freezes the object and its nested children                 |
| [freeze](#-freeze)         | Freezes the object at the top level                                    |
| [guard](./object-guard.md) | Provides validation methods for generic object types                   |
| [parse](#-parse)           | Parses a JSON string into an object or array                           |
| [smartClone](#-smartclone) | Deep clones objects, arrays, Maps, Sets, and instances with `.clone()` |
| [stringify](#-stringify)   | Converts a record or array to a JSON string                            |

---
## API Details

### `clone`
Signature: `clone<T>(obj: T): T`

Creates a shallow clone using `JSON.parse(JSON.stringify(obj))`.

```ts
const original = { name: "Alice", tags: ["dev", "ts"] };
const copy = object.clone(original);

console.log(copy); // { name: 'Alice', tags: [ 'dev', 'ts' ] }
```

For smart cloning, see [smartClone](#-smartclone).

### ❄️ `deepFreeze`
Signature: `deepFreeze<T extends Objects>(obj: T): DeepReadonly<T>`

Recursively freezes the object and all nested objects or arrays.

```ts
const data = { user: { name: "Ali" }, roles: ["admin"] };
const frozen = object.deepFreeze(data);

// Any attempt to mutate will throw in strict mode
frozen.user.name = "Sam"; // ❌ TypeError
```

### 🧊 `freeze`
Signature: `freeze<T extends Objects>(obj: T): Readonly<T>`

Freezes only the top-level properties of the object.

```ts
const config = { debug: true };
const frozen = object.freeze(config);

config.debug = false; // ❌ TypeError
```

### 📥 `parse`
Signature: `parse<T>(json: Stringified<T>): JSONObject<T>`

Parses a valid JSON string into a strongly typed object or array.

```ts
const json = '{"enabled":true}';
const parsed = object.parse<{ enabled: boolean }>(json);

console.log(parsed.enabled); // true
```

### 🧠 `smartClone`

**Signature:** `smartClone<T>(obj: T): T`

Creates a deep copy of any given object, array, Map, Set, or class instance.  
Special behavior: If an object has a `clone()` method, it will be called and its result returned (instead of just copying the reference).

```ts
const cloned = objects.smartClone(original);
```

Example: Cloning plain objects and arrays

```ts
const original = {
  user: { name: 'Ahmad', age: 30 },
  tags: ['typescript', 'utils'],
};

const cloned = objects.smartClone(original);
original.user.age = 40;
original.tags.push('mutated');

console.log(cloned.user.age); // 30
console.log(cloned.tags);     // ['typescript', 'utils']
```

Example: Preserving .clone() behavior in instances

```ts
class User {
  constructor(public name: string) {}
  clone() {
    return new User(`[copy] ${this.name}`);
  }
}

const input = {
  author: new User('Nasriya'),
  ids: new Set([1, 2, 3]),
};

const cloned = objects.smartClone(input);

console.log(cloned.author.name); // "[copy] Nasriya"
console.log(cloned.author === input.author); // false
console.log(cloned.ids !== input.ids); // true
```
In this case, the User instance was cloned using its custom clone() method instead of being copied by reference.

### 📝 `stringify`
Signature: `stringify<T extends Objects>(obj: T, spaces?: number): Stringified<T>`

Serializes a record or array to a JSON string.

```ts
const settings = { darkMode: true };
const json = object.stringify(settings, 2);

console.log(json);
/*
{
  "darkMode": true
}
*/
```