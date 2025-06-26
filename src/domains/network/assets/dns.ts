import dns, { AnyRecord, CaaRecord, MxRecord, NaptrRecord, SoaRecord, SrvRecord } from "dns";
import stringsGuard from "../../data-types/string/strings-guard";
import runtime from "../../runtime/runtime";
import arraysUtils from "../../data-types/array/arrays-utils";

/**
 * Network Utilities module providing methods for local system network info,
 * remote network info, DNS operations, and network inspections.
 * 
 * Supports Node.js and Bun runtimes, Deno support untested.
 * 
 * @since v1.0.0
 */
class NetworkDNS {
    /**
     * Resolves DNS records for the given hostname and record type.
     *
     * Supports various RR (Resource Record) types:
     * - "A": Returns an array of IPv4 addresses as strings.
     * - "AAAA": Returns an array of IPv6 addresses as strings.
     * - "ANY": Returns an array of DNS ANY records.
     * - "CAA": Returns an array of CAA records.
     * - "CNAME": Returns an array of canonical name strings.
     * - "MX": Returns an array of MX (mail exchange) records.
     * - "NAPTR": Returns an array of NAPTR records (Note: Not supported in Bun).
     * - "NS": Returns an array of name server strings.
     * - "PTR": Returns an array of PTR records.
     * - "SOA": Returns a single SOA record object.
     * - "SRV": Returns an array of SRV records.
     * - "TXT": Returns an array of string arrays representing TXT records.
     *
     * Compatibility notes:
     * - Node.js: Fully supports all RR types and returns results according to standard Node.js `dns.promises.resolve`.
     * - Bun: Limited DNS support.
     *    - For "A" and "AAAA" record types, Bun returns a single DNS LookupAddress object rather than an array of strings. This method normalizes the result to always return an array of strings for consistency.
     *    - The "NAPTR" record type is **not supported** and will throw a `TypeError` if attempted.
     *    - The "TXT" record type may hang or cause `ECONNREFUSED` errors when using `dns.resolve()`.
     *
     * @param hostname - The hostname to resolve (e.g., "example.com").
     * @param rrtype - Optional. The DNS record type to query. Defaults to "A".
     * 
     * @returns A Promise resolving to the DNS records for the given hostname and record type.
     *          The return type varies depending on the RR type (see above).
     *
     * @throws {Error} If the hostname is not a string.
     * @throws {Error} On DNS errors other than ENOTFOUND, ENOTIMP, or ENODATA.
     * 
     * @example
     * // Resolve IPv4 addresses for "example.com"
     * const ips = await resolve("example.com", "A");
     *
     * @example
     * // Resolve MX records
     * const mxRecords = await resolve("example.com", "MX");
     */
    resolve(hostname: string): Promise<string[]>;
    resolve(hostname: string, rrtype: "A"): Promise<string[]>;
    resolve(hostname: string, rrtype: "AAAA"): Promise<string[]>;
    resolve(hostname: string, rrtype: "ANY"): Promise<AnyRecord[]>;
    resolve(hostname: string, rrtype: "CAA"): Promise<CaaRecord[]>;
    resolve(hostname: string, rrtype: "CNAME"): Promise<string[]>;
    resolve(hostname: string, rrtype: "MX"): Promise<MxRecord[]>;
    resolve(hostname: string, rrtype: "NAPTR"): Promise<NaptrRecord[]>;
    resolve(hostname: string, rrtype: "NS"): Promise<string[]>;
    resolve(hostname: string, rrtype: "PTR"): Promise<string[]>;
    resolve(hostname: string, rrtype: "SOA"): Promise<SoaRecord>;
    resolve(hostname: string, rrtype: "SRV"): Promise<SrvRecord[]>;
    resolve(hostname: string, rrtype: "TXT"): Promise<string[]>;

    async resolve(hostname: string, rrtype?: RRType): Promise<string[] | MxRecord[] | NaptrRecord[] | SoaRecord | SrvRecord[] | string[][] | CaaRecord[] | AnyRecord[]> {
        if (!stringsGuard.isString(hostname)) { throw new Error(`The hostname should be string, instead got ${typeof hostname}`) }
        if (rrtype === undefined) { rrtype = 'A' }

        try {
            const result = await dns.promises.resolve(hostname, rrtype);

            switch (rrtype) {
                case 'A': {
                    if (runtime.isBun()) {
                        return [(result as unknown as dns.LookupAddress).address];
                    }

                    return result;
                }

                case 'AAAA': {
                    if (runtime.isBun()) {
                        return [(result as unknown as dns.LookupAddress).address];
                    }

                    return result;
                }

                case 'TXT': {
                    return arraysUtils.deepFlatten(result as string[]);
                }

                default: {
                    return result;
                }
            }
        } catch (error) {
            if (error instanceof Error) {
                const err = error as any;
                if (['ENOTFOUND', 'ENOTIMP', 'ENODATA'].includes(err.code)) { return [] }
                if (['ETIMEOUT', 'ECONNREFUSED'].includes(err.code)) { err.message = `Unable to resolve ${hostname}: ${err.message}` }
            }

            throw error;
        }

    }

    /**
     * Resolves the given hostname to an array of its IP addresses.
     *
     * This is a convenience method for resolving hostnames to their IP addresses.
     * It is equivalent to calling `resolve(hostname, 'A')`.
     *
     * @param hostname - The hostname to resolve (e.g., "example.com").
     *
     * @returns A Promise resolving to an array of IP addresses for the given hostname.
     *          An empty array is returned if the hostname is not resolvable.
     *
     * @throws {Error} If the hostname is not a string.
     *
     * @example
     * // Resolve the IP addresses for "example.com"
     * const ips = await lookup("example.com");
     */
    async lookup(hostname: string): Promise<string[]> {
        return this.resolve(hostname);
    }

