import valueIs from "../../valueIs";
import recordsUtils from "../data-types/record/records-utils";
import mimes from "./mimes/mimes";
import httpGuard from "./http-guard";
import bodyCodec from "./body-codec";
import { InputSanitizationOptions, SanitizedResult, SanitizationViolation, InputSanitizationConfigs, FieldRuleMap } from "./docs";


class HTTPUtils {
    readonly #_helpers = {
        inputValidators: {
            sanitizeOptions: (options?: InputSanitizationOptions): InputSanitizationConfigs => {
                const configs: InputSanitizationConfigs = {
                    trim: true,
                    allowHTML: false,
                    allowUnicode: false,
                    maxLength: Infinity,
                    allow: undefined,
                    deny: undefined,
                    strict: false,
                };

                if (options === undefined) { return configs; }
                if (!valueIs.record(options)) { throw new TypeError(`Expected a record input but received ${typeof options}`) }

                const hasOwnProperty = recordsUtils.hasOwnProperty.bind(recordsUtils);

                if (hasOwnProperty(options, 'trim')) {
                    if (typeof options.trim !== 'boolean') { throw new TypeError(`Expected 'trim' to be a boolean but received ${typeof options.trim}`); }
                    configs.trim = options.trim;
                }

                if (hasOwnProperty(options, 'allowHTML')) {
                    if (typeof options.allowHTML !== 'boolean') { throw new TypeError(`Expected 'allowHTML' to be a boolean but received ${typeof options.allowHTML}`); }
                    configs.allowHTML = options.allowHTML;
                }

                if (hasOwnProperty(options, 'allowUnicode')) {
                    if (typeof options.allowUnicode !== 'boolean') { throw new TypeError(`Expected 'allowUnicode' to be a boolean but received ${typeof options.allowUnicode}`); }
                    configs.allowUnicode = options.allowUnicode;
                }

                if (hasOwnProperty(options, 'maxLength')) {
                    if (!valueIs.number(options.maxLength)) { throw new TypeError(`Expected 'maxLength' to be a number but received ${typeof options.maxLength}`); }
                    if (!valueIs.integer(options.maxLength) && options.maxLength !== Infinity) { throw new TypeError(`Expected 'maxLength' to be an integer but received ${options.maxLength}`); }
                    if (options.maxLength < 0) { throw new RangeError(`Expected 'maxLength' to be a non-negative integer but received ${options.maxLength}`); }
                    configs.maxLength = options.maxLength;
                }

                if (hasOwnProperty(options, 'allow') && options.allow) {
                    if (!(options.allow instanceof RegExp)) { throw new TypeError(`Expected 'allow' to be a RegExp but received ${typeof options.allow}`); }
                    configs.allow = options.allow;
                }

                if (hasOwnProperty(options, 'deny') && options.deny) {
                    if (!(options.deny instanceof RegExp)) { throw new TypeError(`Expected 'deny' to be a RegExp but received ${typeof options.deny}`); }
                    configs.deny = options.deny;
                }

                if (hasOwnProperty(options, 'strict')) {
                    if (typeof options.strict !== 'boolean') { throw new TypeError(`Expected 'strict' to be a boolean but received ${typeof options.strict}`); }
                    configs.strict = options.strict;
                }

                return configs;
            },
            sanitizeString: (input: string, options?: InputSanitizationOptions): InputSanitizationConfigs => {
                try {
                    if (!valueIs.string(input)) { throw new TypeError(`Expected a string input but received ${typeof input}`) }
                    return this.#_helpers.inputValidators.sanitizeOptions(options);
                } catch (error) {
                    if (error instanceof Error) {
                        error.message = `Input validation error: ${error.message}`;
                    }

                    throw error;
                }
            },
            sanitize: <T extends Record<string, string>>(input: T, options?: FieldRuleMap<T>): { [K in keyof T]: SanitizedResult<string> | undefined } => {
                try {
                    options = options ?? {};
                    if (!valueIs.record(input)) { throw new TypeError(`Expected a record input but received ${typeof input}`) }
                    const result = {} as { [K in keyof T]: SanitizedResult<string> | undefined };
                    const hasOwnProperty = recordsUtils.hasOwnProperty.bind(recordsUtils);

                    for (const key in input) {
                        (result as any)[key] = this.#_helpers.inputValidators.sanitizeOptions(hasOwnProperty(options, key) ? options[key] : undefined);
                    }

                    return result;
                } catch (error) {
                    if (error instanceof Error) {
                        error.message = `Input validation error: ${error.message}`;
                    }

                    throw error;
                }
            }
        },
        /**
         * Sanitizes a user input string based on configurable rules and returns a result
         * with the cleaned output and a list of violations (if any).
         *
         * This method supports removing non-ASCII characters, HTML tags, control characters,
         * denying or allowing characters via regex, trimming whitespace, and enforcing a max length.
         * It tracks any modifications made and optionally throws if strict mode is enabled.
         *
         * Default behavior (when no options are provided):
         * - Trims whitespace (`trim: true`)
         * - Removes HTML tags (`allowHTML: false`)
         * - Removes non-ASCII characters (`allowUnicode: false`)
         * - Allows all characters (`allow: undefined`)
         * - Denies no characters (`deny: undefined`)
         * - Does not throw on violations (`strict: false`)
         * - No max length (`maxLength: Infinity`)
         *
         * @param input - The raw input string to sanitize.
         * @param opts - Optional rules for sanitizing the input.
         *
         * @returns An object containing the sanitized `output`, the list of `violations`, and a boolean `ok` flag.
         *
         * @throws {Error} If `strict` mode is enabled and any sanitization rule is violated.
         * @throws {Error} If validation or sanitization fails unexpectedly.
         *
         * @example
         * const result = sanitizeString("<b>hi 👋</b>", { allowHTML: false, allowUnicode: false });
         * console.log(result.output); // "hi"
         * console.log(result.violations); // [ { rule: 'html', ... }, { rule: 'unicode', ... } ]
         * console.log(result.ok); // false
         *
         * @since v1.0.7
         */
        sanitizeString: (input: string, opts?: InputSanitizationOptions): SanitizedResult<string> => {
            try {
                let output = input;
                const violations: SanitizationViolation[] = [];
                const options = this.#_helpers.inputValidators.sanitizeString(input, opts);

                const track = (rule: string, oldValue: string, newValue: string, message: string) => {
                    if (oldValue !== newValue) {
                        if (options.strict) {
                            throw new Error(`Sanitization violation: ${message} (rule: ${rule})`);
                        }

                        violations.push({ rule, message, original: oldValue, modified: newValue });
                        output = newValue;
                    }
                };

                if (!options.allowUnicode) {
                    const newValue = output.replace(/[^\x00-\x7F]/g, '');
                    track('unicode', output, newValue, 'Removed non-ASCII characters');
                }

                if (!options.allowHTML) {
                    const newValue = output.replace(/<[^>]*>/g, '');
                    track('html', output, newValue, 'Removed HTML tags');
                }

                if (options.deny) {
                    const newValue = output.replace(options.deny, '');
                    track('deny', output, newValue, 'Removed disallowed characters (deny pattern)');
                }

                if (options.allow) {
                    const matches = output.match(options.allow as RegExp);
                    const newValue = matches ? matches.join('') : '';
                    track('allow', output, newValue, 'Removed characters not matching allowed pattern');
                }

                {
                    const newValue = output.replace(/[\x00-\x1F\x7F]/g, '');
                    track('control-chars', output, newValue, 'Removed control characters');
                }

                if (options.maxLength && output.length > options.maxLength) {
                    const newValue = output.slice(0, options.maxLength);
                    track('length', output, newValue, `Trimmed input to max length of ${options.maxLength}`);
                }

                if (options.trim === true) {
                    output = output.trim();
                }

                if (options.strict && violations.length > 0) {
                    const messages = violations.map(v => v.message).join('; ');
                    throw new Error(`Input sanitization failed: ${messages}`);
                }

                return { output: output, violations, ok: violations.length === 0 };
            } catch (error) {
                if (error instanceof Error) {
                    error.message = `Unable to sanitize input: ${error.message}`
                }

                throw error;
            }
        }
    }

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

    /**
     * Sanitizes user input—either a single string or a record of string fields—based on configurable rules.
     *
     * This method applies rules like HTML stripping, Unicode filtering, deny/allow pattern enforcement,
     * control character removal, trimming, and max-length enforcement. It tracks all violations, and optionally
     * throws on the first one if `strict` is enabled.
     *
     * The method supports:
     * - Sanitizing a single string input with global options
     * - Sanitizing a record of fields with individual per-field rules
     *
     * ## Default behavior (if no options are provided):
     * - Trims leading/trailing whitespace
     * - Removes HTML tags
     * - Removes non-ASCII (Unicode) characters
     * - Removes control characters
     * - Allows all characters (no allow pattern)
     * - Denies no characters (no deny pattern)
     * - Does **not** throw on violations (i.e. `strict: false`)
     * - No length limit (`maxLength: Infinity`)
     *
     * @typeParam T - A string or a record of string fields.
     * @param input - The user input to sanitize. Must be a string or a flat object of string values.
     * @param options - Optional sanitization rules:
     *   - If `input` is a string, provide `InputSanitizationOptions`.
     *   - If `input` is a record, provide a `FieldRuleMap<T>` with per-field configs.
     *
     * @returns An object with:
     *   - `output`: The sanitized input (same shape as input)
     *   - `violations`: A list (or field-mapped object) of rule violations, if any
     *   - `ok`: A boolean indicating whether the input passed all checks
     *
     * @throws {TypeError} If input is not a string or flat record of strings.
     * @throws {Error} If `strict: true` is enabled and a rule is violated.
     *
     * @example
     * // String usage
     * const result = sanitize("<b>Hello 👋</b>", { allowHTML: false, allowUnicode: false });
     * console.log(result.output); // "Hello"
     * console.log(result.violations); // [{ rule: "html", ... }, { rule: "unicode", ... }]
     *
     * @example
     * // Object usage
     * const result = sanitize({ username: "<admin>", bio: "Hi!" }, {
     *   username: { allow: /^[a-z0-9_]+$/i },
     *   bio: { maxLength: 10 }
     * });
     * console.log(result.output); // { username: "admin", bio: "Hi!" }
     * console.log(result.violations.username); // [{ rule: "html", ... }]
     * console.log(result.ok); // false
     *
     * @since v1.0.7
     */
    sanitize<T extends Record<string, string>>(
        input: T,
        configs?: FieldRuleMap<T>
    ): SanitizedResult<T>;
    sanitize<T extends string>(input: T, options?: InputSanitizationOptions): SanitizedResult<T>;
    sanitize<T extends string | Record<string, string>>(
        input: T,
        options?: T extends string ? InputSanitizationOptions : FieldRuleMap<T>
    ): SanitizedResult<T> {
        if (valueIs.string(input)) {
            return this.#_helpers.sanitizeString(input, options) as SanitizedResult<T>;
        } else if (valueIs.record(input)) {
            const configs = this.#_helpers.inputValidators.sanitize(input, options as FieldRuleMap<T>);
            const result: SanitizedResult<Record<string, string>> = {
                ok: true,
                output: {},
                violations: {}
            };

            for (const key in input) {
                const value = input[key];
                const sanatizationRes = this.#_helpers.sanitizeString(value, configs[key] as InputSanitizationOptions | undefined);
                result.output[key] = sanatizationRes.output;
                result.violations[key] = sanatizationRes.violations;
                result.ok = result.ok && sanatizationRes.ok;
            }

            return result as SanitizedResult<T>;
        } else {
            throw new TypeError(`Input validation error: Expected input to be a string or record but received ${typeof input}`);
        }
    }
}

const httpUtils = new HTTPUtils;
export default httpUtils;