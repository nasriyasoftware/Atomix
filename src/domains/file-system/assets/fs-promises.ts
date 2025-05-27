import fs from 'fs';
import path from 'path';
import stringsUtils from "../../data-types/string/strings-utils";
import { AccessOptions } from "../docs";
import { getAccessOptions } from "./helpers";

class FileSystemPromisesUtils {
    /**
     * Asynchronously loads a JSON file from the given path, returning its contents as a Record or Array.
     * 
     * @param filePath - The path to the JSON file to load.
     * @returns A promise that resolves to the contents of the JSON file as a Record or Array.
     * @throws Error if the file does not exist, is not a valid JSON file, or if the user does not have enough permissions to access the file.
     * @since v1.0.0
     * @example
     * const configFile = await loadJSON('config.json');
     * // configFile is the contents of the file as a Record or Array
     */
    async loadJSON(filePath: string): Promise<Record<string, any> | Array<any>> {
        try {
            await this.canAccess(filePath, { throwError: true, permissions: 'Read' });
            if (!filePath.toLowerCase().endsWith('.json')) { throw new Error(`${path.basename(filePath)} is not a JSON file.`) }
            const strContent = await fs.promises.readFile(filePath, { encoding: 'utf-8' });

            try {
                const file = JSON.parse(strContent);
                return file;
            } catch (error) {
                throw new Error(`The default configuration file is damaged, corrupted, or not a valid JSON file.`);
            }
        } catch (error) {
            if (error instanceof Error) { error.message = `Unable to load JSON file: ${error.message}` }
            throw error;
        }
    }

    /**
     * Checks if the given file path is accessible by the current user.
     * 
     * @param filePath - The path to the file to check.
     * @param options - An object containing the property "throwError".
     * @param options.throwError - If true, throws an error if the file is not accessible. If false, returns false.
     * @returns A promise that resolves to true if the file is accessible, false otherwise.
     * @since v1.0.0
     * @example
     * const canAccess = await canAccess('path/to/file.txt');
     * // canAccess is true if the file is accessible, false otherwise
     */
    canAccess(filePath: string, options?: AccessOptions): Promise<boolean> {
        if (!stringsUtils.guard.isString(filePath)) { throw new Error(`The filePath should be string, instead got ${typeof filePath}`) }
        const configs = getAccessOptions(options);

        return new Promise<boolean>((resolve, reject) => {
            fs.promises.access(filePath, configs.mode).then(() => resolve(true)).catch((err) => {
                if (configs.throwError) {
                    if (err instanceof Error) { err.message = `You cannot access this path: ${err.message}` }
                    reject(err);
                } else {
                    resolve(false);
                }
            })
        })
    }
}

const fsPromises = new FileSystemPromisesUtils;
export default fsPromises;