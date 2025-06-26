import remoteNetworks from '../../../src/domains/network/assets/remote';
import { IPGeolocation } from '../../../src/domains/network/assets/remote';

describe('RemoteNetworks', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv }; // Clone env
    });

    afterEach(() => {
        jest.restoreAllMocks();
        process.env = originalEnv;
    });

    describe('getPublicIP', () => {
        it('should return the public IP address from the API response', async () => {
            const mockIP = '123.45.67.89';

            global.fetch = jest.fn().mockResolvedValue({
                json: () => Promise.resolve({ ip: mockIP }),
            } as any);

            const result = await remoteNetworks.getPublicIP();
            expect(result).toBe(mockIP);
        });

        it('should throw an error if the fetch fails', async () => {
            global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

            await expect(remoteNetworks.getPublicIP()).rejects.toThrow('Unable to get public IP: Network error');
        });
    });

    describe('getGeoLocation', () => {
        const mockGeo: IPGeolocation = {
            ip: '123.45.67.89',
            city: 'Test City',
            region: 'Test Region',
            country: 'TC',
            loc: '12.3456,78.9012',
            org: 'Test Org',
            postal: '12345',
            timezone: 'Etc/UTC',
        };

        it('should return geolocation data for a valid IP', async () => {
            process.env.IPINFO_IO_TOKEN = 'dummy-token';

            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockGeo),
            } as any);

            const result = await remoteNetworks.getGeoLocation('123.45.67.89');
            expect(result).toEqual(mockGeo);
        });

        it('should return geolocation data for the public IP if no IP is provided', async () => {
            process.env.IPINFO_IO_TOKEN = 'dummy-token';

            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockGeo),
            } as any);

            const result = await remoteNetworks.getGeoLocation();
            expect(result).toEqual(mockGeo);
        });

        it('should throw an error for an invalid IP argument', async () => {
            // @ts-ignore - testing invalid argument
            await expect(remoteNetworks.getGeoLocation(123)).rejects.toThrow(
                'Invalid IP address: 123. Expected a string with a valid IP address but instead got: number'
            );
        });

        it('should throw if IPINFO_IO_TOKEN is not set', async () => {
            delete process.env.IPINFO_IO_TOKEN;
            await expect(remoteNetworks.getGeoLocation()).rejects.toThrow(
                'IPINFO_IO_TOKEN environment variable is not set'
            );
        });

        it('should throw if the response is not OK', async () => {
            process.env.IPINFO_IO_TOKEN = 'dummy-token';

            global.fetch = jest.fn().mockResolvedValue({
                ok: false,
                statusText: 'Forbidden',
            } as any);

            await expect(remoteNetworks.getGeoLocation()).rejects.toThrow(
                'Unable to get geo location: Failed to fetch IP info: Forbidden'
            );
        });

        it('should throw if fetch fails', async () => {
            process.env.IPINFO_IO_TOKEN = 'dummy-token';

            global.fetch = jest.fn().mockRejectedValue(new Error('Service unavailable'));

            await expect(remoteNetworks.getGeoLocation()).rejects.toThrow(
                'Unable to get geo location: Service unavailable'
            );
        });
    });
});
