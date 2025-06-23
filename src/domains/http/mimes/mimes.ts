import mimeData from "./mime-data";

class Mimes {
    readonly #_extensions: FileExtension[];
    readonly #_mimes: Mime[];
    readonly #_cache = {
        extensionToMime: new Map<FileExtension, Mime>(),
        mimeToExtension: new Map<Mime, FileExtension>()
    }

    constructor() {
        const exts = new Set<FileExtension>();
        const mimes = new Set<Mime>();

        for (const { extension, mime } of mimeData) {
            exts.add(extension);
            mimes.add(mime);

            this.#_cache.extensionToMime.set(extension, mime);
            this.#_cache.mimeToExtension.set(mime, extension);
        }

        this.#_extensions = Array.from(exts);
        this.#_mimes = Array.from(mimes);
    }

    /**
     * Returns an array of all known file extensions that can be mapped to a MIME type.
     * @returns {FileExtension[]} An array of file extensions.
     */
    get extensions(): FileExtension[] { return this.#_extensions }

    /**
     * Returns an array of all known MIME types that can be mapped to a file extension.
     * @returns {Mime[]} An array of MIME types.
     */
    get mimes(): Mime[] { return this.#_mimes }

    readonly isValid = {
        /**
         * Checks if the provided extension is a valid file extension.
         * 
         * @param ext - The extension to check.
         * @returns True if the extension is valid, otherwise false.
         */
        extension: (ext: any): ext is FileExtension => this.#_cache.extensionToMime.has(ext?.toLowerCase?.()),

        /**
         * Checks if the provided MIME type is a valid MIME type.
         * 
         * @param mime - The MIME type to check.
         * @returns True if the MIME type is valid, otherwise false.
         */
        mime: (mime: any): mime is Mime => this.#_cache.mimeToExtension.has(mime?.toLowerCase?.())
    }

    /**
     * Returns the file extension associated with the provided MIME type.
     * 
     * @param mime - The MIME type to get the file extension for.
     * @returns The file extension associated with the provided MIME type, or undefined if not found.
     */
    getExtensionByMime(mime: Mime): FileExtension | undefined {
        return this.#_cache.mimeToExtension.get(mime?.toLowerCase?.() as Mime);
    }

    /**
     * Returns the MIME type associated with the provided file extension.
     * 
     * @param ext - The file extension to get the MIME type for.
     * @returns The MIME type associated with the provided file extension, or undefined if not found.
     */
    getMimeByExtension(ext: FileExtension): Mime | undefined {
        return this.#_cache.extensionToMime.get(ext?.toLowerCase?.() as FileExtension);
    }
}

const mimes = new Mimes;
export default mimes;

export type Mime = typeof mimeData[number]["mime"];
export type FileExtension = typeof mimeData[number]["extension"];