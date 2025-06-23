import atomix from "../../src/atomix";

describe("the 'networks' module", () => {
    const networks = atomix.networks;
    it("should be defined", () => {
        expect(networks).toBeDefined();
    });

    it('should detect local IPs correctly', async () => {
        const localIPs = await networks.getLocalIPs();
        expect(localIPs.length).toBeGreaterThan(0);
        expect(localIPs.every(ip => typeof ip === 'string')).toBe(true);
    })
});