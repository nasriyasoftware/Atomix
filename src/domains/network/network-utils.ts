import net from 'net';

import localNetwork from "./assets/local";
import networkDNS from "./assets/dns";
import remoteNetworks from "./assets/remote";
import networkInspector from "./assets/inspect";

import numbersGuard from "../data-types/number/numbers-guard";

class NetworkUtils {
    /**
     * Provides utilities for accessing and managing local network information
     * such as local IPs, hostnames, and MAC addresses.
     * 
     * @readonly
     */
    readonly local = localNetwork;

    /**
     * Provides network inspection utilities, including port scanning,
     * service discovery, and network diagnostics.
     * 
     * @readonly
     */
    readonly inspect = networkInspector;

    /**
     * Provides DNS utilities including hostname resolution,
     * reverse lookup, and DNS record querying.
     * 
     * @readonly
     */
    readonly dns = networkDNS;

    /**
     * Provides utilities for interacting with remote networks,
     * such as obtaining the public IP address.
     * 
     * @readonly
     */
    readonly remote = remoteNetworks;


    /**
     * Checks if the provided IP address is a valid IPv4 address.
     *
     * @param ip - The IP address to check.
     * @returns True if the IP address is a valid IPv4 address, otherwise false.
     * @throws {Error} If there is an issue detecting the IPv4 status.
     * @since v1.0.0
     */
    isIPv4(ip: string): boolean {
        try {
            return net.isIPv4(ip);
        } catch (error) {
            if (error instanceof Error) { error.message = `Unable to detect IPv4: ${error.message}` }
            throw error;
        }
    }

    /**
     * Checks if the provided IP address is a private IPv4 address.
     *
     * According to RFC 1918, the private IPv4 addresses are:
     * - 10.0.0.0/8
     * - 172.16.0.0/12
     * - 192.168.0.0/16
     *
     * @param ip - The IP address to check.
     * @returns True if the IP address is a private IPv4 address, otherwise false.
     * @throws {Error} If there is an issue detecting the private IP status.
     * @since v1.0.0
     */
    isPrivateIP(ip: string): boolean {
        try {
            if (!this.isIPv4(ip)) { return false }
            return (
                ip.startsWith('10.') ||
                ip.startsWith('192.168.') ||
                ip.startsWith('172.') && +ip.split('.')[1] >= 16 && +ip.split('.')[1] <= 31
            );
        } catch (error) {
            if (error instanceof Error) { error.message = `Unable to detect private IP: ${error.message}` }
            throw error;
        }
    }

    /**
     * Converts a dotted IPv4 string to a 32-bit integer.
     * 
     * @param ip - The IPv4 address in dot-decimal notation (e.g., "192.168.1.1").
     * @returns The 32-bit integer representation of the IP address.
     * @since v1.0.0
     * @example
     * ipToInt("192.168.1.1"); // 3232235777
     */
    ipToInt(ip: string): number {
        return ip.split('.').reduce((int, octet) => (int << 8) + parseInt(octet, 10), 0) >>> 0;
    }

    /**
     * Converts a 32-bit integer back to a dotted IPv4 string.
     * 
     * @param int - The 32-bit integer representation of an IP address.
     * @returns The IPv4 address in dot-decimal notation.
     * @since v1.0.0
     * @example
     * intToIp(3232235777); // "192.168.1.1"
     */
    intToIp(int: number): string {
        return [
            (int >>> 24) & 0xff,
            (int >>> 16) & 0xff,
            (int >>> 8) & 0xff,
            int & 0xff
        ].join('.');
    }

    /**
     * Generates an array of all IP addresses within a subnet.
     * 
     * @param ip - The IP address of the subnet in dot-decimal notation (e.g., "192.168.1.1").
     * @param subnet - The subnet mask in CIDR notation (e.g., 24).
     * @returns An array of IP addresses within the subnet, excluding the network and broadcast addresses.
     * @since v1.0.0
     * @example
     * getSubnetIPs("192.168.1.1", 24); // ["192.168.1.2", ..., "192.168.1.254"]
     */
    getSubnetIPs(ip: string, subnet: number): string[] {
        const ipInt = this.ipToInt(ip);
        const mask = ~((1 << (32 - subnet)) - 1) >>> 0;  // subnet mask as int

        const network = ipInt & mask;
        const broadcast = network | ~mask >>> 0;

        const ips: string[] = [];
        for (let i = network + 1; i < broadcast; i++) {
            ips.push(this.intToIp(i));
        }
        return ips;
    }

    /**
     * Checks if the provided value is a valid port number.
     * 
     * A valid port number is an integer between 0 and 65535 inclusive.
     * 
     * @param port - The value to check.
     * @returns True if the value is a valid port number, otherwise false.
     * @since v1.0.0
     */
    isValidPort(port: unknown): boolean {
        return numbersGuard.isInteger(port) && port >= 0 && port <= 65535;
    }
}

const networks = new NetworkUtils;
export default networks;