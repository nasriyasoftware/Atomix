import path from 'path';
import runtime from '../runtime/runtime';
import mimes from '../http/mimes/mimes';

class PathUtils {
    /**
     * Normalizes the given path by resolving it to an absolute path and converting 
     * it to lowercase if the current platform is Windows.
     * @param path_ The path to normalize.
     * @returns The normalized path.
     * @since v1.0.0
     */
    normalizePath(path_: string) {
        const resolved = path.resolve(path.normalize(path_));
        return runtime.platform.isWindows() ? resolved.toLowerCase() : resolved;
    }

    /**
     * Returns a sanitized and safe file or folder name by replacing or removing illegal characters.
     * Illegal characters differ between platforms, so this method handles Windows and POSIX systems.
     *
     * @param name - The file or folder name to sanitize.
     * @param replacement - The character(s) to replace illegal characters with. Defaults to '_'.
     * @returns The sanitized safe name.
     * @since v1.0.0
     * @example
     * const safeName = sanitizeName('my*illegal:file?.txt');
     * // safeName === 'my_illegal_file_.txt'
     */
    sanitizeName(name: string, replacement = '_'): string {
        if (typeof name !== 'string') throw new TypeError('Name must be a string');

        // Characters illegal on Windows filenames:
        // < > : " / \ | ? * and also control chars 0-31
        // POSIX forbids '/' in names
        const illegalRe = runtime.platform.isWindows()
            ? /[<>:"/\\|?*\x00-\x1F]/g
            : /[/\x00]/g;

        // Also forbid trailing dots or spaces on Windows
        let sanitized = name.replace(illegalRe, replacement);

        if (runtime.platform.isWindows()) {
            sanitized = sanitized.replace(/[. ]+$/, ''); // remove trailing dots/spaces
        }

        // Prevent empty names
        if (sanitized.length === 0) sanitized = '_';

        return sanitized;
    }

    /**
     * Determines if the given child path is a sub-path of the given parent path.
     * 
     * @param childPath - The path to check as a sub-path.
     * @param parentPath - The path to check as the parent.
     * @returns True if the child path is a sub-path of the parent path, false otherwise.
     * @since v1.0.0
     * @example
     * const isSub = isSubPath('/path/to/child', '/path/to');
     * isSub is true
     */
    isSubPath(childPath: string, parentPath: string): boolean {
        const normalizedChild = this.normalizePath(childPath);
        const normalizedParent = this.normalizePath(parentPath);

        const relative = path.relative(normalizedParent, normalizedChild);

        return relative && !relative.startsWith('..') && !path.isAbsolute(relative) ? true : false
    }

    /**
     * Gets the filename of the given path without the file extension.
     * @param filePath - The path to get the filename from.
     * @returns The filename without extension.
     * @since v1.0.0
     * @example
     * const filename = getFileNameWithoutExtension('/path/to/file.txt');
     * filename is 'file'
     */
    getFileNameWithoutExtension(filePath: string): string {
        filePath = this.normalizePath(filePath);
        return path.basename(filePath, path.extname(filePath));
    }

    /**
     * Changes the file extension of the given path to the specified new extension.
     * @param filePath - The path to change the extension of.
     * @param newExt - The new file extension to set. Must be a valid file extension.
     * @returns The modified path with the new extension.
     * @throws Error if the provided new extension is not a valid file extension.
     * @since v1.0.0
     * @example
     * const newFilePath = changeExtension('/path/to/file.txt', '.json');
     * newFilePath is '/path/to/file.json'
     */
    changeExtension(filePath: string, newExt: string): string {
        if (!mimes.isValid.extension(newExt)) throw new Error(`Invalid file extension: ${newExt}`);

        filePath = this.normalizePath(filePath);
        return filePath.replace(path.extname(filePath), newExt);
    }

    /**
     * Checks if the given string is a valid file path.
     * 
     * On Windows, this checks that the path does not contain any of the following characters:
     * - `<>:"|?*`
     * - ASCII control characters (characters with code points less than 32)
     * 
     * On Unix-like platforms, this only checks that the path is not empty and does not contain the null byte (`\0`).
     * 
     * @param path_ - The path to check.
     * @returns True if the path is valid, false otherwise.
     * @since v1.0.0
     */
    isValidPath(path_: string): boolean {
        if (!path_ || typeof path_ !== 'string') return false;

        // Basic invalid Windows path characters (adjust as needed)
        const invalidChars = /[<>:"|?*\x00-\x1F]/;

        if (runtime.platform.isWindows()) {
            return !invalidChars.test(path_);
        }

        // On Unix-like, just check if it's not empty and no null byte
        return !path_.includes('\0');
    }

    /**
     * Gets the relative path from the current working directory to the given path.
     * 
     * @param path_ - The path to get the relative path from the current working directory.
     * @returns The relative path from the current working directory to the given path.
     * @since v1.0.0
     * @example
     * const relativePath = pathUtils.relativeToCwd('/Users/username/Documents/file.txt');
     * relativePath is 'Users/username/Documents/file.txt'
     */
    relativeToCwd(path_: string): string {
        const cwd = process.cwd();
        const relative = path.relative(cwd, path_);
        return this.normalizePath(relative);
    }
}

const pathUtils = new PathUtils;
export default pathUtils;