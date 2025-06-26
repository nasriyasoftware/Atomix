
import atomix from "../../src/atomix";
import { win32Trace, unixTrace } from "../assets/traceroute/helper";
import traceroute from "../assets/traceroute/tracer";


describe("the 'networks' module", () => {
    const networks = atomix.networks;
    it("should be defined", () => {
        expect(networks).toBeDefined();
    });

    describe('isIPv4()', () => {
        it('returns true for valid IPv4 addresses', () => {
            expect(networks.isIPv4("192.168.1.1")).toBe(true);
            expect(networks.isIPv4("8.8.8.8")).toBe(true);
        });

        it('returns false for invalid IPv4 addresses', () => {
            expect(networks.isIPv4("::1")).toBe(false);
            expect(networks.isIPv4("not.an.ip")).toBe(false);
            expect(networks.isIPv4("256.256.256.256")).toBe(false);
        });
    });

    describe('isPrivateIP()', () => {
        it('returns true for private IPv4 addresses', () => {
            expect(networks.isPrivateIP("10.0.0.1")).toBe(true);
            expect(networks.isPrivateIP("192.168.0.1")).toBe(true);
            expect(networks.isPrivateIP("172.16.5.4")).toBe(true);
            expect(networks.isPrivateIP("172.31.255.255")).toBe(true);
        });

        it('returns false for public IPv4 addresses or invalid IPs', () => {
            expect(networks.isPrivateIP("8.8.8.8")).toBe(false);
            expect(networks.isPrivateIP("172.32.0.1")).toBe(false);
            expect(networks.isPrivateIP("::1")).toBe(false);
        });
    });

    describe('ipToInt() and intToIp()', () => {
        it('converts IP to int and back correctly', () => {
            const ip = "192.168.1.1";
            const int = networks.ipToInt(ip);
            expect(typeof int).toBe("number");
            const ipBack = networks.intToIp(int);
            expect(ipBack).toBe(ip);
        });
    });

    describe('getSubnetIPs()', () => {
        it('returns correct subnet IPs excluding network and broadcast', () => {
            const ips = networks.getSubnetIPs("192.168.1.0", 24);
            expect(ips[0]).toBe("192.168.1.1");
            expect(ips[ips.length - 1]).toBe("192.168.1.254");
            expect(ips.length).toBe(254);
        });
    });

    describe('isValidPort()', () => {
        it('returns true for valid ports', () => {
            expect(networks.isValidPort(0)).toBe(true);
            expect(networks.isValidPort(65535)).toBe(true);
            expect(networks.isValidPort(8080)).toBe(true);
        });

        it('returns false for invalid ports', () => {
            expect(networks.isValidPort(-1)).toBe(false);
            expect(networks.isValidPort(70000)).toBe(false);
            expect(networks.isValidPort("80")).toBe(false);
            expect(networks.isValidPort(3.14)).toBe(false);
        });
    });    
});