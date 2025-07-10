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
export type { BaseQueueTask } from "../tools/queues/docs";
export type { InputSanitizationOptions, FieldRuleMap, SanitizedResult, SanitizationViolation } from "../domains/http/docs";
export type { StringPaddingOptions } from "../domains/data-types/string/strings-utils";

// #################################################
// ##### Locally Definded types and interfaces #####
// #################################################
export type Objects = Record<string, any> | any[];

/**
 * A utility type that recursively marks all properties of an object as `readonly`,
 * preventing mutation at **compile-time** via TypeScript's type system.
 *
 * This type is typically used as the return type of `atomix.dataTypes.object.deepFreeze()`,
 * which enforces **runtime immutability** using `Object.freeze()`. The combination
 * of `DeepReadonly<T>` and `deepFreeze(obj)` ensures that:
 *
 * - Mutations are blocked at compile time (readonly fields).
 * - Mutations fail silently or throw at runtime depending on strict mode.
 * 
 * For shallow immutability, use the `freeze()` method, which returns `Readonly<T>`
 * and only freezes the top-level properties.
 *
 * 🔒 Note: This type alone does **not** freeze the object at runtime.
 * - Use `freeze()` for **shallow** runtime immutability (returns `Readonly<T>`).
 * - Use `deepFreeze()` for **deep** runtime immutability (returns `DeepReadonly<T>`).
 *
 * ✅ When used with `deepFreeze()`, both compile-time and runtime deep immutability
 * are enforced.
 *
 * 🧠 Behavior:
 * - **Primitives** remain unchanged.
 * - **Functions** are left callable (not frozen).
 * - **Arrays** are wrapped as `ReadonlyArray<DeepReadonly<T>>`.
 * - **Nested objects** are made deeply readonly.
 *
 * @example
 * const config = deepFreeze({
 *   env: 'production',
 *   db: {
 *     host: 'localhost',
 *     ports: [5432, 5433],
 *   },
 *   log() {}
 * });
 *
 * // TypeScript now prevents:
 * config.env = 'dev';             // ❌ Compile-time error
 * config.db.host = '127.0.0.1';   // ❌ Compile-time error
 * config.db.ports.push(9999);     // ❌ Compile-time error
 *
 * // Runtime:
 * config.db.ports[0] = 9999;      // ❌ No effect or throws in strict mode
 *
 * @template T - The type to deeply mark as readonly.
 * @since v1.0.0
 */
export type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends (...args: any[]) => any
    ? T[P] // Functions stay callable (not made readonly)
    : T[P] extends Array<infer U>
    ? ReadonlyArray<DeepReadonly<U>> // Recursively readonly arrays
    : T[P] extends object
    ? DeepReadonly<T[P]> // Recursively readonly objects
    : T[P]; // Primitives remain as-is
};

/**
 * Forces TypeScript to re-evaluate and simplify a complex or computed type.
 *
 * This is especially useful when working with intersection types, mapped types,
 * or conditional types that result in complex, hard-to-read structures in editor
 * tooltips or error messages. `Prettify<T>` has no effect at runtime and does not
 * change the actual shape of the type—only how it's displayed.
 *
 * @example
 * type Raw = { a: number } & { b: string };
 * // Raw is shown as: { a: number } & { b: string }
 *
 * type Clean = Prettify<Raw>;
 * // Clean is shown as: { a: number; b: string }
 *
 * @example
 * type Inferred<T> = T extends infer U ? { data: U } : never;
 * type Complex = Inferred<{ x: number }>;
 * // Complex appears as: { data: { x: number } }
 * // But may show up with intermediate types unless wrapped:
 *
 * type Simplified = Prettify<Complex>;
 * // Simplified is nicely displayed as: { data: { x: number } }
 *
 * @template T - The type to be simplified.
 * @since v1.0.0
 */
export type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};
