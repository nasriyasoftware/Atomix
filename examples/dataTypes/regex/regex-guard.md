# 🛡️ Regex Guard  
Type-safe validation helpers for regular expression patterns.

The `guard` module provides runtime checks to help you identify specific regex-related pattern types, such as glob-like strings, at runtime. This helps with input validation, conditional logic, and type narrowing.

---

## Access the regex guard

```ts
import atomix from '@nasriya/atomix';

const regexGuard = atomix.dataTypes.regex.guard;
```
---
## APIs
| API                        | Description                                                       |
| -------------------------- | ----------------------------------------------------------------- |
| [isGlobLike](#-isgloblike) | Checks if a string contains glob-like wildcard chars (`*` or `?`) |

---
## Examples

### 🔍 `isGlobLike`
Signature: `isGlobLike(pattern: string): boolean`

Checks whether a string contains glob wildcard characters `*` or `?`.

```ts
regexGuard.isGlobLike('*.js');         // true (contains '*')
regexGuard.isGlobLike('file?.ts');     // true (contains '?')
regexGuard.isGlobLike('filename.txt'); // false (no glob characters)
regexGuard.isGlobLike('file[abc].js'); // false (character class not considered glob)
```