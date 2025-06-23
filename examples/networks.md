# 🌐 Network Utilities
Helpful functions for accessing and analyzing network-related data in a runtime-aware and platform-compatible way.

---
## Access the networks utility
```ts
import atomix from '@nasriya/atomix';

const networks = atomix.networks;
```

---
## The APIs
| API                          | Description                                 |
| ---------------------------- | ------------------------------------------- |
| [getLocalIPs](#-getlocalips) | Get the local (non-internal) IPv4 addresses |

---
## Examples:

### 📡 `getLocalIPs`
Signature: `getLocalIPs(): Promise<string[]>`

Returns an array of local (non-internal) IPv4 addresses available on the current machine.

```ts
const ips = await networks.getLocalIPs();
console.log(ips);
// Example: [ "192.168.1.15", "10.0.0.7" ]
```

Behavior:
- Ignores internal interfaces (like 127.0.0.1).
- Filters only IPv4 addresses.
- Prioritizes physical interface names such as Ethernet or vEthernet.
- Compatible with Node.js environments using the dynamic os module.

Supported Runtimes:
- **Node.js**:  ✅ Supported (v10+)
- **Bun**:      ✅ Supported (v1.2.15+)
- **Deno**:     ❓ Untested — no confirmed support yet

If you have tested this on other runtimes or versions, please consider contributing feedback!