import atomix from "../../src/atomix";

describe("the 'utils' module", () => {
    const utils = atomix.utils;
    it("should be defined", () => {
        expect(utils).toBeDefined();
    });

    it('should generate random strings correctly', () => {
        const randomString = utils.generateRandom(10);
        expect(randomString.length).toBe(10);
    })

    it('should sleep correctly', async () => {
        const start = Date.now();
        await utils.sleep(1000);
        const end = Date.now();
        expect(end - start).toBeGreaterThanOrEqual(1000);        
    })

    it('should throttle correctly', async () => {
       let initValue = 0;
       const throttled = utils.throttle(() => initValue++, 1000);
       throttled();
       throttled();
       throttled();
       await utils.sleep(2000);
       expect(initValue).toBe(1);
    })
});