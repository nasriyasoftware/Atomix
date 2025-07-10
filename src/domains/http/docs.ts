import { Prettify } from "../../docs/docs";

/**
 * Represents a single rule violation that occurred during the sanitization process.
 *
 * Useful for auditing what modifications were applied to the input.
 */
export interface SanitizationViolation {
    /** The name of the violated rule (e.g. 'html', 'unicode', 'deny') */
    rule: string;

    /** A human-readable explanation of the violation */
    message: string;

    /** The input string before the violation fix was applied */
    original: string;

    /** The modified string after applying the sanitization rule */
    modified: string;
}


/**
 * The result of the input sanitization process.
 */
export interface SanitizedResult<T extends string | Record<string, string>> {
    /** Whether the input passed all sanitization checks (i.e. no violations) */
    ok: boolean;

    /** The final, sanitized output */
    output: T;

    /** An array of all violations encountered during sanitization */
    violations: T extends string ? SanitizationViolation[] : { [K in keyof T]: SanitizationViolation[] };
}


/**
 * Optional rules to configure the input sanitization behavior.
 */
export type InputSanitizationOptions = {
    /**
     * Whether to trim leading/trailing whitespace
     * @default true
     */
    trim?: boolean;

    /**
     * Whether to allow HTML tags
     * @default false
     */
    allowHTML?: boolean;

    /** 
     * Whether to allow non-ASCII (Unicode) characters
     * @default false
     */
    allowUnicode?: boolean;

    /**
     * Maximum allowed length for the output string
     * @default Infinity
     */
    maxLength?: number;

    /** A RegExp pattern specifying which characters are allowed */
    allow?: RegExp;

    /** A RegExp pattern specifying which characters are denied */
    deny?: RegExp;

    /**
     * If true, throws an error on the first violation instead of returning a violation report.
     * If false, sanitization continues silently and violations are reported in the result.
     * @default false
     */
    strict?: boolean;
};

/**
 * Fully resolved and validated version of `InputSanitizationOptions`.
 * All fields are required except `allow` and `deny`, which may remain undefined.
 *
 * Used internally during sanitization to avoid repeated defaulting logic.
 */
export type InputSanitizationConfigs = Prettify<
    Omit<Required<InputSanitizationOptions>, 'allow' | 'deny'> & {
        allow?: RegExp;
        deny?: RegExp;
    }
>;

/**
 * A map of field names to their respective input sanitization rules.
 *
 * Useful when validating multiple user input fields with different constraints.
 *
 * @example
 * const fieldRules: FieldRuleMap = {
 *   username: { allow: /^[a-z0-9_-]+$/i, maxLength: 20 },
 *   comment: { allowHTML: false, maxLength: 300 },
 * };
 */
export type FieldRuleMap<T> = {
    [K in keyof T]?: InputSanitizationOptions;
};