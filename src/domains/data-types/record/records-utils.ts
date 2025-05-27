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
     * Checks if the specified object has the given property as its own property.
     * 
     * @param obj - The object to check for the property.
     * @param prop - The name of the property to check.
     * @returns True if the object has the specified property as its own property, otherwise false.
     * @throws {TypeError} If the provided object is not a Record.
     * @since v1.0.0
     * @example
     * const record = { foo: 'bar' };
     * hasOwnProperty(record, 'foo'); // ✅ true
     * @example
     * const record = { foo: 'bar' };
     * hasOwnProperty(record, 'bar'); // ❌ false
     * @example
     * const invalid = null;
     * hasOwnProperty(invalid, 'foo'); // ❌ false
     * @example
     * const invalid = [1, 2, 3];
     * hasOwnProperty(invalid, 'foo'); // ❌ false
     */
    hasOwnProperty(obj: unknown, prop: string): boolean {
        const isRecord = this.guard.isRecord(obj);
        if (!isRecord) {
            throw new TypeError(`Expected an object but received ${typeof obj}`);
        }

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
        if (!this.guard.isRecord(obj)) {
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
}

const recordsUtils = new RecordsUtils;
export default recordsUtils;