    /**
     * Resolves the given IP address to an array of hostnames.
     *
     * This is a convenience method for reversing IP addresses to their hostnames.
     * It is equivalent to calling `resolve(address, 'PTR')`.
     *
     * @param address - The IP address to reverse (e.g., "192.0.2.1").
     *
     * @returns A Promise resolving to an array of hostnames for the given IP address.
     *          An empty array is returned if the IP address is not resolvable.
     *
     * @throws {Error} If the address is not a string.
     *
     * @example
     * // Reverse the hostname for "192.0.2.1"
     * const names = await reverseLookup("192.0.2.1");
     */
    async reverseLookup(address: string): Promise<string[]> {
        try {
            const result = await dns.promises.reverse(address);
            return result;
        } catch (error) {
            if (error instanceof Error) {
                const err = error as any;
                if (['ENOTFOUND', 'ENOTIMP', 'ENODATA'].includes(err.code)) { return [] }
                if (['ETIMEOUT', 'ECONNREFUSED'].includes(err.code)) { err.message = `Unable to reverse lookup ${address}: ${err.message}` }
            }

            throw error;
        }
    }

    /**
     * Resolves the given hostname to an array of MX records.
     *
     * This method calls the underlying DNS resolver to resolve the given hostname
     * to an array of MX records. The returned array is sorted by priority.
     *
     * @param hostname - The hostname to resolve MX records for (e.g., "example.com").
     *
     * @returns A Promise resolving to an array of MX records for the given hostname.
     *          An empty array is returned if the hostname is not resolvable.
     *
     * @throws {Error} If the hostname is not a string.
     *
     * @example
     * // Resolve the MX records for "example.com"
     * const mxRecords = await resolveMx("example.com");
     * @since v1.0.0
     */
    async resolveMx(hostname: string): Promise<MxRecord[]> {
        try {
            const result = await dns.promises.resolveMx(hostname);
            return result;
        } catch (error) {
            if (error instanceof Error) { error.message = `Unable to resolve MX records for host ${hostname}: ${error.message}` }
            throw error;
        }
    }

    /**
     * Resolves the given hostname to an array of NS records.
     *
     * This method calls the underlying DNS resolver to resolve the given hostname
     * to an array of NS records.
     *
     * @param hostname - The hostname to resolve NS records for (e.g., "example.com").
     *
     * @returns A Promise resolving to an array of NS records for the given hostname.
     *          An empty array is returned if the hostname is not resolvable.
     *
     * @throws {Error} If the hostname is not a string.
     *
     * @example
     * // Resolve the NS records for "example.com"
     * const nsRecords = await resolveNs("example.com");
     * @since v1.0.0
     */
    async resolveNs(hostname: string): Promise<string[]> {
        try {
            const result = await dns.promises.resolveNs(hostname);
            return result;
        } catch (error) {
            if (error instanceof Error) { error.message = `Unable to resolve NS records for host ${hostname}: ${error.message}` }
            throw error;
        }
    }

    /**
     * Resolves the given hostname to an array of TXT records.
     *
     * This method calls the underlying DNS resolver to resolve the given hostname
     * to an array of TXT records.
     *
     * @param hostname - The hostname to resolve TXT records for (e.g., "example.com").
     *
     * @returns A Promise resolving to an array of TXT records for the given hostname.
     *          An empty array is returned if the hostname is not resolvable.
     *
     * @throws {Error} If the hostname is not a string.
     *
     * @example
     * // Resolve the TXT records for "example.com"
     * const txtRecords = await resolveTxt("example.com");
     * @since v1.0.0
     */
    async resolveTxt(hostname: string): Promise<string[][]> {
        try {
            const result = await dns.promises.resolveTxt(hostname);
            return result;
        } catch (error) {
            if (error instanceof Error) { error.message = `Unable to resolve TXT records for host ${hostname}: ${error.message}` }
            throw error;
        }
    }

    /**
     * Retrieves the list of configured DNS servers.
     *
     * @returns {string[]} An array of DNS server IP addresses or hostnames.
     *
     * @throws {Error} If unable to get the DNS servers.
     * @since v1.0.0
     */
    getDNSServers(): string[] {
        try {
            const result = dns.promises.getServers();
            return result;
        } catch (error) {
            if (error instanceof Error) { error.message = `Unable to get DNS servers: ${error.message}` }
            throw error;
        }
    }

    /**
     * Checks if a domain is resolvable to an IP address.
     *
     * This method performs a DNS lookup for the given domain and returns true if
     * the domain can be resolved, false otherwise.
     *
     * @param domain - The domain name to check.
     *
     * @returns A Promise resolving to true if the domain is resolvable, false otherwise.
     *
     * @example
     * const isResolvable = await networkDNS.isDNSResolvable('example.com');
     * @since v1.0.0
     */
    async isDNSResolvable(domain: string): Promise<boolean> {
        try {
            await this.resolve(domain);
            return true;
        } catch (error) {
            return false;
        }
    }
}

const networkDNS = new NetworkDNS();
export default networkDNS;

export type RRType = 'A' | 'AAAA' | 'ANY' | 'CAA' | 'CNAME' | 'MX' | 'NAPTR' | 'NS' | 'PTR' | 'SOA' | 'SRV' | 'TXT';