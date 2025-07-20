# 📘 Record Utilities

Type-safe utilities for working with plain objects (records).

The `record` module provides runtime-safe helpers to interact with JavaScript objects that follow the `Record<string, any>` structure. It simplifies common operations like deep freezing, property checking, and safe JSON serialization.

---

## Access the record utility

```ts
import atomix from '@nasriya/atomix';

const records = atomix.dataTypes.record;
```
---
## APIs
| API                                | Description                                                    |
| ---------------------------------- | -------------------------------------------------------------- |
| [guard](./record-guard.md)         | Provides validation methods for record types                   |
| [hasOwnProperty](#-hasownproperty) | Checks if a record has a given property as its own key         |
| [toMap](#-tomap)                   | Converts a record to a `Map<string, any>`                      |
| [freeze](#-freeze)                 | Returns a shallow frozen copy of a record                      |
| [deepFreeze](#-deepfreeze)         | Returns a deeply frozen copy of a record                       |
| [stringify](#-stringify)           | Safely converts a record to a JSON string                      |
| [parse](#-parse)                   | Parses a JSON string into a typed `Record<string, any>` object |
| [keys](#-keys)                     | Returns an array of all keys in a record                       |
| [values](#-values)                 | Returns an array of all values in a record                     |
| [entries](#-entries)               | Returns an array of all entries in a record                    |

---
## API Details

### ✅ `hasOwnProperty`
Signature: `hasOwnProperty(obj: unknown, prop: string): boolean`

Checks if the specified property exists as the object's own property.

```ts
const record = { foo: 'bar' };
records.hasOwnProperty(record, 'foo'); // true
records.hasOwnProperty(record, 'bar'); // false
```

### 🔄 `toMap`
Signature: `toMap<K extends string, V>(obj: Record<K, V>): Map<K, V>`

Converts a Record object into a Map.

```ts
const record = { foo: 'bar', baz: 'qux' };
const map = records.toMap(record);
console.log(map); // Map { "foo" => "bar", "baz" => "qux" }
```

### 🧊 `freeze`
Signature: `freeze<T extends Record<string, any>>(obj: T): Readonly<T>`

Creates a frozen (immutable) shallow copy of the Record object.

```ts
const record = { foo: 'bar' };
const frozen = records.freeze(record);
// frozen is now immutable
```

### 🧊 `deepFreeze`
Signature: `deepFreeze<T extends Record<string, any>>(obj: T): DeepReadonly<T>`

Creates a deeply frozen (immutable) copy of the Record object and all nested objects.

```ts
const record = { foo: 'bar', nested: { x: 1 } };
const frozen = records.deepFreeze(record);
// frozen and nested are now immutable
```

### 📝 `stringify`
Signature: `stringify<T extends Record<string, any>>(obj: T, spaces?: number): Stringified<T>`

Converts a Record object to a JSON string, optionally pretty-printed.

```ts
const record = { foo: 'bar', age: 16 };
const jsonString = records.stringify(record, 2);
console.log(jsonString);
/*
{
  "foo": "bar",
  "age": 16
}
*/
```

### 📝 `parse`
Signature: `parse<T>(json: Stringified<T>): JSONObject<T>`

Parses a JSON string back into a Record object.

```ts
const jsonString = '{"foo":"bar","age":16}';
const record = records.parse(jsonString);
console.log(record); // { foo: "bar", age: 16 }
```

### 🔑 `keys`
Signature: `keys<T extends Record<string, any>>(obj: T): (keyof T)[]`

Returns an array of all keys in the Record object.

```ts
const record = { foo: 'bar', age: 16 };
const keys = records.keys(record);
console.log(keys); // ["foo", "age"]
```

### 📦 `values`
Signature: `values<T extends Record<string, any>>(obj: T): T[keyof T][]`

Returns an array of all values in the Record object.

```ts
const record = { foo: 'bar', age: 16 };
const values = records.values(record);
console.log(values); // ["bar", 16]
```

### 📦 `entries`
Signature: `entries<TObj extends Record<string, any>, TKey extends keyof TObj>(obj: TObj): [TKey, TObj[TKey]][]`

Returns an array of [key, value] pairs from the Record object.

```ts
const record = { foo: 'bar', age: 16 };
const entries = records.entries(record);
console.log(entries); // [["foo", "bar"], ["age", 16]]
```