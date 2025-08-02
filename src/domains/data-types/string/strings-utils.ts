import stringsGuard from "./strings-guard";
import numbersGuard from "../number/numbers-guard";
import recordsUtils from "../record/records-utils";
import commonUtils from "../../utils/utils";

class StringsUtils {
    /**
     * Returns the stringsGuard instance.
     * @since v1.0.0
     */
    get guard() { return stringsGuard }

    /**
     * Converts a string to camel case format.
     * 
     * This function transforms the input string by capitalizing the first letter 
     * of each word except the first one and removing all spaces. 
     * Useful for transforming phrases into camel case notation.
     *
     * @param str - The string to convert.
     * @returns The camel case formatted string.
     * @since v1.0.0
     */
    toCamelCase(str: string): string {
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/\s+/g, '');
    }

    /**
     * Converts a string to kebab case format.
     * 
     * This function transforms the input string by inserting a hyphen between each
     * uppercase and lowercase letter and converting all letters to lowercase.
     * Useful for transforming phrases into kebab case notation.
     *
     * @param str - The string to convert.
     * @returns The kebab case formatted string.
     * @since v1.0.0
     */
    toKebabCase(str: string): string {
        return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }

    /**
     * Converts a string to snake case format.
     * 
     * This function transforms the input string by inserting an underscore between
     * each uppercase and lowercase letter and converting all letters to lowercase.
     * Useful for transforming phrases into snake case notation.
     *
     * @param str - The string to convert.
     * @returns The snake case formatted string.
     * @since v1.0.0
     */
    toSnakeCase(str: string): string {
        return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
    }

    /**
     * Truncates a given string to a given length.
     * 
     * This function will truncate the given string to the specified length and
     * append an ellipsis (...) to the end of the string if it exceeds the length.
     * @param str - The string to truncate.
     * @param length - The length to truncate to.
     * @returns The truncated string.
     * @since v1.0.0
     */
    truncate(str: string, length: number): string {
        return str.length > length ? `${str.slice(0, length)}...` : str;
    }

    /**
     * Capitalizes the first letter of a given string.
     * 
     * @param str - The string to capitalize.
     * @returns The capitalized string.
     * @since v1.0.0
     */
    capitalizeFirstLetter(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Reverses the characters in a given string.
     * 
     * @param str - The string to reverse.
     * @returns The reversed string.
     * @since v1.0.0
     */
    reverse(str: string): string {
        return str.split('').reverse().join('');
    }

    /**
     * Pads the input string to the specified `maxLength` using either a static fill character
     * or random characters. You can configure which side(s) to pad and how.
     *
     * - If `random` is `true`, random characters will be used instead of `fillChar`.
     * - If `side` is `'both'`, padding will be split between the start and end.
     *
     * @param str - The original string to be padded.
     * @param maxLength - The desired total length of the resulting string.
     * @param options - Optional configuration for padding behavior.
     * 
     * @throws {TypeError} If any argument is of an invalid type.
     * @throws {RangeError} If `maxLength` is not a positive integer.
     *
     * @returns The padded string, with added characters on the configured side(s).
     *
     * @since v1.0.0
     */
    pad(str: string, maxLength: number, options?: StringPaddingOptions): string {
        const configs = {
            maxLength: maxLength,
            side: 'start',
            fillChar: ' ',
            random: false
        }

        {
            // Validate input
            if (!stringsGuard.isString(str)) { throw new TypeError(`Expected a string for the "str" value but received ${typeof str}`); };
            if (!numbersGuard.isNumber(maxLength)) { throw new TypeError(`Expected a number for the "maxLength" value but received ${typeof maxLength}`); };
            if (!numbersGuard.isInteger(maxLength)) { throw new TypeError(`Expected an integer for the "maxLength" value but received ${maxLength}`); };
            if (!numbersGuard.isPositive(maxLength)) { throw new RangeError(`Expected a positive number for the "maxLength" value but received ${maxLength}`); };

            if (recordsUtils.guard.isRecord(options)) {
                if ('side' in options && recordsUtils.hasOwnProperty(options, 'side')) {
                    if (!stringsGuard.isString(options.side)) { throw new TypeError(`Expected a string for the "side" value but received ${typeof options.side}`); };
                    if (!['start', 'end', 'both'].includes(options.side)) { throw new TypeError(`Expected "start" or "end" for the "side" value but received ${options.side}`); };
                    configs.side = options.side;
                }

                if ('fillChar' in options && recordsUtils.hasOwnProperty(options, 'fillChar')) {
                    if (!stringsGuard.isString(options.fillChar)) { throw new TypeError(`Expected a string for the "fillChar" value but received ${typeof options.fillChar}`); };
                    if (options.fillChar.length > 1) { throw new TypeError(`Expected a single character for the "fillChar" value but received ${options.fillChar}`); };
                    configs.fillChar = options.fillChar;
                }

                if ('random' in options && recordsUtils.hasOwnProperty(options, 'random')) {
                    if (typeof options.random !== 'boolean') { throw new TypeError(`Expected a boolean for the "random" value but received ${typeof options.random}`); };
                    configs.random = options.random;
                }
            }
        }

        const neededPadding = Math.max(0, maxLength - str.length);
        let remainingPadding = neededPadding;
        let startPadding = configs.side === 'start' ? neededPadding : configs.side === 'both' ? Math.ceil(neededPadding / 2) : 0;
        let endingPadding = configs.side === 'end' ? neededPadding : configs.side === 'both' ? remainingPadding - startPadding : 0;

        while (startPadding > 0) {
            const char = configs.random ? commonUtils.generateRandom(1) : configs.fillChar;
            str = char + str;
            startPadding--;
        }

        while (endingPadding > 0) {
            const char = configs.random ? commonUtils.generateRandom(1) : configs.fillChar;
            str += char;
            endingPadding--;
        }

        return str;;
    }

    /**
     * Pads the beginning of a string until the `maxLength` is reached.
     *
     * Behaves like `pad()` with `side` forced to `'start'`.
     *
     * @param str - The original string to be padded.
     * @param maxLength - The total desired length after padding.
     * @param options - Optional configuration excluding the `side` option.
     *
     * @throws {TypeError} If any argument is of an invalid type.
     * @throws {RangeError} If `maxLength` is not a positive integer.
     *
     * @returns The padded string with characters added to the start.
     *
     * @since v1.0.0
     */
    padStart(str: string, maxLength: number, options?: Omit<StringPaddingOptions, 'side'>): string {
        return this.pad(str, maxLength, { ...options, side: 'start' });
    }

    /**
     * Pads the end of a string until the `maxLength` is reached.
     *
     * Behaves like `pad()` with `side` forced to `'end'`.
     *
     * @param str - The original string to be padded.
     * @param maxLength - The total desired length after padding.
     * @param options - Optional configuration excluding the `side` option.
     *
     * @throws {TypeError} If any argument is of an invalid type.
     * @throws {RangeError} If `maxLength` is not a positive integer.
     *
     * @returns The padded string with characters added to the end.
     *
     * @since v1.0.0
     */
    padEnd(str: string, maxLength: number, options?: Omit<StringPaddingOptions, 'side'>): string {
        return this.pad(str, maxLength, { ...options, side: 'end' });
    }

    /**
     * Removes all whitespace from the given string.
     *
     * @param str - The original string to have its whitespace removed.
     *
     * @returns The string with all whitespace removed.
     *
     * @since v1.0.0
     */
    removeWhitespace(str: string): string {
        return str.replace(/\s/g, '');
    }

    /**
     * Counts the number of occurrences of a substring within a given string.
     *
     * @param str - The string to search for occurrences.
     * @param substr - The substring to search for.
     *
     * @returns The number of occurrences of the substring in the string.
     *
     * @since v1.0.0
     */
    countOccurrences(str: string, substr: string): number {
        return str.split(substr).length - 1;
    }

    /**
     * Checks if the given string starts with the given prefix, ignoring case.
     *
     * @param str - The string to check.
     * @param prefix - The prefix to search for.
     *
     * @returns True if the string starts with the prefix, otherwise false.
     *
     * @since v1.0.0
     */
    startsWithIgnoreCase(str: string, prefix: string): boolean {
        return str.toLowerCase().startsWith(prefix.toLowerCase());
    }

    /**
     * Checks if the given string ends with the given suffix, ignoring case.
     *
     * @param str - The string to check.
     * @param suffix - The suffix to search for.
     *
     * @returns True if the string ends with the suffix, otherwise false.
     *
     * @since v1.0.0
     */
    endsWithIgnoreCase(str: string, suffix: string): boolean {
        return str.toLowerCase().endsWith(suffix.toLowerCase());
    }

    /**
     * Strips all HTML tags from a given string, returning a plain text string.
     *
     * @param str - The string to strip HTML tags from.
     *
     * @returns The input string with all HTML tags removed.
     *
     * @since v1.0.0
     */
    stripHTMLTags(str: string): string {
        return str.replace(/<[^>]+>/g, '');
    }


    /**
     * Creates a slug from the given string.
     *
     * The slug is created by decomposing combined letters to letter + diacritic,
     * removing diacritics, converting to lowercase, removing non-word characters
     * except space, and then replacing spaces with hyphens.
     *
     * @param str - The string to create a slug from.
     *
     * @returns The slugified string.
     *
     * @since v1.0.0
     */
    slugify(str: string): string {
        return str
            .normalize('NFD')                      // Decompose combined letters to letter + diacritic
            .replace(/[\u0300-\u036f]/g, '')      // Remove diacritics
            .toLowerCase()
            .replace(/[^\w ]+/g, '')               // Remove non-word characters except space
            .replace(/ +/g, '-');                  // Replace spaces with hyphens
    }
}

const stringsUtils = new StringsUtils;
export default stringsUtils;

export interface StringPaddingOptions {
    /**
     * The side to pad the string on.
     * 
     * @default 'start'
     * @since v1.0.0
     */
    side?: 'start' | 'end' | 'both',
    /**
     * The character to fill the padding with.
     * 
     * @default ' ' // Empty character
     * @since v1.0.0
     */
    fillChar?: string,
    /**
     * Whether to fill the padding with random characters.
     * 
     * **Important:** This will override the `fillChar` option.
     * 
     * @default false
     * @since v1.0.0
     */
    random?: boolean
}