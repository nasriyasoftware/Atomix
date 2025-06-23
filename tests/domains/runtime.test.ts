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
    const moduleSystem = runtime.getModuleSystem();

    it("should be defined", () => {
        expect(runtime).toBeDefined();
    });

    it("should get the project name from package.json", () => {
        const packageJsonPath = path.resolve("package.json");
        const backupPath = path.resolve("package.json.bak");

        // Rename original package.json if it exists
        if (fs.existsSync(packageJsonPath)) {
            fs.renameSync(packageJsonPath, backupPath);
        }

        try {
            const dummyName = "test-project";
            fs.writeFileSync(
                packageJsonPath,
                JSON.stringify({ name: dummyName }, null, 2),
                "utf8"
            );

            expect(runtime.getProjectName()).toBe(dummyName);
        } finally {
            // Clean up test package.json
            if (fs.existsSync(packageJsonPath)) {
                fs.unlinkSync(packageJsonPath);
            }
            // Restore original package.json if it was renamed
            if (fs.existsSync(backupPath)) {
                fs.renameSync(backupPath, packageJsonPath);
            }
        }
    });

    it("should detect module system", () => {
        expect(["commonjs", "module"]).toContain(runtime.getModuleSystem());
    });

    it('should load modules correctly', async () => {
        const testModulePath = path.join(testDir, 'test_module.js');
        const moduleContent = (() => {
            if (moduleSystem === 'commonjs') {
                return `module.exports = { name: 'John', age: 30 }`;
            } else {
                return `export default { name: 'John', age: 30 }`;
            }
        })();

        fs.writeFileSync(testModulePath, moduleContent);

        const loaded = await runtime.loadModule(testModulePath, { isFile: true });
        expect(loaded).toEqual({ name: 'John', age: 30 });
    });

    it("should load file module (loadFileModule) correctly", async () => {
        const testModulePath = path.join(testDir, "test_file_module.js");
        const moduleContent = (() => {
            if (moduleSystem === "commonjs") {
                return `module.exports = { foo: 'bar' }`;
            } else {
                return `export default { foo: 'bar' }`;
            }
        })();

        fs.writeFileSync(testModulePath, moduleContent);

        const loaded = await runtime.loadFileModule(testModulePath);
        expect(loaded).toEqual({ foo: "bar" });
    });

    describe("platform detection", () => {
        it("should detect if platform is Windows, Linux or Mac", () => {
            expect(typeof runtime.platform.isWindows()).toBe("boolean");
            expect(typeof runtime.platform.isLinux()).toBe("boolean");
            expect(typeof runtime.platform.isMac()).toBe("boolean");
        });
    });

    describe("runtime environment detection", () => {
        it("should detect Node.js environment", () => {
            expect(typeof runtime.isNode()).toBe("boolean");
        });

        it("should detect Bun environment", () => {
            expect(typeof runtime.isBun()).toBe("boolean");
        });

        it("should detect Deno environment", () => {
            expect(typeof runtime.isDeno()).toBe("boolean");
        });

        it("should return a valid runtime engine string", () => {
            const engine = runtime.getRuntimeEngine();
            expect(["node", "bun", "deno", "unknown"]).toContain(engine);
        });
    });
})