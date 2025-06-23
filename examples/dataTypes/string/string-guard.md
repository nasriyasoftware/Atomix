# 🛡️ String Guard
Type-safe validation helpers for string values.

The `guard` module provides a collection of runtime checks for determining whether values are valid strings under different conditions. It helps enforce correctness and type narrowing when working with user input, form data, or external sources.

---

## Access the strings utility

```ts
import atomix from '@nasriya/atomix';

const stringsGuard = atomix.dataTypes.string.guard;
```
---

## APIs

| API            | Description                                              |
| -------------- | -------------------------------------------------------- |
| isAlpha        | Checks if a string contains only alphabetic characters   |
| isAlphaNumeric | Checks if a string contains only alphanumeric characters |
| isBlank        | Checks if a string contains only whitespace              |
| isEmpty        | Checks if a string is empty                              |
| isNotEmpty     | Checks if a string is not empty                          |
| isString       | Checks if a value is a string                            |
| isUUID         | Checks if a string is a valid UUID (v1, v4, or v5)       |
| isValidString  | Checks if a string is not empty after trimming           |

---
## Examples

### ✅ `isAlpha`
Signature: `isAlpha(value: unknown): value is string`

Checks if a string contains only alphabetic characters.

```ts
stringsGuard.isAlpha('HelloWorld'); // true
stringsGuard.isAlpha('Hello123');   // false
```

### 🔡 `isAlphaNumeric`
Signature: `isAlphaNumeric(value: unknown): value is string`

Checks if the string contains only letters and numbers.

```ts
stringsGuard.isAlphaNumeric('abc123');    // true
stringsGuard.isAlphaNumeric('abc 123');   // false
```

### ⚪ `isBlank`
Signature: `isBlank(value: unknown): value is string`

Checks if the string contains only whitespace.

```ts
stringsGuard.isBlank('   ');
// true

stringsGuard.isBlank('not blank');
// false
```

### 📭 `isEmpty`
Signature: `isEmpty(value: unknown): value is string`

Checks if the string is empty.
```ts
stringsGuard.isEmpty('');
// true

stringsGuard.isEmpty(' ');
// false
```

### ✅ `isNotEmpty`
Signature: `isNotEmpty(value: unknown): value is string`

Checks if the string is not empty.

```ts
stringsGuard.isNotEmpty('text');
// true

stringsGuard.isNotEmpty('');
// false
```

### 🧪 `isString`
Signature: `isString(value: unknown): value is string`

Checks if the value is a string.

```ts
stringsGuard.isString('hello');
// true

stringsGuard.isString(123);
// false
```

### 🔍 `isUUID`
Signature: `isUUID(value: unknown, version?: 'v1' | 'v4' | 'v5'): value is string`

Checks if the value is a valid UUID.

```ts
stringsGuard.isUUID('550e8400-e29b-41d4-a716-446655440000');
// true (v4)

stringsGuard.isUUID('550e8400-e29b-11d4-a716-446655440000', 'v1');
// true
```

### 🟩 `isValidString`
Signature: `isValidString(value: unknown): value is string`

Checks if the string is non-empty and not just whitespace.

```ts
stringsGuard.isValidString('OpenAI');
// true

stringsGuard.isValidString('   ');
// false
```