# 🧮 Number Guard  
Runtime validation methods for numbers, including checks for positivity, negativity, integer, float, and more.

---

## Access the numbers guard

```ts
import atomix from '@nasriya/atomix';

const numbersGuard = atomix.dataTypes.number.guard;
```

---
## APIs
| API                        | Description                                  |
| -------------------------- | -------------------------------------------- |
| [isFinite](#-isfinite)     | Checks if a value is a finite number         |
| [isFloat](#-isfloat)       | Checks if a value is a floating point number |
| [isInteger](#-isinteger)   | Checks if a value is an integer              |
| [isNaN](#-isnan)           | Checks if a value is NaN (Not-a-Number)      |
| [isNegative](#-isnegative) | Checks if a value is a negative number       |
| [isNumber](#-isnumber)     | Checks if a value is a number                |
| [isPositive](#-ispositive) | Checks if a value is a positive number       |

---
## API Details

### 🔢 `isFinite`
Signature: `isFinite(value: unknown): boolean`

Checks if a value is a finite number.

```ts
const result = numbers.guard.isFinite(123);
console.log(result); // true

console.log(numbers.guard.isFinite(Infinity)); // false
console.log(numbers.guard.isFinite(NaN));      // false
```

### 🌊 `isFloat`
Signature: `isFloat(value: unknown): boolean`

Checks if a value is a floating point number (not an integer).

```ts
console.log(numbers.guard.isFloat(3.14)); // true
console.log(numbers.guard.isFloat(42));   // false
```

### 🔢 `isInteger`
Signature: `isInteger(value: unknown): boolean`

Checks if a value is an integer.

```ts
console.log(numbers.guard.isInteger(10));     // true
console.log(numbers.guard.isInteger(10.5));   // false
```

### ❓ `isNaN`
Signature: `isNaN(value: unknown): value is typeof NaN`

Checks if a value is NaN (Not-a-Number).

```ts
console.log(numbers.guard.isNaN(NaN));        // true
console.log(numbers.guard.isNaN(123));        // false
console.log(numbers.guard.isNaN('not a number')); // false
```

### ➖ `isNegative`
Signature: `isNegative(value: unknown): boolean`

Checks if a value is a negative number.

```ts
console.log(numbers.guard.isNegative(-5));  // true
console.log(numbers.guard.isNegative(0));   // false
console.log(numbers.guard.isNegative(7));   // false
```

### 🔢 `isNumber`
Signature: `isNumber(value: unknown): value is number`

Checks if a value is a number.

```ts
console.log(numbers.guard.isNumber(123));      // true
console.log(numbers.guard.isNumber('123'));    // false
console.log(numbers.guard.isNumber(NaN));      // true (NaN is a number type)
```

### ➕ `isPositive`
Signature: `isPositive(value: unknown): boolean`

Checks if a value is a positive number.

```ts
console.log(numbers.guard.isPositive(5));   // true
console.log(numbers.guard.isPositive(0));   // false
console.log(numbers.guard.isPositive(-3));  // false
```