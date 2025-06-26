# 🧵 String Utilities  
Useful string manipulation helpers with runtime validation, Unicode normalization, and flexible padding options.

---

## Access the strings utility

```ts
import atomix from '@nasriya/atomix';

const strings = atomix.dataTypes.string;
```

---

| API                                              | Description                                       |
| ------------------------------------------------ | ------------------------------------------------- |
| [capitalizeFirstLetter](#️-capitalizefirstletter) | Capitalizes the first letter                      |
| [guard](./string-guard.md)                       | Provides validation methods for strings.          |
| [countOccurrences](#-countoccurrences)           | Counts substring occurrences                      |
| [endsWithIgnoreCase](#️-endswithignorecase)       | Case-insensitive endsWith check                   |
| [pad](#-pad)                                     | Pads string with fill or random chars on any side |
| [padEnd](#️-padend)                               | Pads string at end                                |
| [padStart](#️-padstart)                           | Pads string at start                              |
| [removeWhitespace](#-removewhitespace)           | Removes all whitespace                            |
| [reverse](#-reverse)                             | Reverses the string characters                    |
| [startsWithIgnoreCase](#️-startswithignorecase)   | Case-insensitive startsWith check                 |
| [stripHTMLTags](#-striphtmltags)                 | Removes all HTML tags                             |
| [slugify](#️-slugify)                             | Converts string to a URL-friendly slug            |
| [toCamelCase](#-tocamelcase)                     | Converts string to camelCase                      |
| [toKebabCase](#-tokebabcase)                     | Converts string to kebab-case                     |
| [toSnakeCase](#-tosnakecase)                     | Converts string to snake_case                     |
| [truncate](#️-truncate)                           | Truncates string and adds ellipsis if needed      |

---
## API Details

### ✍️ `capitalizeFirstLetter`
Signature: `capitalizeFirstLetter(str: string): string`

Capitalizes the first letter of the given string.

```ts
const result = strings.capitalizeFirstLetter('hello world');
console.log(result); // "Hello world"
```

### 🔢 `countOccurrences`
Signature: `countOccurrences(str: string, substr: string): number`

Counts the number of times a substring occurs in a string.

```ts
const count = strings.countOccurrences('banana', 'an');
console.log(count); // 2
```

### ⬇️ `endsWithIgnoreCase`
Signature: `endsWithIgnoreCase(str: string, suffix: string): boolean`

Checks if the string ends with the specified suffix, ignoring case.

```ts
const result = strings.endsWithIgnoreCase('HelloWorld', 'WORLD');
console.log(result); // true
```

### 🎯 `pad`
Signature: `pad(str: string, maxLength: number, options?: StringPaddingOptions): string`

Pads the string to a certain length, optionally using random characters or filling on specified sides.

```ts
const padded = strings.pad('abc', 6, { side: 'both', fillChar: '-' });
console.log(padded); // "--abc-"
```

### ➡️ `padEnd`
Signature: `padEnd(str: string, maxLength: number, options?: Omit<StringPaddingOptions, 'side'>): string`

Pads the end of the string to the specified length.

```ts
const paddedEnd = strings.padEnd('abc', 5, { fillChar: '.' });
console.log(paddedEnd); // "abc.."
```

### ⬅️ `padStart`
Signature: `padStart(str: string, maxLength: number, options?: Omit<StringPaddingOptions, 'side'>): string`

Pads the start of the string to the specified length.

```ts
const paddedStart = strings.padStart('abc', 5, { fillChar: '.' });
console.log(paddedStart); // "..abc"
```

### 🚫 `removeWhitespace`
Signature: `removeWhitespace(str: string): string`

Removes all whitespace characters from the string.

```ts
const noSpaces = strings.removeWhitespace(' a b \n c\t');
console.log(noSpaces); // "abc"
```

### 🔄 `reverse`
Signature: `reverse(str: string): string`

Reverses the characters of the string.

```ts
const reversed = strings.reverse('abc');
console.log(reversed); // "cba"
```

### ⬆️ `startsWithIgnoreCase`
Signature: `startsWithIgnoreCase(str: string, prefix: string): boolean`

Checks if the string starts with the specified prefix, ignoring case.

```ts
const result = strings.startsWithIgnoreCase('HelloWorld', 'hello');
console.log(result); // true
```

### 🧹 `stripHTMLTags`
Signature: `stripHTMLTags(str: string): string`

Removes all HTML tags from the string.

```ts
const clean = strings.stripHTMLTags('<p>Hello <strong>world</strong></p>');
console.log(clean); // "Hello world"
```

### 🏷️ `slugify`
Signature: `slugify(str: string): string`

Converts a string into a slug suitable for URLs.

```ts
const slug = strings.slugify('Café del Mar!');
console.log(slug); // "cafe-del-mar"
```

### 🐫 `toCamelCase`
Signature: `toCamelCase(str: string): string`

Converts a string to camelCase.

```ts
const camel = strings.toCamelCase('hello world example');
console.log(camel); // "helloWorldExample"
```

### 🍖 `toKebabCase`
Signature: `toKebabCase(str: string): string`

Converts a string to kebab-case.

```ts
const kebab = strings.toKebabCase('helloWorldExample');
console.log(kebab); // "hello-world-example"
```

### 🐍 `toSnakeCase`
Signature: `toSnakeCase(str: string): string`

Converts a string to snake_case.

```ts
const snake = strings.toSnakeCase('helloWorldExample');
console.log(snake); // "hello_world_example"
```

### ✂️ `truncate`
Signature: `truncate(str: string, length: number): string`

Truncates a string to a specified length, adding ellipsis if truncated.

```ts
const truncated = strings.truncate('Hello world example', 8);
console.log(truncated); // "Hello wo..."
```