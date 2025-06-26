# valueIs — Type Guards & Value Checks

A versatile collection of runtime type guards and value checks for common JavaScript/TypeScript data types.

---

## API Table

| Method / Property                     | Description                                                                                            | Since  | Example Link                     |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------ | -------------------------------- |
| `defined(value)`                      | Checks if a value is defined (not `null` or `undefined`).                                              | v1.0.0 | [Example ›](#defined)            |
| `instanceOf(value, constructor)`      | Checks if a value is an instance of a given class.                                                     | v1.0.0 | [Example ›](#instanceof)         |
| `instanceOfLoose(value, constructor)` | Checks if a value is an instance or loosely matches a primitive constructor (Number, String, Boolean). | v1.0.0 | [Example ›](#instanceofloose)    |
| `number`                              | Checks if a value is a number.                                                                         | v1.0.0 | [Example ›](#number)             |
| `negativeNumber`                      | Checks if a value is a negative number.                                                                | v1.0.0 | [Example ›](#negativenumber)     |
| `positiveNumber`                      | Checks if a value is a positive number.                                                                | v1.0.0 | [Example ›](#positivenumber)     |
| `integer`                             | Checks if a value is an integer.                                                                       | v1.0.0 | [Example ›](#integer)            |
| `float`                               | Checks if a value is a floating-point number.                                                          | v1.0.0 | [Example ›](#float)              |
| `finite`                              | Checks if a value is a finite number.                                                                  | v1.0.0 | [Example ›](#finite)             |
| `NaN`                                 | Checks if a value is NaN (Not-a-Number).                                                               | v1.0.0 | [Example ›](#nan)                |
| `string`                              | Checks if a value is a string.                                                                         | v1.0.0 | [Example ›](#string)             |
| `blankString`                         | Checks if a string contains only whitespace.                                                           | v1.0.0 | [Example ›](#blankstring)        |
| `emptyString`                         | Checks if a string is empty (`""`).                                                                    | v1.0.0 | [Example ›](#emptystring)        |
| `notEmptyString`                      | Checks if a string is not empty.                                                                       | v1.0.0 | [Example ›](#notemptystring)     |
| `validString`                         | Checks if a string is non-empty after trimming.                                                        | v1.0.0 | [Example ›](#validstring)        |
| `alphaString`                         | Checks if a string contains only alphabetic characters.                                                | v1.0.0 | [Example ›](#alphastring)        |
| `alphaNumericString`                  | Checks if a string contains only alphabetic and numeric characters.                                    | v1.0.0 | [Example ›](#alphanumericstring) |
| `uuid`                                | Checks if a string is a valid UUID (default v4).                                                       | v1.0.0 | [Example ›](#uuid)               |
| `globLike`                            | Checks if a string pattern contains glob wildcards (`*` or `?`).                                       | v1.0.0 | [Example ›](#globlike)           |
| `object`                              | Checks if a value is a plain object (non-null, not class instances).                                   | v1.0.0 | [Example ›](#object)             |
| `freezable`                           | Checks if a value is freezable (an object or array).                                                   | v1.0.0 | [Example ›](#freezable)          |
| `record`                              | Checks if a value is a non-empty record (plain object with at least one key).                          | v1.0.0 | [Example ›](#record)             |
| `emptyRecord`                         | Checks if a value is an empty record (plain object with no keys).                                      | v1.0.0 | [Example ›](#emptyrecord)        |
| `array`                               | Checks if a value is an array.                                                                         | v1.0.0 | [Example ›](#array)              |
| `notEmptyArray`                       | Checks if a value is a non-empty array.                                                                | v1.0.0 | [Example ›](#notemptyarray)      |
| `arrayOf(itemGuard)`                  | Returns a guard that checks if a value is an array where every item matches `itemGuard`.               | v1.0.0 | [Example ›](#arrayof)            |
| `arrayOfNumbers`                      | Checks if a value is an array of numbers.                                                              | v1.0.0 | [Example ›](#arrayofnumbers)     |
| `arrayOfStrings`                      | Checks if a value is an array of strings.                                                              | v1.0.0 | [Example ›](#arrayofstrings)     |

---

## API Details

### `defined`  
Signature: `defined(value: unknown): value is NonNullable<unknown>`

Check if a value is defined or not (not `null` or `undefined`).

```ts
valueIs.defined(null);      // false
valueIs.defined(undefined); // false
valueIs.defined(0);         // true
```

### `instanceOf`  
Signature: `instanceOf<T>(value: unknown, constructor: abstract new (...args: any[]) => T): value is T`

Check if a value is an instance of the specified class.

```ts
const date = new Date();
valueIs.instanceOf(date, Date);     // true

const number = 42;
valueIs.instanceOf(number, Date);   // false
```

### `instanceOfLoose`  
Signature: `instanceOfLoose<T>(value: unknown, constructor: abstract new (...args: any[]) => T): value is T`

Loose instance check including primitive types (`Number`, `String`, `Boolean`).

```ts
valueIs.instanceOfLoose(42, Number);       // true
valueIs.instanceOfLoose('hello', String);  // true
valueIs.instanceOfLoose(true, Boolean);    // true
valueIs.instanceOfLoose(new Date(), Date); // true
valueIs.instanceOfLoose(null, Date);       // false
```

### `number`  
Signature: `readonly number: (value: unknown) => value is number`

Check if a value is a number.

```ts
valueIs.number(123);        // true
valueIs.number('123');      // false
```

### `negativeNumber`  
Signature: `readonly negativeNumber: (value: unknown) => value is number`

Check if a value is a negative number.

```ts
valueIs.negativeNumber(-10);   // true
valueIs.negativeNumber(5);     // false
```

### `positiveNumber`  
Signature: `readonly positiveNumber: (value: unknown) => value is number`

Check if a value is a positive number.

```ts
valueIs.positiveNumber(10);    // true
valueIs.positiveNumber(-5);    // false
```

### `integer`  
Signature: `readonly integer: (value: unknown) => value is number`

Check if a value is an integer.

```ts
valueIs.integer(10);      // true
valueIs.integer(10.5);    // false
```

### `float`  
Signature: `readonly float: (value: unknown) => value is number`

Check if a value is a floating point number.

```ts
valueIs.float(10.5);      // true
valueIs.float(10);        // false
```

### `finite`  
Signature: `readonly finite: (value: unknown) => value is number`

Check if a value is a finite number.

```ts
valueIs.finite(100);          // true
valueIs.finite(Infinity);     // false
```

### `NaN`  
Signature: `readonly NaN: (value: unknown) => boolean`

Check if a value is NaN (Not-a-Number).

```ts
valueIs.NaN(NaN);     // true
valueIs.NaN(123);     // false
```

### `string`  
Signature: `readonly string: (value: unknown) => value is string`

Check if a value is a string.

```ts
valueIs.string('hello');   // true
valueIs.string(123);       // false
```

### `blankString`  
Signature: `readonly blankString: (value: unknown) => boolean`

Check if a string contains only whitespace.

```ts
valueIs.blankString('   ');    // true
valueIs.blankString('text');   // false
```

### `emptyString`  
Signature: `readonly emptyString: (value: unknown) => boolean`

Check if a string is empty.

```ts
valueIs.emptyString('');       // true
valueIs.emptyString('text');   // false
```

### `notEmptyString`  
Signature: `readonly notEmptyString: (value: unknown) => boolean`

Check if a string is not empty.

```ts
valueIs.notEmptyString('hello');   // true
valueIs.notEmptyString('');        // false
```

### `validString`  
Signature: `readonly validString: (value: unknown) => boolean`

Check if a string is valid (not empty after trimming).

```ts
valueIs.validString('hello');   // true
valueIs.validString('  ');      // false
```

### `alphaString`  
Signature: `readonly alphaString: (value: unknown) => boolean`

Check if a string contains only alphabetic characters.

```ts
valueIs.alphaString('hello');    // true
valueIs.alphaString('hello123'); // false
```

### `alphaNumericString`  
Signature: `readonly alphaNumericString: (value: unknown) => boolean`

Check if a string contains only alphabetic and numeric characters.

```ts
valueIs.alphaNumericString('hello123');  // true
valueIs.alphaNumericString('hello_123'); // false
```

### `uuid`  
Signature: `readonly uuid: (value: unknown, version?: string) => boolean`

Check if a string is a valid UUID.

```ts
valueIs.uuid('550e8400-e29b-41d4-a716-446655440000');  // true
valueIs.uuid('invalid-uuid');                           // false
```

### `globLike`  
Signature: `readonly globLike: (pattern: string) => boolean`

Check if a string is a glob-like pattern (`*` or `?` present).

```ts
valueIs.globLike('file*.txt');     // true
valueIs.globLike('filename.txt');  // false
```

### `object`  
Signature: `readonly object: (value: unknown) => boolean`

Check if a value is an object (not null, not class instance).

```ts
valueIs.object({});         // true
valueIs.object(null);       // false
valueIs.object(new Date()); // false
```

### `freezable`  
Signature: `readonly freezable: (value: unknown) => boolean`

Check if a value is freezable (object or array).

```ts
valueIs.freezable({});          // true
valueIs.freezable([1, 2, 3]);   // true
valueIs.freezable(null);        // false
valueIs.freezable(new Date());  // false
```

### `record`  
Signature: `readonly record: (value: unknown) => boolean`

Check if a value is a plain record (object literal with keys).

```ts
valueIs.record({ foo: 'bar' });  // true
valueIs.record(null);             // false
valueIs.record([1, 2, 3]);       // false
```

### `emptyRecord`  
Signature: `readonly emptyRecord: (value: unknown) => boolean`

Check if a value is an empty record (no keys).

```ts
valueIs.emptyRecord({});       // true
valueIs.emptyRecord(null);     // false
```

### `array`  
Signature: `readonly array: (value: unknown) => boolean`

Check if a value is an array.

```ts
valueIs.array([1, 2, 3]);   // true
valueIs.array('string');    // false
valueIs.array(null);        // false
```

### `notEmptyArray`  
Signature: `readonly notEmptyArray: (value: unknown) => boolean`

Check if a value is a non-empty array.

```ts
valueIs.notEmptyArray([]);        // false
valueIs.notEmptyArray([1, 2]);    // true
valueIs.notEmptyArray('string');  // false
```

### `arrayOf`  
Signature: `readonly arrayOf: (itemGuard: (item: unknown) => boolean) => (value: unknown) => boolean`

Check if a value is an array of items that pass a given guard function.

```ts
const isArrayOfNumbers = valueIs.arrayOf(valueIs.number);
isArrayOfNumbers([1, 2, 3]);      // true
isArrayOfNumbers([1, 'a', 3]);    // false
isArrayOfNumbers('not an array'); // false
```

### `arrayOfNumbers`  
Signature: `readonly arrayOfNumbers: (value: unknown) => boolean`

Check if a value is an array of numbers.

```ts
valueIs.arrayOfNumbers([1, 2, 3]);      // true
valueIs.arrayOfNumbers([1, '2', 3]);    // false
valueIs.arrayOfNumbers('not an array'); // false
```

### `arrayOfStrings`  
Signature: `readonly arrayOfStrings: (value: unknown) => boolean`

Check if a value is an array of strings.

```ts
valueIs.arrayOfStrings(['a', 'b', 'c']);    // true
valueIs.arrayOfStrings(['a', 2, 'c']);      // false
valueIs.arrayOfStrings('not an array');     // false
```