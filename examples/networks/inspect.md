# 🔍 Network Inspector

Advanced tools for checking host and port availability, measuring connectivity, and analyzing route hops. Ideal for diagnostics, uptime monitoring, and service discovery.

---

## Access the `inspect` utility

```ts
import atomix from '@nasriya/atomix';

const inspector = atomix.networks.inspect;
```

---
## API Overview

| API                        | Description                                           |
| -------------------------- | ----------------------------------------------------- |
| [isPortOpen](#-isportopen) | Check if a TCP port is open on a given host           |
| [pingHost](#️-pinghost)     | Check if a host is reachable via `ping`               |
| [traceroute](#-traceroute) | Perform a traceroute to analyze hops to a destination |

---
## API Details

### 🔌 `isPortOpen`
Signature: `isPortOpen(port: number, option?: { hostname?: string; timeout?: number }): Promise<boolean>`

This method checks whether a TCP port is open on a given host by attempting to establish a connection.  
It resolves `true` if successful, or `false` if the port is closed or the connection times out.

Runtime compatibility:
- Node.js: ✅ Fully supported
- Bun: ✅ Supported (tested on v1.2.15+)
- Deno: ❓ Untested (requires polyfill for `net` module)

Example:

```ts
const isOpen = await inspector.isPortOpen(80, { hostname: 'example.com', timeout: 500 });
console.log(isOpen); // true or false
```

### 🛰️ `pingHost`
Signature: `pingHost(hostname: string, timeoutMs?: number): Promise<boolean>`

Runtime compatibility:
- Node.js: ✅ Fully supported (uses native ping command)
- Bun: ✅ Supported
- Deno: ❓ Untested — requires shell access

Example:

```ts
const isReachable = await inspector.pingHost('example.com', 2000); // timeout 2000ms
console.log(isReachable); // true or false
```

### 🧭 `traceroute`
Signature: `traceroute(hostname: string): Promise<TracerouteHop[]>`

Runtime compatibility:
- Node.js: ✅ Fully supported (traceroute on Unix, tracert on Windows)
- Bun: ✅ Supported if shell execution is available
- Deno: ❓ Untested — should work with subprocess permissions

```ts
const hops = await inspector.traceroute('example.com');
console.log(hops);
/*
[
  { hop: 1, ips: ['192.168.1.1'], timesMs: [1.23, 1.30] },
  { hop: 2, ips: ['203.0.113.1'], timesMs: [15.8, 14.5] },
  ...
]
*/
```

#### `TracerouteHop` Type
```ts
interface TracerouteHop {
  hop: number;       // Hop index
  ips: string[];     // IPs seen at this hop
  timesMs: number[]; // Ping times in milliseconds
}
```

---

📌 **Note**: On some systems, permissions or firewall settings may prevent successful execution of ping or traceroute commands. Ensure your runtime environment supports native command execution.