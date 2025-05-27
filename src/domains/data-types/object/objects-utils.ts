import recordsGuard from "../record/records-guard";
import objectsGuard from "./objects-guard";
import { DeepReadonly, Objects } from "../../../docs/docs";
import { JSONObject, Stringified } from "./docs";

class ObjectUtils {
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
        const freezable = this.guard.isFreezable(obj);
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
}

const objectUtils = new ObjectUtils;
export default objectUtils;