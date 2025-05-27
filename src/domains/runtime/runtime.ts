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
     * Gets the current Node.js environment, either 'commonjs' or 'module'.
     * @returns 'commonjs' if the current environment is CommonJS, 'module' if it is ES modules.
     * @since v1.0.0
     */
    getNodeEnv(): 'commonjs' | 'module' {
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
                const nodeEnv = this.getNodeEnv();

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
}

const runtime = new Runtime;
export default runtime;