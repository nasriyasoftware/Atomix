# 🛡️ Array Guard  
Type-safe validation helpers for array values.

The `guard` module provides runtime checks for determining whether values are arrays and arrays of specific types. It helps enforce correctness and type narrowing when working with data that should be arrays, including non-empty arrays and arrays of numbers, strings, or nested arrays.

---

## Access the arrays guard

```ts
import atomix from '@nasriya/atomix';

const arraysGuard = atomix.dataTypes.array.guard;
```
---
## APIs
| API                                    | Description                                   |
| -------------------------------------- | --------------------------------------------- |
| [isArray](#-isarray)                   | Checks if a value is an array                 |
| [isNotEmpty](#-isnotempty)             | Checks if an array is non-empty               |
| [isArrayOf](#-isarrayof)               | Creates a guard for arrays of a specific type |
| [isArrayOfNumbers](#-isarrayofnumbers) | Checks if a value is an array of numbers      |
| [isArrayOfStrings](#-isarrayofstrings) | Checks if a value is an array of strings      |
| [isArrayOfArrays](#-isarrayofarrays)   | Checks if a value is an array of arrays       |

---
## API Details

### 📋 `isArray`
Signature: `isArray(value: unknown): value is Array<any>`

Checks if the provided value is an array.

```ts
arraysGuard.isArray([1, 2, 3]);  // true
arraysGuard.isArray('string');   // false
```

### 🔢 `isNotEmpty`
Signature: `isNotEmpty<T extends Array<T>>(value: unknown): value is NonEmptyArray<T>`

Checks if the value is a non-empty array.

```ts
arraysGuard.isNotEmpty([]);           // false
arraysGuard.isNotEmpty([1, 2, 3]);    // true
```

### 🧩 isArrayOf
Signature: `isArrayOf<T>(itemGuard: (item: unknown) => item is T): (value: unknown) => value is T[]`

Creates a guard function to check arrays of a specific type.

```ts
const isArrayOfNumbers = arraysGuard.isArrayOf((v): v is number => typeof v === 'number');

isArrayOfNumbers([1, 2, 3]);    // true
isArrayOfNumbers([1, '2', 3]);  // false
```

### 🔢 `isArrayOfNumbers`
Signature: `readonly isArrayOfNumbers`

Checks if the value is an array of numbers.

```ts
arraysGuard.isArrayOfNumbers([1, 2, 3]);    // true
arraysGuard.isArrayOfNumbers([1, '2', 3]);  // false
```

### 🆎 `isArrayOfStrings`
Signature: `readonly isArrayOfStrings`

Checks if the value is an array of strings.

```ts
arraysGuard.isArrayOfStrings(['a', 'b', 'c']);   // true
arraysGuard.isArrayOfStrings(['a', 2, 'c']);     // false
```

### 📚 `isArrayOfArrays`
Signature: `readonly isArrayOfArrays`

Checks if the value is an array of arrays.

```ts
arraysGuard.isArrayOfArrays([[1], [2, 3]]);  // true
arraysGuard.isArrayOfArrays([[1], 2]);       // false
```