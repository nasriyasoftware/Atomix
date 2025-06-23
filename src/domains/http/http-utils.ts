import mimes from "./mimes/mimes";
import httpGuard from "./http-guard";

class HTTPUtils {
    /**
     * Returns the HTTPGuard instance.
     * @since v1.0.0
     */
    get guard() { return httpGuard }

    /**
     * Returns the Mimes instance.
     */
    readonly mimes = mimes
    
    /**
     * Encodes a UTF-8 string into Base64, mimicking browser `btoa()` for regular text.
     * @param text The UTF-8 text to encode.
     */
    btoa(text: string): string {
        return Buffer.from(text, 'utf8').toString('base64');
    }

    /**
     * Decodes a Base64 string into UTF-8 text, mimicking browser `atob()`.
     * @param base64 The Base64 string to decode.
     */
    atob(base64: string): string {
        return Buffer.from(base64, 'base64').toString('utf8');
    }
}

const httpUtils = new HTTPUtils;
export default httpUtils;