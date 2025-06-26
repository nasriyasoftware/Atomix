# 🌐 Remote Network Utilities

This module provides methods to retrieve the public IP address of the server and obtain geolocation data for any IP address via external APIs.

> ✅ **Tested:** Node.js, Bun  
> ❓ **Untested:** Deno (likely compatible via global fetch but not confirmed)

---

## Access the `remote` utility

```ts
import atomix from '@nasriya/atomix';

const remoteNetworks = atomix.networks.remote;
```

---
## API Overview
| Method                             | Description                                        |
| ---------------------------------- | -------------------------------------------------- |
| [getPublicIP](#-getpublicip)       | Retrieve the server's public IP address            |
| [getGeoLocation](#-getgeolocation) | Retrieve geolocation information for an IP address |

---
## API Overview

### 🌐 getPublicIP  
Signature: `getPublicIP(): Promise<string>`

Runtime compatibility:  
- Node.js: ✅ Supported  
- Bun: ✅ Supported  
- Deno: ❓ Untested  

Example
```ts
// 🌐 Get the server's public IP address
const ip = await remoteNetworks.getPublicIP();
console.log(ip); // '203.0.113.45'
```

### 📍 getGeoLocation  
Signature: `getGeoLocation(ip?: string): Promise<IPGeolocation>`

Fetches detailed geolocation information for a given IP address by querying the [ipinfo](https://ipinfo.io/).io API. If no IP is provided, it fetches the geolocation data for the server’s public IP. This method requires an API token stored in the `IPINFO_IO_TOKEN` environment variable to authenticate requests.

**Environment Variable Required:**
- `IPINFO_IO_TOKEN` — Your ipinfo.io API token for authorized access.

**Returned Data Structure (`IPGeolocation`):**
| Property   | Type   | Description                                        |
| ---------- | ------ | -------------------------------------------------- |
| `ip`       | string | The IP address                                     |
| `city`     | string | City name                                          |
| `region`   | string | Region or state                                    |
| `country`  | string | Country code                                       |
| `loc`      | string | Latitude and longitude (e.g., "37.3860,-122.0838") |
| `org`      | string | Organization or ISP                                |
| `postal`   | string | Postal or ZIP code                                 |
| `timezone` | string | Time zone identifier (e.g., "America/Los_Angeles") |


Runtime compatibility:  
- Node.js: ✅ Supported  
- Bun: ✅ Supported  
- Deno: ❓ Untested  

Example
```ts
// 🗺️ Get geolocation info for a specific IP
const geo = await remoteNetworks.getGeoLocation('8.8.8.8');
console.log(geo);

// Or get geolocation info for the server's public IP
const myGeo = await remoteNetworks.getGeoLocation();
console.log(myGeo);
```

