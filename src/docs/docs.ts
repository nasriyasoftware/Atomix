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