import fs from 'fs';

class Runtime {
    /**
     * Gets the name of the project.
     * @returns The name of the project.
     * @since v1.0.0
     */
    getProjectName(): string {
        // Read package.json file
        const packageJson = fs.readFileSync('package.json', 'utf8');
        // Parse package.json as JSON
        const packageData = JSON.parse(packageJson);
        // Extract project name
        return packageData.name;
    }

    /**
     * Determines the module system being used.
     * 
     * @returns 'commonjs' or 'module'.
     * @since v1.0.0
     */
    getModuleSystem(): 'commonjs' | 'module' {
        return typeof module !== 'undefined' && module.exports ? 'commonjs' : 'module';
    }

    /**
     * Asynchronously loads a module by name, either as a file or a package.
     * 
     * @param name - The name or path of the module to load.
     * @param options - Optional settings for loading the module.
     * @param options.isFile - If true, treats the name as a file path. Defaults to false.
     * @returns A promise that resolves to the loaded module.
     * @throws Error with an appropriate message if the module cannot be loaded.
     * @since v1.0.0
     */
    async loadModule(name: string, options?: { isFile?: boolean }): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            try {
                const isFile = options?.isFile ?? false;
                const nodeEnv = this.getModuleSystem();

                if (nodeEnv === 'commonjs') {
                    const mod = require(name);
                    resolve('default' in mod ? mod.default : mod);
                } else {
                    // @ts-ignore
                    import(isFile ? `file://${name}` : name).then(mod => resolve('default' in mod ? mod.default : mod));
                }
            } catch (error) {
                if (error instanceof Error) { error.message = `Unable to load module (${name}): ${error.message}` }
                reject(error);
            }
        })
    }

    /**
     * Asynchronously loads a module from a specified file path.
     * 
     * @param filePath - The path to the file to load as a module.
     * @returns A promise that resolves to the loaded module.
     * @throws Error with an appropriate message if the module cannot be loaded.
     * @since v1.0.0
     */
    async loadFileModule(filePath: string): Promise<any> {
        return this.loadModule(filePath, { isFile: true });
    }

    readonly platform = {
        /**
         * Determines if the current platform is Windows.
         * 
         * @returns True if the current platform is Windows, false otherwise.
         * @since v1.0.0
         */
        isWindows: () => {
            return process.platform === 'win32';
        },
        /**
         * Determines if the current platform is Linux.
         * @returns True if the current platform is Linux, false otherwise.
         * @since v1.0.0
         */
        isLinux: () => {
            return process.platform === 'linux';
        },
        /**
         * Determines if the current platform is macOS.
         * @returns True if the current platform is macOS, false otherwise.
         * @since v1.0.0
         */
        isMac: () => {
            return process.platform === 'darwin';
        }
    }

    /**
     * Checks if the current environment is Node.js.
     * @returns true if the environment is Node.js, false otherwise.
     * @since v1.0.0
     */
    isNode() {
        return typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
    }

    /**
     * Checks if the current environment is Bun.
     * @returns true if the environment is Bun, false otherwise.
     * @since v1.0.0
     */
    isBun() {
        return typeof process !== 'undefined' && process.versions != null && process.versions.bun != null;
    }

    /**
     * Checks if the current environment is Deno.
     * @returns true if the environment is Deno, false otherwise.
     * @since v1.0.0
     */
    isDeno() {
        // @ts-ignore
        return typeof Deno !== 'undefined' && typeof Deno.version === 'object'
    }

    /**
     * Gets the name of the runtime engine (Node.js, Bun, Deno, etc.) that is currently being used.
     * @returns The name of the runtime engine, or 'unknown' if the engine could not be determined.
     * @since v1.0.0
     */
    getRuntimeEngine(): 'node' | 'bun' | 'deno' | 'unknown' {
        if (this.isNode()) { return 'node' }
        if (this.isBun()) { return 'bun' }
        if (this.isDeno()) { return 'deno' }

        return 'unknown';
    }
}

const runtime = new Runtime;
export default runtime;