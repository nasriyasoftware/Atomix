import atomix from "../../src/atomix";
import fs from "fs";
import path from "path";
import { testDir } from "../configs";

describe("the 'fs' module", () => {
    beforeAll(() => {
        fs.mkdirSync(testDir, { recursive: true });
    })

    afterAll(() => {
        if (fs.existsSync(testDir)) { if (fs.existsSync(testDir)) { fs.rmSync(testDir, { recursive: true }); } }
    })

    it("should be defined", () => {
        expect(atomix.fs).toBeDefined();
    });

    it('should be able to test access', () => {
        const testFile = path.join(testDir, 'test.txt');
        fs.writeFileSync(testFile, 'Hello, world!');

        expect(atomix.fs.canAccessSync(testFile)).toBe(true);

        fs.chmodSync(testFile, 0o444); // make it read-only
        expect(atomix.fs.canAccessSync(testFile, { permissions: ['Write'] })).toBe(false);
    })

    it('should be able to load JSON objects', () => {
        const testFile = path.join(testDir, 'test_object.json');
        const data = { name: 'John', age: 30 };

        fs.writeFileSync(testFile, JSON.stringify(data));

        const loaded = atomix.fs.loadJSONSync(testFile);
        expect(loaded).toEqual(data);
    })

    it('should be able to load JSON arrays', () => {
        const testFile = path.join(testDir, 'test_array.json');
        const data = [{ name: 'John', age: 30 }, { name: 'Jane', age: 25 }];

        fs.writeFileSync(testFile, JSON.stringify(data));

        const loaded = atomix.fs.loadJSONSync(testFile);
        expect(loaded).toEqual(data);
    })
});