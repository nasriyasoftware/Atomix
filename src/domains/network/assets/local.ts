import os from 'os';
import { execSync } from 'child_process';
import networks from '../network-utils';
import numbersGuard from '../../data-types/number/numbers-guard';
import networkInspector from './inspect';

class LocalNetwork {
    /**
     * Get the local IP address of the server.
     *
     * Compatibility (tested):
     * - Node.js: ✅ Supported (v10+)
     * - Bun: ✅ Supported (v1.2.15+)
     * - Deno: ❓ Untested (compatibility unknown)
     *
     * @returns {string[]} An array of local IPs.
     */
    getLocalIPs(): string[] {
        const nets = os.networkInterfaces();
        const interfaces = {} as Record<string, Array<any>>

        for (const name of Object.keys(nets) as Array<keyof typeof nets>) {
            for (const net of nets[name]!) {
                // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
                // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
                const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
                if (net.family === familyV4Value && !net.internal) {
                    if (!interfaces[name]) {
                        interfaces[name] = [];
                    }
                    interfaces[name].push(net.address);
                }
            }
        }

        const interfacesArr = Object.entries(interfaces).map(entry => {
            return { name: entry[0], ips: entry[1] }
        })

        interfacesArr.sort((int1, int2) => {
            if (int1.name === 'Ethernet' && int2.name === 'Ethernet') { return 0; }
            if (int1.name === 'Ethernet') { return -1; }
            if (int2.name === 'Ethernet') { return 1; }

            if (int1.name === 'vEthernet' && int2.name === 'vEthernet') { return 0; }
            if (int1.name === 'vEthernet') { return -1; }
            if (int2.name === 'vEthernet') { return 1; }

            return 0;
        })

        const local_ips = interfacesArr.map(i => i.ips).flat(3);
        return [...new Set(local_ips)] as string[];
    }

    /**
     * Get the hostname of the server.
     *
     * Compatibility (tested):
     * - Node.js: Supported (v10+)
     * - Bun: Supported (v1.2.15+)
     * - Deno: Untested (compatibility unknown)
     *
     * @returns {string} The hostname of the server.
     * @since v1.0.0
     */
    getHostname(): string {
        return os.hostname();
    }

    /**
     * Retrieves the MAC addresses of all non-internal network interfaces on the server.
     *
     * Compatibility (tested):
     * - Node.js: Supported (v10+)
     * - Bun: Supported (v1.2.15+)
     * - Deno: Untested (compatibility unknown)
     *
     * @returns {string[]} An array of MAC addresses.
     * @since v1.0.0
     */
    getMACAddresses(): string[] {
        const interfaces = os.networkInterfaces();
        const macAddresses = [] as string[];
        for (const name of Object.keys(interfaces)) {
            for (const net of interfaces[name]!) {
                if (net.mac && !net.internal) {
                    macAddresses.push(net.mac);
                }
            }
        }
        return macAddresses;
    }

    /**
     * Gets the default gateway IP address.
     * 
     * Compatibility:
     * - Node.js: ✅
     * - Bun: ✅ (requires `bun:ffi` or shell access)
     * - Deno: ❓ Untested
     * 
     * @returns {string} The default gateway IP address, or empty string if not found.
     * @since v1.0.0
     */
    getDefaultGateway(): string {
        let mainGateway = '';

        try {
            const platform = os.platform();

            if (platform === 'win32') {
                // Windows: use `route print` and parse the default route
                const output = execSync('route print 0.0.0.0').toString();
                const lines = output.split('\n');

                for (const line of lines) {
                    if (line.includes('0.0.0.0')) {
                        const parts = line.trim().split(/\s+/);
                        const gateway = parts[2];
                        if (gateway && gateway !== 'On-link') {
                            mainGateway = gateway;
                            break;
                        }
                    }
                }

            } else if (platform === 'darwin' || platform === 'linux') {
                // Unix (macOS, Linux): use `ip route` or `netstat`
                try {
                    const output = execSync('ip route get 1.1.1.1').toString();
                    const match = output.match(/via (\d+\.\d+\.\d+\.\d+)/);
                    if (match) { mainGateway = match[1] }
                } catch {
                    const fallback = execSync('netstat -rn').toString();
                    const lines = fallback.split('\n');
                    for (const line of lines) {
                        if (line.startsWith('default') || line.startsWith('0.0.0.0')) {
                            const parts = line.trim().split(/\s+/);
                            const gateway = parts[1];
                            if (gateway) {
                                mainGateway = gateway;
                                break;
                            }
                        }
                    }
                }
            }
        } catch (error) {
            if (error instanceof Error) { error.message = `Unable to detect default gateway: ${error.message}` }
            throw error;
        }

        return mainGateway;
    }

