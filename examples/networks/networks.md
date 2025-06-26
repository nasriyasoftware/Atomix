# 🌐 Network Utilities
Helpful functions for accessing and analyzing network-related data in a runtime-aware and platform-compatible way.

---
## Access the networks utility
```ts
import atomix from '@nasriya/atomix';

const networks = atomix.networks;
```

---
## Available Modules

| Module                  | Description                                                      |
| ----------------------- | ---------------------------------------------------------------- |
| [local](./local.md)     | Access local IPs, hostnames, and network interfaces              |
| [remote](./remote.md)   | Interact with remote endpoints, such as retrieving the public IP |
| [dns](./dns.md)         | Perform DNS lookups and reverse queries                          |
| [inspect](./inspect.md) | Analyze ports, scan services, and trace network routes           |


## Core APIs

These utilities are available directly under the `networks` object, not inside a submodule.

| Method                           | Description                                                               |
| -------------------------------- | ------------------------------------------------------------------------- |
| [isIPv4](#-isipv4)               | Returns `true` if the given string is a valid IPv4 address                |
| [isPrivateIP](#-isprivateip)     | Returns `true` if the given IPv4 address is within a private IP range     |
| [ipToInt](#-iptoint-and-inttoip) | Converts a dotted IPv4 string (e.g., `"192.168.0.1"`) to a 32-bit integer |
| [intToIp](#-iptoint-and-inttoip) | Converts a 32-bit integer back to a dotted IPv4 string                    |
| [getSubnetIPs](#-getsubnetips)   | Returns all usable IPs in a given subnet (e.g., `/24`)                    |
| [isValidPort](#-isvalidport)     | Returns `true` if the value is a valid TCP/UDP port (0–65535)             |

---
## API Details

### 🧠 `isIPv4`
Signature: `isIPv4(ip: string): boolean`

Checks if a string is a valid IPv4 address.

```ts
networks.isIPv4("192.168.1.1"); // true
networks.isIPv4("example.com"); // false
```

### 🔒 `isPrivateIP`
Signature: `isPrivateIP(ip: string): boolean`

Checks if an IPv4 address is within private IP address ranges.

### 🔄 `ipToInt` and `intToIp`
Signatures:
- `ipToInt(ip: string): number`
- `intToIp(int: number): string`

Converts between a dotted IPv4 string and a 32-bit integer.

```ts
const ip = "192.168.1.1";
const int = networks.ipToInt(ip); // 3232235777
const restored = networks.intToIp(int); // "192.168.1.1"
```

### 🌐 `getSubnetIPs`
Signature: `getSubnetIPs(ip: string, subnet: number): string[]`

Generates all usable IP addresses within a given subnet.

```ts
const ips = networks.getSubnetIPs("192.168.1.1", 30);
console.log(ips); 
// [ '192.168.1.2', '192.168.1.3' ]
```

### 🔢 `isValidPort`
Signature: `isValidPort(port: unknown): boolean`

Checks if a given value is a valid port number (0–65535 inclusive).

```ts
networks.isValidPort(80); // true
networks.isValidPort(70000); // false
networks.isValidPort("443"); // false
```