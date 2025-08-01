import recordsGuard from "./records-guard";
import objectUtils from "../object/objects-utils";
import { DeepReadonly } from "../../../docs/docs";
import { JSONObject, Stringified } from "../object/docs";

class RecordsUtils {
    /**
     * Returns the recordsGuard instance.
     * @since v1.0.0
     */
    get guard() { return recordsGuard }

    /**
     * Checks whether the given record has the specified property as its own (non-inherited) property.
     *
     * This utility supports both known keys from the type (`keyof T`) and arbitrary string values.
     * It preserves autocomplete for known keys and enables proper type narrowing:  
     * - If `prop` is a known key of `T`, the return type confirms it.  
     * - If `prop` is not in `T`, the result is still a valid boolean without a type error.
     *
     * @template T - A record type with string keys.
     * @param obj - The record to inspect.
     * @param prop - A property key to check for. Supports known keys (with autocomplete) and arbitrary strings.
     * @returns `true` if the property exists directly on the object (not inherited), otherwise `false`.
     * @throws {TypeError} If the provided value is not a valid record.
     *
     * @since v1.0.0
     *
     * @example
     * const user = { id: 1, name: 'Alice' };
     * hasOwnProperty(user, 'id'); // ✅ true
     *
     * @example
     * const user = { id: 1 };
     * hasOwnProperty(user, 'email'); // ❌ false — not in object, even if declared in the type
     *
     * @example
     * const dynamic = {} as Record<string, any>;
     * hasOwnProperty(dynamic, 'foo'); // ✅ works with arbitrary strings too
     *
     * @example
     * hasOwnProperty(null, 'foo'); // ❌ throws TypeError
     */
    hasOwnProperty<T extends Record<string, any>>(
        obj: T,
        prop: keyof T | (string & {})
    ): prop is keyof T {
        if (!recordsGuard.isRecord(obj)) { throw new TypeError(`Expected an object but received ${typeof obj}`) }
        return Object.prototype.hasOwnProperty.call(obj, prop);
    }

    /**
     * Converts a Record object to a Map.
     * 
     * @param obj - The Record object to convert.
     * @returns A Map with the same key-value pairs as the Record.
     * @since v1.0.0
     * @example
     * const record = { foo: 'bar', baz: 'qux' };
     * const map = toMap(record);
     * // Map(2) { "foo" => "bar", "baz" => "qux" }
     */
    toMap<K extends string, V>(obj: Record<K, V>): Map<K, V> {
        if (!recordsGuard.isRecord(obj)) {
            throw new TypeError(`Expected an object but received ${typeof obj}`);
        }

        return new Map(Object.entries(obj) as [K, V][]);
    }

    /**
     * Creates a frozen copy of the Record object.
     * 
     * @param obj - The Record object to freeze.
     * @returns A frozen copy of the Record object.
     * @since v1.0.0
     * @example
     * const record = { foo: 'bar', baz: 'qux' };
     * const frozen = freeze(record);
     * // frozen is a frozen copy of record
     */
    freeze<T extends Record<string, any>>(obj: T): Readonly<T> {
        return objectUtils.freeze(obj);
    }

    /**
     * Creates a deeply frozen copy of the Record object.
     * 
     * @param obj - The Record object to deeply freeze.
     * @returns A deeply frozen copy of the Record object.
     * @since v1.0.0
     * @example
     * const record = { foo: 'bar', baz: { qux: 'quux' } };
     * const frozen = deepFreeze(record);
     * // frozen is a deeply frozen copy of record
     */
    deepFreeze<T extends Record<string, any>>(obj: T): DeepReadonly<T> {
        return objectUtils.deepFreeze(obj);
    }

    /**
     * Converts a Record object to a JSON string.
     * 
     * If the provided object is not a Record, a TypeError is thrown.
     * 
     * @param obj - The Record object to stringify.
     * @param spaces - Optional number of spaces to use for pretty-printing the JSON string.
     * @returns The JSON string representation of the Record object.
     * @throws TypeError if the input is not a Record.
     * @since v1.0.0
     * @example
     * const record = { foo: 'bar', age: 16, x: { valid: true } };
     * const jsonString = stringify(record, 2);
     * // jsonString is a pretty-printed JSON string
     */
    stringify<T extends Record<string, any>>(obj: T, spaces?: number): Stringified<T> {
        return objectUtils.stringify(obj, spaces);
    }

    /**
     * Parses a JSON string and returns the corresponding Record object.
     * 
     * If the input is not a valid JSON string, a SyntaxError is thrown.
     * 
     * @template T - The type of the resulting Record object.
     * @param json - The JSON string to parse.
     * @returns The Record object representation of the JSON string.
     * @throws SyntaxError if the input string is not valid JSON.
     * @since v1.0.0
     * @example
     * const jsonString = '{"foo":"bar","age":16,"x":{"valid":true}}';
     * const record = parse(jsonString);
     * // record is a Record object with the same structure as the input JSON string
     */
    parse<T>(json: Stringified<T>): JSONObject<T> {
        return objectUtils.parse(json);
    }

    /**
     * Returns an array of all keys in the Record object.
     * 
     * This method returns an array of strings, where each element is a key in the
     * Record object. The type of the returned array is inferred from the type
     * parameter of the Record object.
     * 
     * @template T - The type of the Record object.
     * @param obj - The Record object to get the keys from.
     * @returns An array of all keys in the Record object.
     * @since v1.0.16
     * @example
     * const record = { foo: 'bar', age: 16, x: { valid: true } };
     * const keys = records.keys(record);
     * // keys is an array of type (keyof typeof record)[]
     */
    keys<T extends Record<string, any>>(obj: T) {
        return Object.keys(obj) as (keyof T)[];
    }

    /**
     * Returns an array of all values in the Record object.
     * 
     * This method returns an array of values, where each element is a value in the
     * Record object. The type of the returned array is inferred from the type
     * parameter of the Record object.
     * 
     * @template T - The type of the Record object.
     * @param obj - The Record object to get the values from.
     * @returns An array of all values in the Record object.
     * @since v1.0.16
     * @example
     * const record = { foo: 'bar', age: 16, x: { valid: true } };
     * const values = records.values(record);
     * // values is an array of type (T[keyof T])[]
     */
    values<T extends Record<string, any>>(obj: T): T[keyof T][] {
        return Object.values(obj);
    }

    /**
     * Returns an array of [key, value] pairs from the Record object.
     * 
     * This method returns an array of [key, value] pairs, where each element is a
     * key-value pair in the Record object. The type of the returned array is
     * inferred from the type parameter of the Record object.
     * 
     * @template TObj - The type of the Record object.
     * @template TKey - The type of the keys in the Record object.
     * @param obj - The Record object to get the entries from.
     * @returns An array of [key, value] pairs from the Record object.
     * @since v1.0.16
     * @example
     * const record = { foo: 'bar', age: 16, x: { valid: true } };
     * const entries = records.entries(record);
     * // entries is an array of type [keyof typeof record, typeof record[keyof typeof record]][]
     */
    entries<TObj extends Record<string, any>, TKey extends keyof TObj>(obj: TObj): [TKey, TObj[TKey]][] {
        return Object.entries(obj) as [TKey, TObj[TKey]][];
    }
}

const recordsUtils = new RecordsUtils;
export default recordsUtils;