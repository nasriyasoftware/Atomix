import atomix from "../../src/atomix";
import fs from "fs";
import path from "path";
import { testDir } from "../assets/configs";


const fsTestDir = path.join(testDir, 'fs');

describe("the 'fs' module", () => {
    beforeAll(() => {
        fs.mkdirSync(fsTestDir, { recursive: true });
    })

    afterAll(() => {
        if (fs.existsSync(fsTestDir)) { fs.rmSync(fsTestDir, { recursive: true }) }
    })

    it("should be defined", () => {
        expect(atomix.fs).toBeDefined();
    });

    it('should be able to test access', () => {
        const testFile = path.join(fsTestDir, 'test.txt');
        fs.writeFileSync(testFile, 'Hello, world!');

        expect(atomix.fs.canAccessSync(testFile)).toBe(true);

        fs.chmodSync(testFile, 0o444); // make it read-only
        expect(atomix.fs.canAccessSync(testFile, { permissions: ['Write'] })).toBe(false);
    })

    it('should be able to load JSON objects', () => {
        const testFile = path.join(fsTestDir, 'test_object.json');
        const data = { name: 'John', age: 30 };

        fs.writeFileSync(testFile, JSON.stringify(data));

        const loaded = atomix.fs.loadJSONSync(testFile);
        expect(loaded).toEqual(data);
    })

    it('should be able to load JSON arrays', () => {
        const testFile = path.join(fsTestDir, 'test_array.json');
        const data = [{ name: 'John', age: 30 }, { name: 'Jane', age: 25 }];

        fs.writeFileSync(testFile, JSON.stringify(data));

        const loaded = atomix.fs.loadJSONSync(testFile);
        expect(loaded).toEqual(data);
    })
});