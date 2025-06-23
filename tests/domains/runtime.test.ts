import atomix from "../../src/atomix";
import path from "path";
import fs from "fs";
import { testDir } from "../configs";

describe("the 'runtime' module", () => {
    beforeAll(() => {
        fs.mkdirSync(testDir, { recursive: true });
    })

    afterAll(() => {
        if (fs.existsSync(testDir)) { fs.rmSync(testDir, { recursive: true }); }
    })
    
    const runtime = atomix.runtime;
    const env = runtime.getModuleSystem();

    it("should be defined", () => {
        expect(runtime).toBeDefined();
    });

    it('should load modules correctly', async () => {
        const testModulePath = path.join(testDir, 'test_module.js');
        const moduleContent = (() => {
            if (env === 'commonjs') {
                return `module.exports = { name: 'John', age: 30 }`;
            } else {
                return `export default { name: 'John', age: 30 }`;
            }
        })();

        fs.writeFileSync(testModulePath, moduleContent);

        const loaded = await runtime.loadModule(testModulePath, { isFile: true });
        expect(loaded).toEqual({ name: 'John', age: 30 });
    });
})