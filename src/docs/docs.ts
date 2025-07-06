export type { Mime, FileExtension } from "../domains/http/mimes/mimes";
export type { RRType } from "../domains/network/assets/dns";
export type { TracerouteHop, PortCheckOptions } from "../domains/network/assets/inspect";
export type { IPGeolocation } from "../domains/network/assets/remote";
export type { JSONObject, Stringified } from "../domains/data-types/object/docs";
export type { NonEmptyArray } from "../domains/data-types/array/docs";
export type { AccessPermissions, PathAccessPermissions, AccessOptions } from "../domains/file-system/docs";
export type { DiscoverHostsOptions } from "../domains/network/assets/local";
export type { Serializable } from "../domains/http/body-codec";
export type { RandomOptions } from "../domains/utils/docs";

export type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends (...args: any[]) => any
    ? T[P] // Functions stay callable (not made readonly)
    : T[P] extends Array<infer U>
    ? ReadonlyArray<DeepReadonly<U>> // Recursively readonly arrays
    : T[P] extends object
    ? DeepReadonly<T[P]> // Recursively readonly objects
    : T[P]; // Primitives remain as-is
};

export type Objects = Record<string, any> | any[];

/**
 * A utility type that changes complex types to simple types.
 * @template T
 * @since v1.0.0
 */
export type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};

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