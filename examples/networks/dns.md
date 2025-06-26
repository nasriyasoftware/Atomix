# 📦 DNS Module
The `dns` module provides comprehensive DNS resolution functionality, abstracting Node.js `dns.promises` and adding support logic for runtime normalization and graceful fallbacks.

Supported Record Types
- `A`, `AAAA` – IPv4/IPv6 addresses
- `ANY` – Any DNS record
- `CAA`, `CNAME`, `MX`, `NAPTR`, `NS`, `PTR`, `SOA`, `SRV`, `TXT`
- Runtime-aware behavior: Normalizes behavior on Bun vs Node

---
## Access the DNS utility
```ts
import atomix from '@nasriya/atomix';

const networkDNS = atomix.networks.dns;
```
---
## API Overview

| API                                  | Description                                             |
| ------------------------------------ | ------------------------------------------------------- |
| [resolve](#️-resolve)                 | Resolve DNS records of various types for a hostname     |
| [lookup](#-lookup)                   | Resolve hostname to IPv4 addresses (convenience method) |
| [reverseLookup](#-reverselookup)     | Resolve IP address to hostnames (PTR records)           |
| [resolveMx](#-resolvemx)             | Resolve MX (mail exchange) records for a hostname       |
| [resolveNs](#-resolvens)             | Resolve NS (name server) records for a hostname         |
| [resolveTxt](#-resolvetxt)           | Resolve TXT records for a hostname                      |
| [getDNSServers](#-getdnsservers)     | Get the list of system-configured DNS servers           |
| [isDNSResolvable](#-isdnsresolvable) | Check if a domain name is resolvable via DNS            |

---
## API Details

### 🛰️ `resolve`
Signature: `resolve(hostname: string, rrtype?: RRType): Promise<...>`
Runtime compatibility:

- Node.js: ✅ Fully supported
- Bun: ⚠️ Limited support (`NAPTR` unsupported, `TXT` unstable, `TLSA` untested)
- Deno: ❓ Untested, likely supported via std DNS API but not confirmed

Example:

```ts
// 🌍 Resolve IPv4 addresses for "example.com"
const ips = await networkDNS.resolve('example.com', 'A');
console.log(ips); // ["93.184.216.34", ...]

// 📧 Resolve MX records for "example.com"
const mxRecords = await networkDNS.resolve('example.com', 'MX');
console.log(mxRecords);
```

## 🔍 `lookup`
Signature: `lookup(hostname: string): Promise<string[]>`

Runtime compatibility:
- Node.js: ✅ Fully supported
- Bun: ✅ Supported (normalized output)
- Deno: ❓ Untested, expected to be supported

Example:

```ts
// 🖥️ Get IP addresses of example.com
const ips = await networkDNS.lookup('example.com');
console.log(ips);
```

### 🔄 `reverseLookup`
Signature: `reverseLookup(address: string): Promise<string[]>`

Runtime compatibility:
- Node.js: ✅ Fully supported
- Bun: ✅ Supported
- Deno: ❓ Untested

Example:

```ts
// 🔙 Get hostname for IP
const hostnames = await networkDNS.reverseLookup('93.184.216.34');
console.log(hostnames);
```

### 📬 `resolveMx`
Signature: `resolveMx(hostname: string): Promise<MxRecord[]>`

Runtime compatibility:
- Node.js: ✅ Fully supported
- Bun: ✅ Supported
- Deno: ❓ Untested

Example:

```ts
// ✉️ Get MX records for example.com
const mx = await networkDNS.resolveMx('example.com');
console.log(mx);
```

### 📛 `resolveNs`
Signature: `resolveNs(hostname: string): Promise<string[]>`

Runtime compatibility:
- Node.js: ✅ Fully supported
- Bun: ✅ Supported
- Deno: ❓ Untested

Example:

```ts
// 🏷️ Get NS records for example.com
const ns = await networkDNS.resolveNs('example.com');
console.log(ns);
```

### 📄 `resolveTxt`
Signature: `resolveTxt(hostname: string): Promise<string[][]>`

Runtime compatibility:
- Node.js: ✅ Fully supported
- Bun: ⚠️ Known issues, may hang or cause errors
- Deno: ❓ Untested, likely supported but not confirmed

Example:

```ts
// 📜 Get TXT records for example.com
const txtRecords = await networkDNS.resolveTxt('example.com');
console.log(txtRecords);
```

### 🖧 `getDNSServers`
Signature: `getDNSServers(): string[]`

Runtime compatibility:
- Node.js: ✅ Fully supported
- Bun: ✅ Supported
- Deno: ❓ Untested, likely no direct support (may require polyfill)

Example:

```ts
// 🕵️‍♂️ List system DNS servers
const servers = networkDNS.getDNSServers();
console.log(servers);
```

### ✅ `isDNSResolvable`
Signature: i`sDNSResolvable(domain: string): Promise<boolean>`

Runtime compatibility:
- Node.js: ✅ Fully supported
- Bun: ✅ Supported
- Deno: ❓ Untested

Example:

```ts
// 🌐 Check if domain resolves
const canResolve = await networkDNS.isDNSResolvable('example.com');
console.log(canResolve); // true or false
```