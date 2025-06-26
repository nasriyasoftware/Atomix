import dns from 'dns';
import networkDNS from '../../../src/domains/network/assets/dns';

jest.mock('dns', () => ({
    promises: {
        resolve: jest.fn(),
        resolveMx: jest.fn(),
        resolveNs: jest.fn(),
        resolveTxt: jest.fn(),
        reverse: jest.fn(),
        getServers: jest.fn()
    }
}));

const mockedDns = dns.promises as jest.Mocked<typeof dns.promises>;

describe('NetworkDNS', () => {
    afterEach(() => jest.clearAllMocks());

    describe('resolve', () => {
        it('resolves A records', async () => {
            mockedDns.resolve.mockResolvedValue(['93.184.216.34']);
            const result = await networkDNS.resolve('example.com', 'A');
            expect(result).toEqual(['93.184.216.34']);
        });

        it('resolves TXT records and flattens them', async () => {
            mockedDns.resolve.mockResolvedValue([['v=spf1 include:_spf.google.com ~all']]);
            const result = await networkDNS.resolve('example.com', 'TXT');
            expect(result).toEqual(['v=spf1 include:_spf.google.com ~all']);
        });

        it('returns empty array for ENOTFOUND', async () => {
            const error = new Error('Not found') as any;
            error.code = 'ENOTFOUND';
            mockedDns.resolve.mockRejectedValue(error);
            const result = await networkDNS.resolve('invalid.domain', 'A');
            expect(result).toEqual([]);
        });
    });

    describe('lookup', () => {
        it('calls resolve with default A record', async () => {
            mockedDns.resolve.mockResolvedValue(['1.1.1.1']);
            const result = await networkDNS.lookup('cloudflare.com');
            expect(result).toEqual(['1.1.1.1']);
        });
    });

    describe('reverseLookup', () => {
        it('resolves PTR records', async () => {
            mockedDns.reverse.mockResolvedValue(['example.com']);
            const result = await networkDNS.reverseLookup('93.184.216.34');
            expect(result).toEqual(['example.com']);
        });

        it('returns empty array for ENODATA', async () => {
            const error = new Error('No data') as any;
            error.code = 'ENODATA';
            mockedDns.reverse.mockRejectedValue(error);
            const result = await networkDNS.reverseLookup('192.0.2.1');
            expect(result).toEqual([]);
        });
    });

    describe('resolveMx', () => {
        it('resolves MX records', async () => {
            mockedDns.resolveMx.mockResolvedValue([{ exchange: 'mail.example.com', priority: 10 }]);
            const result = await networkDNS.resolveMx('example.com');
            expect(result).toEqual([{ exchange: 'mail.example.com', priority: 10 }]);
        });
    });

    describe('resolveNs', () => {
        it('resolves NS records', async () => {
            mockedDns.resolveNs.mockResolvedValue(['ns1.example.com', 'ns2.example.com']);
            const result = await networkDNS.resolveNs('example.com');
            expect(result).toEqual(['ns1.example.com', 'ns2.example.com']);
        });
    });

    describe('resolveTxt', () => {
        it('resolves TXT records', async () => {
            const txt = [['some-text']];
            mockedDns.resolveTxt.mockResolvedValue(txt);
            const result = await networkDNS.resolveTxt('example.com');
            expect(result).toEqual(txt);
        });
    });

    describe('getDNSServers', () => {
        it('returns DNS servers', () => {
            mockedDns.getServers.mockReturnValue(['8.8.8.8', '1.1.1.1']);
            const result = networkDNS.getDNSServers();
            expect(result).toEqual(['8.8.8.8', '1.1.1.1']);
        });
    });

    describe('isDNSResolvable', () => {
        it('returns true if domain resolves', async () => {
            mockedDns.resolve.mockResolvedValue(['127.0.0.1']);
            const result = await networkDNS.isDNSResolvable('localhost');
            expect(result).toBe(true);
        });

        it('returns false if domain does not resolve', async () => {
            mockedDns.resolve.mockRejectedValue(new Error('fail'));
            const result = await networkDNS.isDNSResolvable('nonexistent.tld');
            expect(result).toBe(false);
        });
    });
});
