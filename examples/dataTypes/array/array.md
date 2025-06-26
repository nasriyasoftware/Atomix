# 🧮 Array Utilities  
Useful array manipulation helpers including chunking, grouping, flattening, shuffling, and more.

---

## Access the arrays utility

```ts
import atomix from '@nasriya/atomix';

const arrays = atomix.dataTypes.array;
```
---
## APIs

| API                         | Description                                         |
| --------------------------- | --------------------------------------------------- |
| [guard](./array-guard.md)   | Provides runtime validation for arrays.             |
| [head](#-head)               | Returns the first element of an array or undefined. |
| [last](#-last)               | Returns the last element of an array or undefined.  |
| [compact](#️-compact)         | Removes falsy values from the array.                |
| [unique](#-unique)           | Removes duplicate values from the array.            |
| [chunk](#-chunk)             | Splits the array into chunks of specified size.     |
| [groupBy](#-groupby)         | Groups array elements by a key function.            |
| [flatten](#-flatten)         | Flattens nested arrays up to specified depth.       |
| [deepFlatten](#-deepflatten) | Recursively flattens nested arrays completely.      |
| [difference](#-difference)   | Returns values in either array but not in both.     |
| [intersect](#-intersect)     | Returns common values between two arrays.           |
| [toggleValue](#-togglevalue) | Toggles presence of a value in the array.           |
| [mapAsync](#-mapasync)       | Maps elements asynchronously and returns results.   |
| [range](#-range)             | Generates an array of numbers in a range.           |
| [transpose](#-transpose)     | Transposes a matrix (array of arrays).              |
| [shuffle](#-shuffle)         | Returns a shuffled copy of the array.               |

---
## API Details

### 🔝 `head`
Signature: `head<T>(array: T[]): T | undefined`

Returns the first element of an array or undefined if empty.

```ts
const arr = [10, 20, 30];
console.log(arrays.head(arr)); // 10
console.log(arrays.head([]));  // undefined
```

### 🔚 `last`
Signature: `last<T>(array: T[]): T | undefined`

Returns the last element of an array or undefined if empty.

```ts
const arr = [10, 20, 30];
console.log(arrays.last(arr)); // 30
console.log(arrays.last([]));  // undefined
```

### ✂️ `compact`
Signature: `compact<T>(array: T[]): T[]`

Removes all falsy values (`false`, `0`, `null`, `undefined`, `''`, `NaN`) from the array.

```ts
const arr = [0, 1, false, 2, '', 3];
console.log(arrays.compact(arr)); // [1, 2, 3]
```

### 🔄 `unique`
Signature: `unique<T>(array: T[]): T[]`

Removes duplicate values from the array.

```ts
const arr = [1, 2, 2, 3, 3, 3];
console.log(arrays.unique(arr)); // [1, 2, 3]
```

### 🧩 `chunk`
Signature: `chunk<T>(array: T[], size: number): T[][]`

Splits the array into chunks of given size.

```ts
const arr = [1, 2, 3, 4, 5];
console.log(arrays.chunk(arr, 2)); // [[1, 2], [3, 4], [5]]
```

### 🗂️ `groupBy`
Signature: `groupBy<T, K extends string | number>(arr: T[], keyFn: (item: T) => K): Record<K, T[]>`

Groups array elements by the key returned from `keyFn`.

```ts
const arr = [1, 2, 3, 4];
const grouped = arrays.groupBy(arr, x => x % 2);
console.log(grouped);
// { '0': [2, 4], '1': [1, 3] }
```

### 🌀 `flatten`
Signature: `flatten<T>(array: T[], depth?: number): T[]`

Flattens nested arrays up to a specified depth (default 1).

```ts
const arr = [1, [2, [3, 4]]];
console.log(arrays.flatten(arr)); // [1, 2, [3, 4]]
console.log(arrays.flatten(arr, 2)); // [1, 2, 3, 4]
```

### 🌊 `deepFlatten`
Signature: `deepFlatten<T>(array: T[]): T[]`

Recursively flattens nested arrays completely.

```ts
const arr = [1, [2, [3, [4]]]];
console.log(arrays.deepFlatten(arr)); // [1, 2, 3, 4]
```

### ➖ `difference`
Signature: `difference<T>(a: T[], b: T[]): T[]`

Returns values in either array but not in both.

```ts
const arr1 = [1, 2, 3];
const arr2 = [2, 3, 4];
console.log(arrays.difference(arr1, arr2)); // [1, 4]
```

### ➕ `intersect`
Signature: `intersect<T>(a: T[], b: T[]): T[]`

Returns values common to both arrays.

```ts
const arr1 = [1, 2, 3];
const arr2 = [2, 3, 4];
console.log(arrays.intersect(arr1, arr2)); // [2, 3]
```

### 🔀 `toggleValue`
Signature: `toggleValue<T>(arr: T[], value: T, options?: { mutable?: boolean }): T[]`

Adds or removes value from the array, optionally mutating in place.

```ts
let arr = [1, 2, 3];
console.log(arrays.toggleValue(arr, 2)); // [1, 3]

arrays.toggleValue(arr, 2, { mutable: true });
console.log(arr); // [1, 3]
```

### 🔄 `mapAsync`
Signature: `mapAsync<T, U>(arr: T[], fn: (item: T, index: number) => Promise<U>): Promise<U[]>`

Asynchronously maps over array elements.

```ts
const arr = [1, 2, 3];
const result = await arrays.mapAsync(arr, async (x) => x * 2);
console.log(result); // [2, 4, 6]
```

### 🔢 `range`
Signature: `range(start: number, end: number, step?: number): number[]`

Generates numbers from `start` to `end` inclusive with an optional step.

```ts
console.log(arrays.range(1, 5)); // [1, 2, 3, 4, 5]
console.log(arrays.range(1, 10, 2)); // [1, 3, 5, 7, 9]
```

### 🔳 `transpose`
Signature: `transpose<T>(matrix: T[][]): T[][]`

Transposes a matrix (array of arrays).

```ts
const matrix = [[1, 2], [3, 4]];
console.log(arrays.transpose(matrix)); // [[1, 3], [2, 4]]
```

### 🎲 `shuffle`
Signature: `shuffle<T>(arr: T[]): T[]`

Returns a shuffled copy of the array.

```ts
const arr = [1, 2, 3, 4, 5];
console.log(arrays.shuffle(arr)); // e.g. [3, 1, 5, 2, 4]
```