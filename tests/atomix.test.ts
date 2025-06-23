import atomix from "../src/atomix";

describe("atomix", () => {
    it("should be defined", () => {
        expect(atomix).toBeDefined();
    });  

    describe("the 'validator' module", () => {
        const valueIs = atomix.valueIs;
        it("should be defined", () => {
            expect(valueIs).toBeDefined();
        });

    })
});