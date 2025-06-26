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

### 1. HTTP Guard Utilities

| Method                   | Description                                       |
| ------------------------ | ------------------------------------------------- |
| `guard.isValidURL(url)`  | Check if a string is a valid URL                  |
| `guard.isEmail(email)`   | Check if a string is a valid email address        |
| `guard.isExtension(ext)` | Check if a string is a known `FileExtension` type |
| `guard.isMimeType(mime)` | Check if a string is a known `MIME` type          |
| `guard.isHTML(value)`    | Check if a string contains valid HTML             |

---

### 2. MIME Utilities

| Property / Method                | Description                        |
| -------------------------------- | ---------------------------------- |
| `mimes.extensions`               | Array of all known file extensions |
| `mimes.mimes`                    | Array of all known MIME types      |
| `mimes.isValid.extension(ext)`   | Validate if an extension is known  |
| `mimes.isValid.mime(mime)`       | Validate if a MIME type is known   |
| `mimes.getMimeByExtension(ext)`  | Get MIME type for a file extension |
| `mimes.getExtensionByMime(mime)` | Get file extension for a MIME type |

---

### 3. Encoding Utilities

| Method         | Description                 |
| -------------- | --------------------------- |
| `btoa(text)`   | Encode UTF-8 text to Base64 |
| `atob(base64)` | Decode Base64 to UTF-8 text |

---
## API Details

### HTTP Guard Utilities

```ts
const guard = atomix.http.guard;

// Check valid URL
console.log(guard.isValidURL('https://example.com')); // true
console.log(guard.isValidURL('not-a-url')); // false

// Check valid email
console.log(guard.isEmail('user@example.com')); // true
console.log(guard.isEmail('user@@example')); // false

// Check valid MIME type
console.log(guard.isMimeType('application/json')); // true or false depending on your list
console.log(guard.isMimeType('invalid/mime')); // false

// Check valid HTML string
console.log(guard.isHTML('<div>Hello</div>')); // true
console.log(guard.isHTML('Just a string')); // false
```

### MIME Utilities

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

### Encoding Utilities

```ts
const http = atomix.http;

const encoded = http.btoa('Hello, world!');
console.log(encoded); // "SGVsbG8sIHdvcmxkIQ=="

const decoded = http.atob(encoded);
console.log(decoded); // "Hello, world!"
```