    /**
     * Retrieves the network CIDRs of all non-internal network interfaces on the server.
     *
     * Compatibility (tested):
     * - Node.js: Supported (v10+)
     * - Bun: Supported (v1.2.15+)
     * - Deno: Untested (compatibility unknown)
     *
     * @returns {Promise<string[]>} An array of CIDRs of the network interfaces.
     * @since v1.0.0
     */
    getNetworkCIDRs(): string[] {
        const interfaces = os.networkInterfaces();
        const networkCIDRs = [] as string[];
        for (const name of Object.keys(interfaces)) {
            for (const net of interfaces[name]!) {
                if (net.family === 'IPv4' && !net.internal) {
                    networkCIDRs.push(net.cidr!);
                }
            }
        }
        return networkCIDRs;
    }

    /**
     * Retrieves a map of local network interfaces and their corresponding IPs.
     *
     * @returns {Map<string, string[]>} A map where the keys are the interface names and the values are arrays of IPv4 addresses.
     * @since v1.0.0
     */
    getLocalNetworkMap(): Map<string, string[]> {
        const interfaces = os.networkInterfaces();
        const localNetworkMap = new Map<string, string[]>();
        for (const name of Object.keys(interfaces)) {
            const ips = interfaces[name]!.filter(net => net.family === 'IPv4' && !net.internal).map(net => net.address);
            localNetworkMap.set(name, ips);
        }
        return localNetworkMap;
    }

    /**
     * Scans the local network subnets for hosts that have the specified port open.
     * 
     * This method enumerates all local network CIDRs, calculates all IP addresses
     * within those subnets, and checks if the given port is open on each IP.
     * 
     * **Note:** This scan only targets your local network. It is not designed
     * to scan public or external IP addresses.
     * 
     * @param port - The TCP port number to check on each local IP. Must be between 0 and 65535.
     * @param timeout - Optional timeout in milliseconds. If the scan takes longer, it will abort with an error.
     * 
     * @returns A promise that resolves to an array of IP addresses on the local network
     *          where the specified port is open.
     * 
     * @throws Will throw if the port is invalid or if the scan exceeds the specified timeout.
     * 
     * @since v1.0.0
     * 
     * @example
     * ```ts
     * const openHosts = await networks.local.discoverServiceHosts(80, 10000);
     * console.log('Hosts with port 80 open:', openHosts);
     * ```
     */
    async discoverServiceHosts(port: number, timeout?: number): Promise<string[]> {
        if (!networks.isValidPort(port)) { throw new Error(`Invalid port: ${port}. Must be between 0 and 65535`) }
        if (timeout !== undefined) {
            if (!numbersGuard.isNumber(timeout)) { throw new TypeError(`Invalid timeout: Expected number value but instead received ${typeof timeout}`) }
            if (!numbersGuard.isInteger(timeout)) { throw new TypeError(`Invalid timeout: Expected integer but instead received ${timeout}`) }
            if (!numbersGuard.isPositive(timeout)) { throw new TypeError(`Invalid timeout: Expected positive integer but instead received ${timeout}`) }
        }

        let aborted: boolean = false;
        let timeoutTimer: NodeJS.Timeout | undefined;
        const { promise, resolve, reject } = Promise.withResolvers<string[]>();
        const openHosts: string[] = [];

        try {
            const scanTask = async () => {
                try {
                    const cidrs = localNetwork.getNetworkCIDRs().map(i => {
                        const [ip, subnet] = i.split('/');
                        return { ip, subnet: parseInt(subnet, 10) };
                    });

                    for (const { ip, subnet } of cidrs) {
                        if (aborted) { break; }

                        const ips = networks.getSubnetIPs(ip, subnet);
                        const checks = ips.map(ip => {
                            return (async () => {
                                if (aborted) { return; }
                                const open = await networkInspector.isPortOpen(port, ip);
                                if (open) { openHosts.push(ip) }
                            })();
                        });

                        await Promise.all(checks);
                    }
                    
                    resolve(openHosts);
                } catch (error) {
                    reject(error);
                } finally {
                    if (timeoutTimer) { clearTimeout(timeoutTimer) }
                }
            }

            if (timeout !== undefined) {
                timeoutTimer = setTimeout(() => {
                    aborted = true;
                    const error = new Error(`Unable to scan local network for port ${port}: Scanning has timed out after ${timeout}ms`);
                    error.cause = 'SCAN_TIMEOUT';
                    reject(error);
                }, timeout);
            }

            void scanTask();
            return promise;
        } catch (error) {
            if (error instanceof Error) { error.message = `Unable to scan local network for port ${port}: ${error.message}` }
            throw error;
        }
    }
}

const localNetwork = new LocalNetwork;
export default localNetwork;