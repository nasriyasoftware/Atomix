import networkInspector from "../../../src/domains/network/assets/inspect";
import os from "os";
import traceroute from "../../assets/traceroute/tracer";
import { unixTrace, win32Trace } from "../../assets/traceroute/helper";
const platform = os.platform();

describe('atomix.networks.inspect module', () => {
    describe('isPortOpen', () => {
        it('should return a boolean', async () => {
            const isOpen = await networkInspector.isPortOpen(80, 'google.com');
            expect(typeof isOpen).toBe('boolean');
        });

        it('should resolve false when port is closed (error)', async () => {
            const isOpen = await networkInspector.isPortOpen(80, 'localhost');
            expect(isOpen).toBe(false);
        });
    });

    describe('pingHost', () => {
        it('should return a boolean', async () => {
            const isOpen = await networkInspector.pingHost('google.com');
            expect(typeof isOpen).toBe('boolean');
        });

        it('should resolve false when host is unreachable (error)', async () => {
            const reachable = await networkInspector.pingHost('172.31.255.255');
            expect(reachable).toBe(false);
        });
    });

    describe('traceroute', () => {
        it('should trace a host', async () => {
            const hops = await traceroute('google.com');
            expect(hops).toEqual(platform === 'win32' ? win32Trace.hops : unixTrace.hops);
        });
    })
});