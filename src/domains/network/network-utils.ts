import runtime from "../runtime/runtime";

class NetworkUtils {
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
    async getLocalIPs(): Promise<string[]> {
        const os = await runtime.loadModule('os');
        const nets = os.networkInterfaces();
        const interfaces = {} as Record<string, Array<any>>

        for (const name of Object.keys(nets)) {
            for (const net of nets[name]) {
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
}

const networks = new NetworkUtils;
export default networks;