# 🛤️ Path Utilities
Simple helpers for consistent and cross-platform path manipulation.

---
## Access the path utility
```ts
import atomix from '@nasriya/atomix';

const path = atomix.path;
```
---

## The APIs
| API                                                          | Description                                                                   |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| [normalizePath](#️-normalizepath)                             | Resolves and normalizes a path, lowercasing it on Windows.                    |
| [sanitizeName](#-sanitizename)                               | Sanitizes a filename or folder name by replacing/removing illegal characters. |
| [isSubPath](#-issubpath)                                     | Checks if one path is a sub-path of another.                                  |
| [getFileNameWithoutExtension](#-getfilenamewithoutextension) | Gets the filename without its extension.                                      |
| [changeExtension](#-changeextension)                         | Changes the file extension of a given path.                                   |
| [isValidPath](#-isvalidpath)                                 | Checks if a path string is valid.                                             |
| [relativeToCwd](#-relativetocwd)                             | Returns the relative path from the current working directory.                 |


---

## API Details

### 🛤️ `normalizePath`
Signature: `normalizePath(path: string): string`

Resolves a given path to an absolute normalized path. On Windows, converts it to lowercase for consistency.

```ts
const normalized = path.normalizePath('./MyFolder/../file.txt');
console.log(normalized);
// Output (on Windows): 'c:\\users\\user\\file.txt'
// Output (on Linux/macOS): '/home/user/file.txt'
```

### 🧹 `sanitizeName`
Signature: `sanitizeName(name: string, replacement?: string): string`

Sanitizes a filename or folder name by replacing/removing illegal characters.

```ts
const safeName = path.sanitizeName('my*illegal:file?.txt');
console.log(safeName);
// Output: 'my_illegal_file_.txt'
```


### 📁 `isSubPath`
Signature: `isSubPath(childPath: string, parentPath: string): boolean`

Checks if one path is a sub-path of another.

```ts
const child = '/Users/alice/projects/myapp/src';
const parent = '/Users/alice/projects/myapp';

const result = path.isSubPath(child, parent);
console.log(result);  // true
```

### 📄 `getFileNameWithoutExtension`
Signature: `getFileNameWithoutExtension(filePath: string): string`

Gets the filename without its extension.

```ts
const filename = path.getFileNameWithoutExtension('/foo/bar/data.json');
console.log(filename);  // 'data'
```

### 🔄 `changeExtension`
Signature: `changeExtension(filePath: string, newExt: string): string`

Changes the file extension of a given path.

```ts
const newPath = path.changeExtension('/foo/bar/data.txt', '.json');
console.log(newPath);  // '/foo/bar/data.json'
```

### ✅ `isValidPath`
Signature: `isValidPath(path_: string): boolean`

Checks if a path string is valid.

```ts
console.log(path.isValidPath('valid-file.txt'));   // true
console.log(path.isValidPath('inva|id.txt'));      // false on Windows
console.log(path.isValidPath(''));                 // false
```

### 📂 `relativeToCwd`
Signature: `relativeToCwd(path_: string): string`

Returns the relative path from the current working directory.

```ts
const relativePath = path.relativeToCwd('/Users/alice/projects/myapp/data.json');
console.log(relativePath);
// 'projects/myapp/data.json' (depending on current working dir)
```