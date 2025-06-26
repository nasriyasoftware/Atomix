# ⚙️ Runtime Utilities
Useful runtime helpers for platform detection, module loading, and environment awareness.

---
## Access the runtime utilities
```ts
import atomix from '@nasriya/atomix';

const runtime = atomix.runtime;
```

---
## The APIs
| API                                    | Description                                                |
| -------------------------------------- | ---------------------------------------------------------- |
| [getProjectName](#-getprojectname)     | Reads and returns the project name from the `package.json` |
| [getModuleSystem](#-getmodulesystem)   | Dynamically loads a module by name or path                 |
| [getRuntimeEngine](#-getruntimeengine) | Detect the current JavaScript runtime environment.         |
| [loadModule](#-loadmodule)             | Dynamically loads a module by name or path                 |
| [loadFileModule](#-loadfilemodule)     | Loads a module from a specified file path                  |
| [platform](#-platform)                 | Utilities to detect current operating system               |
| [isNode](#-isnode)                     | Detects if the code is running in Node.js                  |
| [isBun](#-isbun)                       | Detects if the code is running in Bun                      |
| [isDeno](#-isnode)                     | Detects if the code is running in Deno                     |



---
## API Details:

### 🧾 `getProjectName`
Signature: `getProjectName()`

Reads the `package.json` file and returns the value of the `name` field.

```ts
const name = runtime.getProjectName();
console.log(name); // "@nasriya/my-package"
```

### 📦 `getModuleSystem`
Signature: `getModuleSystem()`

Detects whether the current runtime uses CommonJS or ESM.

```ts
const system = runtime.getModuleSystem();
console.log(system); // "commonjs" or "module"
```

### 📥 `loadModule`
Signature: `loadModule(name, options?)`

Dynamically loads a module (either a package or path), with support for both CommonJS and ESM.

```ts
const lodash = await runtime.loadModule('lodash');
lodash.camelCase('hello world'); // "helloWorld"
```

### 📄 `loadFileModule`
Signature: `loadFileModule(filePath)`

Loads a module from a file path. Equivalent to `loadModule(path, { isFile: true })`.

```ts
const config = await runtime.loadFileModule('/absolute/path/to/config.js');
console.log(config); // loaded module export
```

### 🖥 `platform`
Signature: `platform.isWindows()` / `isLinux()` / `isMac()`

Detects the current operating system platform.

```ts
if (runtime.platform.isWindows()) {
  console.log('Running on Windows');
}
```

### 🧠 `getRuntimeEngine`
Signature: `getRuntimeEngine(): 'node' | 'bun' | 'deno' | 'unknown'`

Detect the current JavaScript runtime environment.

```ts
const runtimeEngine = runtime.getRuntimeEngine();
console.log(runtimeEngine);
// "node", "bun", "deno", or "unknown"
```

### 🌍 `isNode`
Signature: `isNode()`

```ts
if (runtime.isNode()) {
  console.log('Running in Node.js');
}
```

### 🥖 `isBun`
Signature: `isBun()`

```ts
if (runtime.isBun()) {
  console.log('Running in Bun');
}
```

### 🦕 `isDeno`
Signature: `isDeno()`

```ts
if (runtime.isDeno()) {
  console.log('Running in Deno');
}
```