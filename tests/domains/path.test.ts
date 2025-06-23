import atomix from "../../src/atomix";
import path from "path";
import os from "os";

describe("the 'path' module", () => {
    it("should be defined", () => {
        expect(atomix.path).toBeDefined();
    });

    it('should normalize paths correctly', () => {
        const filePath = path.join(os.tmpdir(), 'test.txt');
        const normalizedPath = atomix.path.normalizePath(filePath);
        expect(normalizedPath).toBe(filePath.toLowerCase());
    })
});