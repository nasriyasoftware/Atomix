import localNetwork from "../../../src/domains/network/assets/local";
import networks from "../../../src/domains/network/network-utils";

describe('localNetwork module', () => {
    describe('getLocalIPs', () => {
        it('should return an array of non-internal IPv4 addresses as strings', () => {
            const ips = localNetwork.getLocalIPs();
            expect(Array.isArray(ips)).toBe(true);
            ips.forEach(ip => {
                expect(typeof ip).toBe('string');
                expect(ip.split('.').length).toBe(4); // crude IPv4 check
            });
        });
    });

    describe('getHostname', () => {
        it('should return a non-empty string', () => {
            const hostname = localNetwork.getHostname();
            expect(typeof hostname).toBe('string');
            expect(hostname.length).toBeGreaterThan(0);
        });
    });

    describe('getMACAddresses', () => {
        it('should return an array of MAC addresses as strings', () => {
            const macs = localNetwork.getMACAddresses();
            expect(Array.isArray(macs)).toBe(true);
            macs.forEach(mac => expect(typeof mac).toBe('string'));
        });
    });

    describe('getDefaultGateway', () => {
        it('should return a string (possibly empty)', () => {
            const gateway = localNetwork.getDefaultGateway();
            expect(typeof gateway).toBe('string');
            // Could be empty if no default gateway found
        });
    });

    describe('getNetworkCIDRs', () => {
        it('should return an array of CIDR strings', () => {
            const cidrs = localNetwork.getNetworkCIDRs();
            expect(Array.isArray(cidrs)).toBe(true);
            cidrs.forEach(cidr => {
                expect(typeof cidr).toBe('string');
                expect(cidr).toMatch(/^\d+\.\d+\.\d+\.\d+\/\d+$/); // rudimentary CIDR format check
            });
        });
    });

    describe('getLocalNetworkMap', () => {
        it('should return a Map with interface names as keys and arrays of IP strings as values', () => {
            const map = localNetwork.getLocalNetworkMap();
            expect(map instanceof Map).toBe(true);
            for (const [iface, ips] of map) {
                expect(typeof iface).toBe('string');
                expect(Array.isArray(ips)).toBe(true);
                ips.forEach(ip => expect(typeof ip).toBe('string'));
            }
        });
    });

    describe('discoverServiceHosts', () => {
        afterEach(() => {
            jest.restoreAllMocks(); // fully resets all spies and mock implementations
        });

        it('should resolve to an array of IPs where the port is open', async () => {
            // Mock the method on the networkInspector instance
            jest.spyOn(networks.inspect, 'isPortOpen').mockImplementation((_, ip) =>
                Promise.resolve(ip!.endsWith('.2') || ip!.endsWith('.5'))
            );

            jest.spyOn(localNetwork, 'getNetworkCIDRs').mockReturnValue(['192.168.1.0/30']);
            jest.spyOn(networks, 'getSubnetIPs').mockReturnValue(['192.168.1.1', '192.168.1.2', '192.168.1.3']);

            const openHosts = await localNetwork.discoverServiceHosts(80, 5000);

            expect(openHosts).toContain('192.168.1.2');
            expect(openHosts).not.toContain('192.168.1.1');
            expect(openHosts).not.toContain('192.168.1.3');
        });

        it('should throw on invalid port', async () => {
            const port = -1;
            const errorMsg = `Invalid port: ${port}. Must be between 0 and 65535`;
            await expect(localNetwork.discoverServiceHosts(port)).rejects.toThrow(errorMsg);
        });

        it('should throw on invalid timeout', async () => {
            const port = 80;
            const errorMsg = `Invalid timeout: Expected number value but instead received ${typeof 'not a number'}`;
            // @ts-ignore - deliberately passing wrong type
            await expect(localNetwork.discoverServiceHosts(port, 'not a number')).rejects.toThrow(errorMsg);
        });

        it('should reject if timeout expires', async () => {
            const port = 80;
            const timeout = 100;
            const errorMsg = `Unable to scan local network for port ${port}: Scanning has timed out after ${timeout}ms`;
            await expect(localNetwork.discoverServiceHosts(port, timeout)).rejects.toThrow(errorMsg);
        });
    });
});