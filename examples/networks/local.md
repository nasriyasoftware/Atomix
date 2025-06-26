# 🖧 Local Network Utilities

This module provides methods to retrieve and inspect network details of the local machine, including IPs, hostnames, gateways, MAC addresses, and local network scanning.

> ✅ **Tested:** Node.js, Bun  
> ❓ **Untested:** Deno (likely compatible via polyfills or shell access)
---

## Access the `local` utility

```ts
import atomix from '@nasriya/atomix';

const localNetwork = atomix.networks.local;
```
---

## API Overview

| Method                                         | Description                                    |
| ---------------------------------------------- | ---------------------------------------------- |
| [getLocalIPs](#-getlocalips)                   | Get all IPv4 addresses of local interfaces     |
| [getHostname](#-gethostname)                   | Get the hostname of the current machine        |
| [getMACAddresses](#-getmacaddresses)           | Get MAC addresses of non-internal interfaces   |
| [getDefaultGateway](#-getdefaultgateway)       | Get the default gateway IP                     |
| [getNetworkCIDRs](#-getnetworkcidrs)           | Get CIDR notations of local interfaces         |
| [getLocalNetworkMap](#-getlocalnetworkmap)     | Get a map of interfaces and their IPs          |
| [discoverServiceHosts](#-discoverservicehosts) | Scan local network for hosts with an open port |

---
## API Details

### 📡 `getLocalIPs`
Signature: `getLocalIPs(): string[]`

Runtime compatibility:
- Node.js: ✅ Supported
- Bun: ✅ Supported
- Deno: ❓ Untested

Example:

```ts
// 🔎 Get the local IPv4 addresses
const localIPs = localNetwork.getLocalIPs();
console.log(localIPs); // ['192.168.1.10', ...]
```

### 🖥️ `getHostname`
Signature: `getHostname(): string`

Runtime compatibility:
- Node.js: ✅ Supported
- Bun: ✅ Supported
- Deno: ❓ Untested

Example:

```ts
// 🖥️ Get the hostname of the machine
const hostname = localNetwork.getHostname();
console.log(hostname); // e.g. "My-Machine"
```

### 🔗 `getMACAddresses`
Signature: `getMACAddresses(): string[]`

Runtime compatibility:
- Node.js: ✅ Supported
- Bun: ✅ Supported
- Deno: ❓ Untested

Example:

```ts
// 🔗 Get MAC addresses of non-internal interfaces
const macs = localNetwork.getMACAddresses();
console.log(macs); // ['00:1A:2B:3C:4D:5E', ...]
```

### 🚪 `getDefaultGateway`
Signature: `getDefaultGateway(): string`

Runtime compatibility:
- Node.js: ✅ Supported
- Bun: ✅ Supported (via shell access)
- Deno: ❓ Untested

Example:
```ts
// 🚪 Get the default gateway IP address
const gateway = localNetwork.getDefaultGateway();
console.log(gateway); // e.g. "192.168.1.1"
```

### 🌐 `getNetworkCIDRs`
Signature: `getNetworkCIDRs(): string[]`

Runtime compatibility:
- Node.js: ✅ Supported
- Bun: ✅ Supported
- Deno: ❓ Untested

Example:
```ts
// 🌐 Get CIDR notations of local interfaces
const cidrs = localNetwork.getNetworkCIDRs();
console.log(cidrs); // ['192.168.1.0/24', ...]
```

### 🗺️ `getLocalNetworkMap`
Signature: `getLocalNetworkMap(): Map<string, string[]>`

Runtime compatibility:
- Node.js: ✅ Supported
- Bun: ✅ Supported
- Deno: ❓ Untested

Example:
```ts
// 🗺️ Get a map of interface names to their IPv4 addresses
const networkMap = localNetwork.getLocalNetworkMap();
for (const [iface, ips] of networkMap.entries()) {
  console.log(`${iface}: ${ips.join(', ')}`);
}
```

### 🔍 `discoverServiceHosts`
Signature: `discoverServiceHosts(port: number, timeout?: number): Promise<string[]>`

Runtime compatibility:
- Node.js: ✅ Supported
- Bun: ✅ Supported
- Deno: ❓ Untested

Example:
```ts
// 🔍 Scan local network for hosts with port 80 open
const openHosts = await localNetwork.discoverServiceHosts(80, 10000);
console.log('Hosts with port 80 open:', openHosts);
```