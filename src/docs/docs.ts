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
export type { BaseQueueTask, TasksQueueOptions, AddTasksBaseOptions } from "../tools/queues/docs";
export type { EventHandler, AddHandlerOptions } from "../tools/events/docs";
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

declare const brand: unique symbol;
/**
 * Creates a *branded* version of a base type, allowing nominal typing in TypeScript.
 *
 * By default, TypeScript uses *structural typing*, which means types with the same shape are considered interchangeable.
 * `Brand<T, B>` allows you to distinguish between otherwise identical types by attaching a unique hidden "brand" to the type.
 *
 * This is useful for creating safer APIs where different domains use the same primitive types (like `string` or `number`)
 * but should not be mixed up unintentionally.
 *
 * @template T - The base type to brand (e.g. `string`, `number`, etc).
 * @template Brand - A string literal representing the brand (e.g. `'UserId'`, `'FilePath'`).
 *
 * @example
 * ```ts
 * type UserId = Brand<string, 'UserId'>;
 * type PostId = Brand<string, 'PostId'>;
 *
 * function getUser(id: UserId) { ... }
 *
 * const userId = 'abc123' as UserId;
 * const postId = 'xyz789' as PostId;
 *
 * getUser(userId); // ✅ OK
 * getUser(postId); // ❌ Type error: PostId is not assignable to UserId
 * ```
 *
 * @example
 * ```ts
 * // Branded number
 * type Milliseconds = Brand<number, 'Milliseconds'>;
 * type Seconds = Brand<number, 'Seconds'>;
 *
 * const wait = (ms: Milliseconds) => { ... };
 * wait(5000 as Milliseconds); // ✅
 * wait(5 as Seconds);         // ❌ Compile error
 * ```
 *
 * @note This has no runtime effect. The brand is erased in the compiled JavaScript.
 * @since v1.0.7
 */
export type Brand<T, Brand extends string> = T & { [brand]: Brand };

/**
 * Filters out "loose" string types like the built-in `string` type,
 * leaving only "strict" string types such as string literals or narrower unions.
 *
 * This is useful when you want to **exclude broad string types** and keep
 * only more specific, literal string types in a union.
 *
 * The type distributes over unions, testing each member individually.
 *
 * @example
 * type Test1 = LooseToStrict<string>;
 * // Result: never (excluded because `string` extends `string`)
 *
 * @example
 * type Test2 = LooseToStrict<'hello' | string>;
 * // Result: 'hello' (excludes `string`, keeps the literal)
 *
 * @example
 * type Test3 = LooseToStrict<'foo' | 'bar'>;
 * // Result: 'foo' | 'bar' (kept because `string` does NOT extend these literals)
 *
 * @template T - The type or union of types to filter.
 * @since v1.0.7
 */
export type LooseToStrict<T> = T extends any ? (string extends T ? never : T) : never;

/**
 * Makes all properties of a type `T` required **and** removes `undefined` from their types.
 *
 * Unlike the built-in `Required<T>`, which only removes the optional modifier but retains `undefined` in the type,
 * `RequiredStrict<T>` ensures that every property is both required and cannot be `undefined`.
 *
 * This is especially useful when narrowing configuration objects or enforcing strict initialization contracts.
 *
 * @example
 * type Options = {
 *   name?: string | undefined;
 *   age?: number;
 * };
 *
 * type StrictOptions = RequiredStrict<Options>;
 * // Equivalent to:
 * // {
 * //   name: string;
 * //   age: number;
 * // }
 *
 * const x: StrictOptions = {
 *   name: 'John', // ✅ must be provided and cannot be undefined
 *   age: 30       // ✅ must be provided
 * };
 *
 * @example
 * // With union types:
 * type Input = {
 *   kind?: 'a' | 'b' | undefined;
 *   data?: string | undefined;
 * };
 *
 * type StrictInput = RequiredStrict<Input>;
 * // {
 * //   kind: 'a' | 'b';
 * //   data: string;
 * // }
 *
 * @since v1.0.18
 */
