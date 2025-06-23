# 📁 File System Utilities  
Class-based synchronous and asynchronous helpers for working with the file system, with strict validation and detailed access control.

---  
## Access the file system utilities  
```ts
import atomix from '@nasriya/atomix';

const fs = atomix.fs;                   // Synchronous APIs  
const fsPromises = atomix.fs.promises;  // Asynchronous APIs
```
---

## The APIs
| API                              | Description                                          |
| -------------------------------- | ---------------------------------------------------- |
| [loadJSONSync](#-loadjsonsync)   | Synchronously load and parse a JSON file safely      |
| [canAccessSync](#-canaccesssync) | Check file system access synchronously with options  |
| [loadJSON](#-loadjson)           | Asynchronously load and parse a JSON file safely     |
| [canAccess](#-canaccess)         | Check file system access asynchronously with options |

---
## Access Options
All access checks accept an options object with the following shape:

```ts
type AccessPermissions = 'Read' | 'Write' | 'Execute';
type PathAccessPermissions = AccessPermissions | AccessPermissions[];

interface AccessOptions {
  throwError?: boolean;      // If true, throws on failure instead of returning false
  permissions?: PathAccessPermissions;  // Permissions to check (default: 'Read')
}
```

---
## Examples

### 📂 `loadJSONSync`
Signature: `loadJSONSync(filePath: string): Record<string, any> | Array<any>`

Synchronously reads a `.json` file and parses its content. Throws on access errors or invalid JSON.

```ts
try {
  const config = fs.loadJSONSync('./config.json');
  console.log(config);
} catch (err) {
  console.error('Failed to load JSON:', err.message);
}
```

### 🔐 `canAccessSync`
Signature: `canAccessSync(filePath: string, options?: AccessOptions): boolean`

Checks if the current user has the specified access permissions synchronously.

```ts
const canRead = fs.canAccessSync('./data.json', {
  permissions: 'Read',
  throwError: false
});
console.log(canRead); // true or false
```

### 📂 `loadJSON`
Signature: `loadJSON(filePath: string): Promise<Record<string, any> | Array<any>>`

Async version of [loadJSONSync](#-loadjsonsync). Resolves parsed JSON or rejects on error.

```ts
try {
  const config = await fsPromises.loadJSON('./config.json');
  console.log(config);
} catch (err) {
  console.error('Failed to load JSON:', err.message);
}
```

### 🔐 `canAccess`
Signature: `canAccess(filePath: string, options?: AccessOptions): Promise<boolean>`

Asynchronously checks file access with given permissions.

```ts
try {
  const canWrite = await fsPromises.canAccess('./log.txt', {
    permissions: ['Read', 'Write'],
    throwError: true
  });

  console.log('Can write:', canWrite);
} catch (err) {
  console.error('Access denied:', err.message);
}
```