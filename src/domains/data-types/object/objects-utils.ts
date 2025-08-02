import recordsGuard from "../record/records-guard";
import objectsGuard from "./objects-guard";
import { DeepReadonly, Objects } from "../../../docs/docs";
import { JSONObject, Stringified } from "./docs";

class ObjectUtils {
    readonly #_helpers = {
        smartClone: <T>(input: T, seen = new WeakMap()): T => {
            if (input === null || typeof input !== 'object') return input;

            if (typeof input === 'function') return input;

            if (seen.has(input)) return seen.get(input);

            // Handle known cloneable class instances
            if ('clone' in input && typeof (input as any).clone === 'function') {
                return (input as any).clone();
            }

            if (input instanceof Date) {
                return new Date(input.getTime()) as any;
            }

            if (input instanceof RegExp) {
                return new RegExp(input.source, input.flags) as any;
            }

            if (Array.isArray(input)) {
                const arr: any[] = [];
                seen.set(input, arr);
                for (const item of input) {
                    arr.push(this.#_helpers.smartClone(item, seen));
                }
                return arr as any;
            }

            if (input instanceof Map) {
                const map = new Map();
                seen.set(input, map);
                for (const [k, v] of input.entries()) {
                    map.set(this.#_helpers.smartClone(k, seen), this.#_helpers.smartClone(v, seen));
                }
                return map as any;
            }

            if (input instanceof Set) {
                const set = new Set();
                seen.set(input, set);
                for (const v of input.values()) {
                    set.add(this.#_helpers.smartClone(v, seen));
                }
                return set as any;
            }

            // For other non-plain class instances, copy reference
            const proto = Object.getPrototypeOf(input);
            if (proto !== Object.prototype && proto !== null) {
                return input;
            }

            // Clone plain object
            const obj: Record<string | symbol, any> = {};
            seen.set(input, obj);
            for (const key of Reflect.ownKeys(input)) {
                obj[key] = this.#_helpers.smartClone((input as any)[key], seen);
            }
            return obj as T;
        }
    }

    /**
     * Returns the objectsGuard instance.
     * @since v1.0.0
     */
    get guard() { return objectsGuard }
    
    /**
     * Freezes an object, making it immutable.
     * 
     * This method will return the object if it is already frozen.
     * If the object is not freezable, it will throw a TypeError.
     * 
     * @param obj - The object to freeze.
     * @returns The frozen object.
     * @throws TypeError if the object is not freezable.
     * @since v1.0.0
     */
    freeze<T extends Objects>(obj: T): Readonly<T> {
        const freezable = objectsGuard.isFreezable(obj);
        if (!freezable) { throw new TypeError(`Expected a freezable object but received ${typeof obj}`); }

        return Object.isFrozen(obj) ? obj : Object.freeze(obj);
    }

    /**
     * Deeply freezes an object, making all its properties and nested objects and
     * arrays immutable.
     * 
     * This method will return the object if it is already deeply frozen.
     * If the object is not freezable, it will throw a TypeError.
     * 
     * @param obj - The object to deeply freeze.
     * @returns The deeply frozen object.
     * @throws TypeError if the object is not freezable.
     * @since v1.0.0
     */
    deepFreeze<T extends Objects>(obj: T): DeepReadonly<T> {
        this.freeze(obj);

        const keys = Object.keys(obj) as (readonly (keyof T)[]);
        for (const key of keys) {
            const value = obj[key];
            if (recordsGuard.isRecord(value)) {
                this.deepFreeze(value);
            }

            if (Array.isArray(value)) {
                this.freeze(value);
            }
        }

        return obj as DeepReadonly<T>;
    }

    /**
     * Converts an object or array into a JSON string.
     * 
     * If the provided object is not a Record or array, a TypeError is thrown.
     * 
     * @param obj - The object or array to stringify.
     * @param spaces - Optional number of spaces to use for pretty-printing the JSON string.
     * @returns The JSON string representation of the object or array.
     * @throws TypeError if the input is not a Record or array, or if spaces is not a number.
     * @since v1.0.0
     */
    stringify<T extends Objects>(obj: T, spaces?: number): Stringified<T> {
        if (!(recordsGuard.isRecord(obj) || Array.isArray(obj))) { throw new TypeError(`Expected a record or array but received ${typeof obj}`); }
        if (spaces !== undefined && typeof spaces !== "number") { throw new TypeError(`Expected a number but received ${typeof spaces}`); }

        return JSON.stringify(obj, null, spaces) as Stringified<T>;
    }

    /**
     * Parses a JSON string and returns the corresponding object.
     * 
     * If the input is not a valid JSON string, a SyntaxError is thrown.
     * 
     * @template T - The type of the resulting object.
     * @param json - The JSON string to parse.
     * @returns The object representation of the JSON string.
     * @throws SyntaxError if the input string is not valid JSON.
     * @since v1.0.0
     */
    parse<T>(json: Stringified<T>): JSONObject<T> {
        return JSON.parse(json) as JSONObject<T>;
    }

    /**
     * Creates a deep copy of the provided object/array.
     * 
     * This method uses a smart cloning algorithm that handles various types of objects,
     * including arrays, maps, sets, and class instances with a `clone` method.
     * 
     * @template T - The type of the object to clone.
     * @param obj - The object to clone.
     * @returns A deep copy of the provided object.
     * @since v1.0.0
     */
    smartClone<T>(obj: T): T {
        return this.#_helpers.smartClone(obj);
    }

    /**
     * Creates a shallow copy of the provided object.
     *
     * This method uses the structured clone algorithm, which is the same algorithm used
     * by the `JSON.parse(JSON.stringify(obj))` expression. It is thus limited to cloning
     * objects that can be serialized to JSON.
     * 
     * If you want a smart cloning algorithm, use the {@link smartClone} method instead.
     *
     * @template T - The type of the object to clone.
     * @param obj - The object to clone.
     * @returns A shallow copy of the provided object.
     * @since v1.0.0
     */
    clone<T>(obj: T): T {
        return JSON.parse(JSON.stringify(obj)) as T;
    }
}

const objectUtils = new ObjectUtils;
export default objectUtils;