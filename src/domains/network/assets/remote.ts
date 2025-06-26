import stringsGuard from "../../data-types/string/strings-guard";

class RemoteNetworks {
    /**
     * Retrieves the public IP address of the server.
     *
     * This method fetches the public IP by making an HTTP request to an external service.
     *
     * @returns {Promise<string>} A promise that resolves to the public IP address as a string.
     * @throws {Error} If unable to fetch or parse the public IP address.
     * @since v1.0.0
     */
    async getPublicIP(): Promise<string> {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            if (error instanceof Error) { error.message = `Unable to get public IP: ${error.message}` }
            throw error;
        }
    }

    /**
     * Retrieves the geolocation information for a given IP address.
     *
     * This method fetches geolocation data by querying an external IP information
     * service using the IPINFO_IO_TOKEN environment variable for authentication.
     * If the IP address is not provided, it fetches the geolocation info for the
     * public IP address of the server.
     *
     * @param ip - Optional. The IP address to get geolocation data for. Defaults
     *             to the server's public IP if not provided.
     *
     * @returns {Promise<IPGeolocation>} A promise that resolves to an object containing
     *          IP geolocation data such as IP, city, region, country, location, organization,
     *          postal code, and timezone.
     *
     * @throws {TypeError} If the provided IP address is not a valid string.
     * @throws {Error} If the IPINFO_IO_TOKEN environment variable is not set.
     * @throws {Error} If fetching the geolocation data fails.
     *
     * @since v1.0.0
     */
    async getGeoLocation(ip?: string): Promise<IPGeolocation> {
        if (ip !== undefined && !stringsGuard.isValidString(ip)) { throw new TypeError(`Invalid IP address: ${ip}. Expected a string with a valid IP address but instead got: ${typeof ip}`) }

        try {
            const token = process.env.IPINFO_IO_TOKEN;
            if (!token) { throw new Error('IPINFO_IO_TOKEN environment variable is not set') }

            const url = `https://ipinfo.io/${ip || ''}?token=${token}`;
            const response = await fetch(url);
            if (!response.ok) { throw new Error(`Failed to fetch IP info: ${response.statusText}`) }

            const data = await response.json();
            return data;
        } catch (error) {
            if (error instanceof Error) { error.message = `Unable to get geo location: ${error.message}` }
            throw error;
        }
    }
}

const remoteNetworks = new RemoteNetworks();
export default remoteNetworks;

export interface IPGeolocation {
    ip: string;
    city: string;
    region: string;
    country: string;
    loc: string;
    org: string;
    postal: string;
    timezone: string;
}