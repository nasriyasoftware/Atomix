# 🛡️ Object Guard  
Type-safe validation helpers for object values.

The `guard` module provides runtime checks to verify if values are valid objects or can be safely frozen.  
It ensures type safety when working with generic values, external input, or structural utilities.

---

## Access the objects guard

```ts
import atomix from '@nasriya/atomix';

const objectsGuard = atomix.dataTypes.object.guard;
```
## APIs
| API                          | Description                                                     |
| ---------------------------- | --------------------------------------------------------------- |
| [isObject](#-isobject)       | Checks if the value is any non-null object                      |
| [isFreezable](#️-isfreezable) | Checks if the value is a record or array (i.e., freezable type) |


---
## Examples

### 🧱 `isObject`
Signature: `isObject(value: unknown): value is object`

Checks if a value is a non-null object (including arrays, class instances, and records).

```ts
objectsGuard.isObject({});             // true
objectsGuard.isObject([1, 2, 3]);      // true
objectsGuard.isObject(new Date());     // true
objectsGuard.isObject(null);           // false
objectsGuard.isObject(123);            // false
objectsGuard.isObject('hello');        // false
```

### ❄️ `isFreezable`
Signature: `isFreezable(value: unknown): value is object`

Checks whether a value is a freezable object, such as a plain object or an array.

```ts
objectsGuard.isFreezable({}); // true
objectsGuard.isFreezable([1, 2, 3]); // true
objectsGuard.isFreezable(null); // false

class MyClass {}
objectsGuard.isFreezable(new MyClass()); // false
```