export type RequiredStrict<T> = {
    [P in keyof T]-?: Exclude<T[P], undefined>;
};

/**
 * Creates a new type from `T` where:
 * - Keys **included** in the union `I` are kept **required** (if they are).
 * - Keys **not included** in `I` become **optional** (i.e., the key may be omitted).
 * - If `I` is not provided (defaults to `never`), **all keys become optional**.
 *
 * ⚠️ Unlike `Partial<T>`, which makes both keys and their values optional (allowing `undefined`),
 * this utility makes **only the keys optional** — the value types remain unchanged.
 * This means:
 *   - You may omit the property entirely.
 *   - You **cannot** assign `undefined` explicitly to the property,
 *     unless `undefined` is already part of the original value type.
 *
 * If you want to allow both keys and values to be optional (i.e., values can be `undefined`),
 * consider using {@link OptionalLoose}.
 *
 * @template T The original object type.
 * @template I A union of keys from `T` that should remain required. Defaults to `never`.
 *
 * @example
 * type User = {
 *   id: string;
 *   name: string;
 *   email: string;
 * };
 *
 * type WithId = Optional<User, 'id'>;
 * // Equivalent to:
 * // {
 * //   id: string;
 * //   name?: string;
 * //   email?: string;
 * // }
 *
 * const u1: WithId = { id: '123' };           // ✅ valid
 * const u2: WithId = { id: '123', name: undefined }; // ❌ invalid unless `name` includes `undefined`
 *
 * type AllOptional = Optional<User>;
 * // {
 * //   id?: string;
 * //   name?: string;
 * //   email?: string;
 * // }
 *
 * @since 1.0.20
 */
export type Optional<T, I extends keyof T = never> = Prettify<
    {
        // Keep keys in `I` as-is
        [P in keyof T as P extends I ? P : never]: T[P];
    } & {
        // Optionalize keys not in `I`
        [P in keyof T as P extends I ? never : P]?: undefined extends T[P] ? T[P] : Exclude<T[P], undefined>;
    }
>;

/**
 * Similar to `Partial<T>`, but allows excluding some keys from being made optional.
 *
 * Creates a new type from `T` where:
 * - Keys **included** in the union `I` remain **required** (if they are).
 * - Keys **not included** in `I` become optional **including their value types**,
 *   meaning the property can be omitted **or** assigned `undefined`.
 * - If `I` is not provided (defaults to `never`), all keys behave like `Partial<T>`,
 *   i.e., all keys become optional and values can be `undefined`.
 *
 * This utility is useful when you want partial objects but want to ensure
 * some keys are always present and required.
 *
 * @template T The original object type.
 * @template I A union of keys from `T` that should remain required. Defaults to `never`.
 *
 * @example
 * type User = {
 *   id: string;
 *   name: string;
 *   email: string;
 * };
 *
 * type WithIdRequired = OptionalLoose<User, 'id'>;
 * // Equivalent to:
 * // {
 * //   id: string;
 * //   name?: string | undefined;
 * //   email?: string | undefined;
 * // }
 *
 * const u1: WithIdRequired = { id: '123' };           // ✅ valid
 * const u2: WithIdRequired = { id: '123', name: undefined }; // ✅ valid
 *
 * type AllPartial = OptionalLoose<User>;
 * // All keys are optional and values can be undefined.
 * // {
 * //   id?: string | undefined;
 * //   name?: string | undefined;
 * //   email?: string | undefined;
 * // }
 *
 * @since 1.0.22
 */
export type OptionalLoose<T, I extends keyof T = never> = Prettify<
    {
        // Keep keys in `I` as-is
        [P in keyof T as P extends I ? P : never]: T[P];
    } & {
        // Optionalize keys not in `I`
        [P in keyof T as P extends I ? never : P]?: T[P];
    }
>;