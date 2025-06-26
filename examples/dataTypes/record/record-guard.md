# 🛡️ Record Guard  
Type-safe validation helpers for Record objects.

The `record.guard` module provides runtime checks to ensure values are valid plain objects (records) and to help with type narrowing and validation in your TypeScript projects.

---

## Access the records guard

```ts
import atomix from '@nasriya/atomix';

const recordsGuard = atomix.dataTypes.record.guard;
```

---
## APIs
| API      | Description                                |
| -------- | ------------------------------------------ |
| isEmpty  | Checks if a Record has no key-value pairs  |
| isRecord | Checks if a value is a plain Record object |

---
## API Details

### ⚠️ `isEmpty`
Signature: `isEmpty(value: unknown): boolean`

Checks if the provided value is an empty Record (an object with no own keys).

```ts
recordsGuard.isEmpty({});          // true
recordsGuard.isEmpty({ foo: 'bar' }); // false
recordsGuard.isEmpty(null);        // false
recordsGuard.isEmpty([1, 2, 3]);   // false
```

### ✅ `isRecord`
Signature: `isRecord(value: unknown): value is Record<string, any>`

Checks if the provided value is a non-null plain object that is not an array.

```ts
recordsGuard.isRecord({ foo: 'bar' });  // true
recordsGuard.isRecord(null);             // false
recordsGuard.isRecord([1, 2, 3]);        // false
```