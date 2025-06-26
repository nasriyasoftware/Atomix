import { TracerouteHop } from "../../../src/docs/docs";
import { win32Trace, unixTrace } from "./helper";
import os from "os";
const platform = os.platform();

const parsers = {
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
}

const prepareLines = (stdout: string) => {
    let lines = stdout.split('\n').map(line => line.trim()).filter(Boolean);

    // Remove header lines before hops
    // Find first line that starts with a number (hop index)
    const firstHopIndex = lines.findIndex(line => /^\d+/.test(line));
    if (firstHopIndex > 0) {
        lines = lines.slice(firstHopIndex);
    }

    return lines;
}

const parse = (lines: string[], platform: NodeJS.Platform) => {
    if (platform === 'win32') {
        return parsers.parseWindowsTraceroute(lines);
    } else {
        return parsers.parseUnixTraceroute(lines);
    }
}

export default async function traceroute(hostname: string): Promise<TracerouteHop[]> {
    try {
        const stdout = platform === 'win32' ? win32Trace.trace : unixTrace.trace;
        const lines = prepareLines(stdout);
        return parse(lines, platform);
    } catch (error) {
        if (error instanceof Error) { error.message = `Unable to traceroute host ${hostname}: ${error.message}` }
        throw error;
    }
}