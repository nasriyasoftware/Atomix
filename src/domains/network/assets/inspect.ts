import net from 'net';
import { exec } from 'child_process';
import { promisify } from 'util';
import runtime from '../../runtime/runtime';

const execAsync = promisify(exec);

class NetworkInspector {
    readonly #_helpers = {
        traceroute: {
            parsers: {
                parseWindowsTraceroute(lines: string[]): TracerouteHop[] {
                    const hops: TracerouteHop[] = [];
                    const whiteSpace = ' ';

                    for (const line of lines) {
                        const parts = line.split(whiteSpace.repeat(4)).map(t => t.trim());
                        const hopInt = parseInt(parts[0], 10);
                        if (isNaN(hopInt)) { continue }

                        const probes = parts.slice(1);
                        // The last probe contains time and IP separated by 2 spaces
                        const lastProbe = probes[probes.length - 1];
                        const lastParts = lastProbe.split(whiteSpace.repeat(2)).map(t => t.trim());

                        if (lastParts.length < 2) continue; // invalid format, skip

                        const ip = lastParts[1];
                        probes[probes.length - 1] = lastParts[0]; // keep only the time part

                        // If all probes are '*', skip this hop (timeout)
                        if (probes.every(p => p === '*')) continue;

                        // Parse times, removing any '<' and converting to float
                        const timesMs = probes.map(p => {
                            if (p === '*') { return undefined }; // indicate timeout
                            return parseFloat(p.replace('<', ''));
                        }).filter(t => t !== undefined);

                        hops.push({
                            hop: hopInt,
                            ips: [ip],  // Windows traceroute usually has one IP per hop
                            timesMs
                        })
                    }

                    return hops;
                },
                parseUnixTraceroute(lines: string[]): TracerouteHop[] {
                    const hops: TracerouteHop[] = [];
                    const whiteSpace = ' ';

                    for (const line of lines) {
                        const parts = line.split(whiteSpace.repeat(2)).map(t => t.trim());
                        const hopInt = parseInt(parts[0], 10);
                        if (isNaN(hopInt)) { continue }

                        const item: TracerouteHop = {
                            hop: hopInt,
                            ips: [],
                            timesMs: []
                        }

                        const ips = new Set<string>();
                        const probes = parts.slice(1);

                        probesLoop: for (const probe of probes) {
                            if (probe.startsWith('*')) { continue probesLoop }

                            if (probe.includes('ms')) {
                                // e.g. "12.345 ms 192.168.1.1"
                                const [ms, ip] = probe.split('ms').map(t => t.trim());
                                item.timesMs.push(parseFloat(ms));
                                if (ip && typeof ip === 'string') { ips.add(ip) }
                            } else {
                                // Possibly an IP with no time, e.g. "192.168.1.1"
                                ips.add(probe);
                            }
                        }

                        item.ips = Array.from(ips);
                        hops.push(item);
                    }

                    return hops;
                }
            },
            exec: async (hostname: string, platform: NodeJS.Platform) => {
                let command = '';

                if (platform === 'win32') {
                    command = `tracert -d ${hostname}`;
                } else if (platform === 'linux' || platform === 'darwin') {
                    command = `traceroute -n ${hostname}`;
                } else {
                    throw new Error(`Unsupported platform: ${platform}`);
                }

                const { stdout } = await execAsync(command);
                return stdout;
            },
            prepareLines: (stdout: string) => {
                let lines = stdout.split('\n').map(line => line.trim()).filter(Boolean);

                // Remove header lines before hops
                // Find first line that starts with a number (hop index)
                const firstHopIndex = lines.findIndex(line => /^\d+/.test(line));
                if (firstHopIndex > 0) {
                    lines = lines.slice(firstHopIndex);
                }

                return lines;
            },
            parse: (lines: string[], platform: NodeJS.Platform) => {
                if (platform === 'win32') {
                    return this.#_helpers.traceroute.parsers.parseWindowsTraceroute(lines);
                } else {
                    return this.#_helpers.traceroute.parsers.parseUnixTraceroute(lines);
                }
            },
        }
    }

    /**
     * Checks if a TCP port is open on a given host.
     *
     * This method attempts to establish a TCP connection to the specified host and port.
     * If the connection is successful, it resolves to true. If the connection is refused
     * or times out, it resolves to false.
     *
     * @param port - The TCP port number to check on the host. Must be between 0 and 65535.
     * @param option - Optional options object containing a hostname and/or timeout value.
     *   - `hostname`: The hostname of the host to check. Defaults to 'localhost'.
     *   - `timeout`: The timeout in milliseconds. Defaults to 2000.
     *
     * @returns {Promise<boolean>} A promise that resolves to true if the port is open, false otherwise.
     * @since v1.0.0
     */
    async isPortOpen(port: number, option?: PortCheckOptions): Promise<boolean> {
        const hostname = option?.hostname || 'localhost';
        const timeout = option?.timeout || 2000;

        return new Promise(resolve => {
            const socket = net.createConnection({ port, host: hostname });

            let resolved = false;
            const resolveOnce = (value: boolean) => {
                if (!resolved) {
                    resolved = true;
                    socket.destroy(); // Ensures socket is fully closed
                    resolve(value);
                }
            };

            // Bind error listener immediately
            socket.once('error', () => resolveOnce(false));
            socket.setTimeout(timeout, () => resolveOnce(false));
            socket.once('connect', () => resolveOnce(true));
        })
    }

    /**
     * Pings a host to check if it is reachable.
     *
     * This method executes the native `ping` command with the `-c` flag on Unix-like platforms and the `-n` flag on Windows.
     * It resolves true if the host is reachable, false otherwise.
     *
     * @param hostname - The hostname of the host to ping.
     *
     * @returns {Promise<boolean>} A promise that resolves to true if the host is reachable, false otherwise.
     * @throws {Error} If unable to ping the host.
     * @since v1.0.0
     */
    async pingHost(hostname: string, timeoutMs = 2000): Promise<boolean> {
        try {
            const platform = process.platform;
            const countFlag = platform === 'win32' ? '-n' : '-c';
            // Timeout flag differs per platform:
            // Windows: -w <timeout in ms>
            // Unix: -W <timeout in seconds>
            const timeoutFlag = platform === 'win32' ? '-w' : '-W';
            const timeoutValue = platform === 'win32' ? timeoutMs : Math.ceil(timeoutMs / 1000);

            const command = `ping ${countFlag} 1 ${timeoutFlag} ${timeoutValue} ${hostname}`;

            try {
                await execAsync(command);
                return true; // If the command succeeds, host is reachable
            } catch {
                return false; // If ping fails or throws, assume host is unreachable
            }
        } catch (error) {
            if (error instanceof Error) { error.message = `Unable to ping host ${hostname}: ${error.message}` }
            throw error;
        }
    }

    /**
     * Performs a traceroute to the given hostname.
     *
     * This method executes the native `traceroute` command on Unix-like platforms and the `tracert` command on Windows.
     * It resolves to an array of TracerouteHop objects, each representing a hop in the path from this machine to the
     * given hostname. Each hop contains the IP address of the hop, the hostname of the hop if available, and an array
     * of times taken to reach the hop in milliseconds.
     *
     * @param hostname - The hostname to perform a traceroute to.
     *
     * @returns {Promise<TracerouteHop[]>} A promise that resolves to an array of TracerouteHop objects.
     * @throws {Error} If unable to perform the traceroute.
     * @since v1.0.0
     */
    async traceroute(hostname: string): Promise<TracerouteHop[]> {
        try {
            const os = await runtime.loadModule('os');
            const platform = os.platform();

            const stdout = await this.#_helpers.traceroute.exec(hostname, platform);
            const lines = this.#_helpers.traceroute.prepareLines(stdout);
            return this.#_helpers.traceroute.parse(lines, platform);
        } catch (error) {
            if (error instanceof Error) { error.message = `Unable to traceroute host ${hostname}: ${error.message}` }
            throw error;
        }
    }
}

const networkInspector = new NetworkInspector();
export default networkInspector;

export interface TracerouteHop {
    hop: number;
    ips: (string)[];
    timesMs: number[];
}

export interface PortCheckOptions {
    /**
     * The hostname to check the port on.
     * @default 'localhost'
     */
    hostname?: string;
    /**
     * The timeout in milliseconds for the port check.
     * @default 2000
     */
    timeout?: number;
}