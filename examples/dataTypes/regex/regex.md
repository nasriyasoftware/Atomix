# 🎯 Regex Utilities  
Helpers for working with regular expressions, including glob-to-RegExp conversion with support for globstar and custom flags.

---

## Access the regex utility

```ts
import atomix from '@nasriya/atomix';

const regex = atomix.dataTypes.regex;
```
---
## APIs
| API                            | Description                                                 |
| ------------------------------ | ----------------------------------------------------------- |
| [guard](./regex-guard.md)      | Provides runtime validation methods for RegExp instances.   |
| [globToRegExp](#-globtoregexp) | Converts a glob expression to a JavaScript RegExp instance. |

---
## Examples

### 🔍 `globToRegExp`
Signature: `globToRegExp(glob: string, options?: { globstar?: boolean; flags?: string }): RegExp`

Converts a glob pattern string into a corresponding regular expression.

```ts
// Simple wildcard matching any characters except slashes
const re1 = regex.globToRegExp('*.js');
console.log(re1.test('file.js'));       // true
console.log(re1.test('file.jsx'));      // false
console.log(re1.test('folder/file.js'));// false (slash not matched by *)

// Globstar matching multiple directory levels
const re2 = regex.globToRegExp('**/*.js');
console.log(re2.test('file.js'));            // true
console.log(re2.test('folder/file.js'));     // true
console.log(re2.test('folder/sub/file.js')); // true

// Disable globstar to treat '**' as two separate '*'
const re3 = regex.globToRegExp('**/*.js', { globstar: false });
console.log(re3.test('folder/sub/file.js')); // false

// Use flags, e.g. case-insensitive matching
const re4 = regex.globToRegExp('*.JS', { flags: 'i' });
console.log(re4.test('file.js'));             // true
console.log(re4.test('file.jsx'));            // false

// Match a single character with '?'
const re5 = regex.globToRegExp('file?.js');
console.log(re5.test('file1.js'));            // true
console.log(re5.test('file12.js'));           // false

// Grouping with curly braces (matches either option)
const re6 = regex.globToRegExp('file.{js,ts}');
console.log(re6.test('file.js'));             // true
console.log(re6.test('file.ts'));             // true
console.log(re6.test('file.jsx'));            // false

// Escaping special characters
const re7 = regex.globToRegExp('file\\*.js');
console.log(re7.test('file*.js'));            // true
console.log(re7.test('file1.js'));            // false

// Complex pattern with multiple features
const complexGlob = '**/src/{*.js,*.ts}';
const re8 = regex.globToRegExp(complexGlob);
console.log(re8.test('src/app.js'));          // true
console.log(re8.test('lib/src/app.ts'));      // true
console.log(re8.test('lib/src/app.jsx'));     // false
console.log(re8.test('src/app.jsx'));         // false
```