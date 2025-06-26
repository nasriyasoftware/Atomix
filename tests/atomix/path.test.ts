import atomix from "../../src/atomix";
import path from "path";
import os from "os";

describe("the 'path' module", () => {
    it("should expose the path utilities", () => {
        expect(atomix.path).toBeDefined();
    });

    it("should normalize platform-specific paths correctly", () => {
        const filePath = path.join(os.tmpdir(), "Test/File.TXT");
        const normalized = atomix.path.normalizePath(filePath);
        const expected = process.platform === "win32" ? filePath.toLowerCase() : filePath;
        expect(normalized).toBe(expected);
    });

    it("should sanitize filenames with illegal characters", () => {
        const name = "bad:name*file?.txt";
        const safe = atomix.path.sanitizeName(name);
        expect(safe).not.toMatch(/[<>:"/\\|?*\x00-\x1F]/);
        expect(safe).not.toBe("");
    });

    it("should correctly detect sub-path relationships", () => {
        const parent = path.join(os.tmpdir(), "parent");
        const child = path.join(parent, "folder", "file.txt");
        expect(atomix.path.isSubPath(child, parent)).toBe(true);
    });

    it("should return file name without extension", () => {
        const filePath = path.join("/root/folder", "file.test.txt");
        expect(atomix.path.getFileNameWithoutExtension(filePath)).toBe("file.test");
    });

    it("should change a file extension correctly", () => {
        const filePath = "/some/path/file.txt";
        const result = atomix.path.changeExtension(filePath, ".json");
        expect(result.endsWith(".json")).toBe(true);
    });

    it("should throw if given extension is invalid", () => {
        const filePath = "/some/path/file.txt";
        expect(() => atomix.path.changeExtension(filePath, ".invalid_ext")).toThrow("Invalid file extension");
    });

    it("should correctly validate paths based on platform", () => {
        const valid = atomix.path.isValidPath("/some/valid/path.txt");
        const invalid = atomix.path.isValidPath("bad|path*name.txt");

        expect(valid).toBe(true);

        if (process.platform === "win32") {
            expect(invalid).toBe(false); // invalid characters on Windows
        } else {
            expect(invalid).toBe(true); // allowed on POSIX systems
        }
    });

    it("should compute a normalized relative path to cwd", () => {
        const fullPath = path.resolve("src/utils/test.txt");
        const rel = atomix.path.relativeToCwd(fullPath);
        const expected = process.platform === "win32" ? path.relative(process.cwd(), fullPath).toLowerCase() : path.relative(process.cwd(), fullPath);
        expect(rel).toBe(expected);
    });
});