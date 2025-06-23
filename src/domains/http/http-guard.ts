import stringsUtils from "../data-types/string/strings-utils";
import mimes, { FileExtension, Mime } from "./mimes/mimes";

class HTTPGuard {
    /**
     * Checks if the provided value is a valid HTML string.
     * 
     * @param value - The value to check.
     * @returns True if the value is a valid HTML string, otherwise false.
     * @since v1.0.0
     * @description
     * A valid HTML string is a string that contains at least one HTML tag.
     * The HTML tags are matched using a regex pattern.
     */
    isHTML(value: string): value is string {
        const htmlRegex = /<\/?[a-z][\s\S]*>/i;
        return stringsUtils.guard.isString(value) && htmlRegex.test(value);
    }

    /**
     * Checks if the provided value is a valid MIME type.
     * 
     * @param value - The value to check.
     * @returns True if the value is a valid MIME type, otherwise false.
     * @since v1.0.0
     * @description
     * A valid MIME type is a string that matches one of the predefined MIME types.
     */
    isMimeType(value: unknown): value is Mime {
        return mimes.isValid.mime(value);
    }

    /**
     * Checks if the provided value is a valid file extension.
     * 
     * @param value - The value to check.
     * @returns True if the value is a valid file extension, otherwise false.
     * @since v1.0.0
     * @description
     * A valid file extension is a string that matches one of the predefined file extensions.
     */
    isExtension(value: unknown): value is FileExtension {
        return mimes.isValid.extension(value);
    }

    /**
     * Checks if the provided value is a valid URL.
     * 
     * @param url - The value to check.
     * @returns True if the value is a valid URL, otherwise false.
     * @since v1.0.0
     * @description
     * The URL is validated by attempting to create a new URL object
     * with the provided value. If the value is not a valid URL, the
     * constructor will throw an error.
     */
    isValidURL(url: unknown): boolean {
        try {
            if (!stringsUtils.guard.isString(url)) { return false; }
            new URL(url);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Checks if the provided value is a valid email address.
     * 
     * @param value - The value to check.
     * @returns True if the value is a valid email address, otherwise false.
     * @since v1.0.0
     * @description
     * The email address is validated by attempting to match it against a regular
     * expression. The regular expression is in the format of `/^[^\s@]+@[^\s@]+\.[^\s@]+$/i`.
     */
    isEmail(value: unknown): value is string {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
        return stringsUtils.guard.isString(value) && emailRegex.test(value);
    }
}

const httpGuard = new HTTPGuard;
export default httpGuard