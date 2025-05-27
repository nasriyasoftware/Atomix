import fs from 'fs';
import path from 'path';
import { AccessOptions, WatcherConfigs, WatcherOptions } from './docs';
import { getAccessOptions } from './assets/helpers';
import stringsUtils from '../data-types/string/strings-utils';
import fsPromises from './assets/fs-promises';
import Watcher from './assets/watcher';

class FileSystemUtils {
    /**
     * Provides async promises for file system operations.
     * 
     * @returns The fsPromises instance.
     * @since v1.0.0
     */
    get promises() { return fsPromises }

    /**
     * Loads a JSON file from the given path, returning its contents as a Record or Array.
     * 
     * @param filePath - The path to the JSON file to load.
     * @returns The contents of the JSON file as a Record or Array.
     * @throws Error if the file does not exist, is not a valid JSON file, or if the user does not have enough permissions to access the file.
     * @since v1.0.0
     * @example
     * const configFile = loadJSON('config.json');
     * // configFile is the contents of the file as a Record or Array
     */
    loadJSONSync(filePath: string): Record<string, any> | Array<any> {
        try {
            this.canAccessSync(filePath, { throwError: true, permissions: 'Read' });
            if (!filePath.toLowerCase().endsWith('.json')) { throw new Error(`${path.basename(filePath)} is not a JSON file.`) }
            const strContent = fs.readFileSync(filePath, { encoding: 'utf-8' });

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
     * @returns True if the file is accessible, false otherwise.
     * @since v1.0.0
     * @example
     * const canAccess = canAccessSync('path/to/file.txt');
     * // canAccess is true if the file is accessible, false otherwise
     */
    canAccessSync(filePath: string, options?: AccessOptions): boolean {
        if (!stringsUtils.guard.isString(filePath)) { throw new Error(`The filePath should be string, instead got ${typeof filePath}`) }
        const configs = getAccessOptions(options);

        try {
            fs.accessSync(filePath, configs.mode);
            return true;
        } catch (error) {
            if (configs.throwError) {
                if (error instanceof Error) { error.message = `You cannot access this path: ${error.message}` }
                throw error
            }

            return false;
        }
    }

    /**
     * Creates a file system watcher for monitoring changes in a specified path.
     *
     * @param pathToWatch - The path to the directory or file to be watched.
     * @param options - Optional configurations for the watcher.
     * @param options.debounceInterval - The interval in milliseconds to debounce change events.
     * @param options.handlers - An object containing event handlers for modify and disconnect events.
     * @returns An instance of the Watcher configured for the specified path.
     * @since v1.0.0
     */
    createWatcher(pathToWatch: string, options: WatcherOptions) {
        const configs: WatcherConfigs = {
            path: pathToWatch,
            debounceInterval: options?.debounceInterval,
            handlers: options?.handlers,
        }

        return new Watcher(configs);
    }
}

const fileSystem = new FileSystemUtils;
export default fileSystem;