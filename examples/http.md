# 🌐 HTTP Utilities
A collection of helpful utilities and guards for common HTTP-related tasks such as MIME type handling, Base64 encoding/decoding, and validation of URLs, emails, and HTML content.

---

## Access the HTTP Utilities

```ts
import atomix from '@nasriya/atomix';

const http = atomix.http;
```
---

## API Categories

| API                                   | Description                                                              |
| ------------------------------------- | ------------------------------------------------------------------------ |
| [guard](#guard)                       | Type check and validate HTTP-related data (methods, headers, MIME types) |
| [mimes](#mimes)                       | Common MIME type constants and helpers                                   |
| [bodyCodec](#bodycodec)               | Encode and decode HTTP body content (text, JSON, form, binary, etc.)     |
| [btoa(text)](#btoa)                   | Encode UTF-8 text to Base64                                              |
| [atob(base64)](#atob)                 | Decode Base64 to UTF-8 text                                              |
| [sanatize(input, options)](#sanatize) | Clean and validate input strings or objects against customizable rules   |

---
## API Details

### `btoa`
**Signature**: `btoa(text: string): string`

Encodes a UTF-8 string into Base64, mimicking browser `btoa()` for regular text.

```ts
const base64 = http.btoa('Hello, World!');
console.log(base64); // "SGVsbG8sIFdvcmxkIQ=="
```

### `atob`
**Signature**: `atob(base64: string): string`

Decodes a Base64 string into UTF-8 text, mimicking browser `atob()` for regular text.

```ts
const text = http.atob('SGVsbG8sIFdvcmxkIQ==');
console.log(text); // "Hello, World!"
```

### `sanatize`
**Signature**: `sanatize(input: string | Record<string, string>, options?: SanatizeOptions): SanatizeResult`

Sanitizes user input, either a single string or a record of string fields—based on configurable rules.

```ts
const result = http.sanatize('Hello, World!', { maxLength: 10 });
console.log(result.ok); // false
console.log(result.value); // "Hello, Worl..."

const result = http.sanatize({ name: 'John Doe', email: 'user@example.com' });
console.log(result.ok); // true

const result = sanatize({ username: "<admin>", bio: "Hi!" }, {
  username: { allow: /^[a-z0-9_]+$/i },
  bio: { maxLength: 10 }
});
console.log(result.output); // { username: "", bio: "Hi!" }
console.log(result.violations.username); // [{ rule: "html", ... }]
console.log(result.ok); // false
```

### `guard`

Provides a collection of guards for common HTTP-related tasks, such as validating URLs, emails, and HTML content.

| Method                   | Description                                       |
| ------------------------ | ------------------------------------------------- |
| `guard.isValidURL(url)`  | Check if a string is a valid URL                  |
| `guard.isEmail(email)`   | Check if a string is a valid email address        |
| `guard.isExtension(ext)` | Check if a string is a known `FileExtension` type |
| `guard.isMimeType(mime)` | Check if a string is a known `MIME` type          |
| `guard.isHTML(value)`    | Check if a string contains valid HTML             |

Examples:
```ts
const guard = atomix.http.guard;

// Check valid URL
console.log(http.guard.isValidURL('https://example.com')); // true
console.log(guard.isValidURL('not-a-url')); // false

// Check valid email
console.log(http.guard.isEmail('user@example.com')); // true
console.log(guard.isEmail('user@@example')); // false

// Check valid MIME type
console.log(http.guard.isMimeType('application/json')); // true or false depending on your list
console.log(http.guard.isMimeType('invalid/mime')); // false

// Check valid HTML string
console.log(http.guard.isHTML('<div>Hello</div>')); // true
console.log(http.guard.isHTML('Just a string')); // false
```

### `mimes`

| Property / Method                | Description                        |
| -------------------------------- | ---------------------------------- |
| `mimes.extensions`               | Array of all known file extensions |
| `mimes.mimes`                    | Array of all known MIME types      |
| `mimes.isValid.extension(ext)`   | Validate if an extension is known  |
| `mimes.isValid.mime(mime)`       | Validate if a MIME type is known   |
| `mimes.getMimeByExtension(ext)`  | Get MIME type for a file extension |
| `mimes.getExtensionByMime(mime)` | Get file extension for a MIME type |

Examples:

```ts
const mimes = atomix.http.mimes;

// Get all known extensions and MIME types
console.log(mimes.extensions); // [".json", ".html", ...]
console.log(mimes.mimes);      // ["application/json", "text/html", ...]

// Validate extension and MIME
console.log(mimes.isValid.extension('.json'));  // true
console.log(mimes.isValid.mime('application/json')); // true

console.log(mimes.isValid.extension('.xyz'));  // false
console.log(mimes.isValid.mime('unknown/type')); // false

// Get MIME by extension
console.log(mimes.getMimeByExtension('.json')); // "application/json"

// Get extension by MIME
console.log(mimes.getExtensionByMime('text/html')); // ".html"
```

### `bodyCodec`
Provides methods to encode and decode structured values for transport over HTTP.

| Method                     | Description                                                     |
| -------------------------- | --------------------------------------------------------------- |
| `bodyCodec.encode(value)`  | Encode serializable value into a Buffer for transport over HTTP |
| `bodyCodec.decode(buffer)` | Decode a Buffer back into the original structured value         |

Example:
```ts
const bodyCodec = atomix.http.bodyCodec;

// Encode any structured value
const payload = { userId: 42, active: true, tags: ['a', 'b'] };
const buffer = bodyCodec.encode(payload);

// Send `buffer` as raw body over HTTP, or store in cache

// Later decode it back
const restored = bodyCodec.decode(buffer);
console.log(restored); // { userId: 42, active: true, tags: ['a', 'b'] }
```

**Note:** This codec works only with JSON-serializable values, and will throw an error if the value is not serializable.