import mimes from "./mimes/mimes";
import httpGuard from "./http-guard";
import bodyCodec from "./body-codec";

class HTTPUtils {
    /**
     * Provides type guard utilities for validating HTTP-related values,
     * such as methods, headers, status codes, and content types.
     *
     * Use this to ensure correctness and prevent malformed HTTP logic at runtime.
     *
     * @example
     * if (atomix.http.guard.isExtension('.js')) { ... }
     *
     * @since v1.0.0
     */
    readonly guard = httpGuard;

    /**
     * Provides constants and helpers for working with MIME types.
     * Includes common content types like `application/json`, `text/html`, and file extensions.
     *
     * Useful for setting or validating `Content-Type` headers.
     *
     * @example
     * response.setHeader('Content-Type', atomix.http.mimes.getExtensionByMime('application/json'));
     *
     * @since v1.0.0
     */
    readonly mimes = mimes

    /**
     * Encodes and decodes structured JavaScript values to/from HTTP-safe Buffer payloads.
     * Supports values like objects, arrays, sets, maps, and primitives.
     *
     * Used internally for transmitting cacheable or structured data via HTTP requests or responses.
     *
     * @example
     * const encoded = atomix.http.bodyCodec.encode({ foo: 'bar' });
     * const decoded = atomix.http.bodyCodec.decode(encoded);
     *
     * @since v1.0.2
     */
    readonly bodyCodec = bodyCodec;

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