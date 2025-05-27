import recordsGuard from "../record/records-guard";

class ObjectsGuard {
    /**
     * Checks if the provided value is an object.
     * 
     * @param value - The value to check.
     * @returns True if the value is an object, otherwise false.
     * @since v1.0.0
     * @description
     * An object is a value that is not null and is of type object.
     * This includes objects created with the Object constructor, objects
     * created with object literals, and objects created with the new keyword.
     * 
     * @example
     * const object = { };
     * objectsGuard.isObject(object); // true
     * @example
     * const invalid = null;
     * objectsGuard.isObject(invalid); // false
     * @example
     * class MyClass { }
     * const invalid = new MyClass();
     * objectsGuard.isObject(invalid); // false
     */
    isObject(value: unknown): value is object {
        return typeof value === 'object' && value !== null;
    }

    /**
     * Checks if the provided value is freezable.
     * 
     * @param value - The value to check.
     * @returns True if the value is freezable, otherwise false.
     * @since v1.0.0
     * @description
     * A freezable is a value that is an object or an array.
     * This means that the value can be frozen using the Object.freeze method.
     * 
     * @example
     * const object = { };
     * objectsGuard.isFreezable(object); // true
     * @example
     * const array = [1, 2, 3];
     * objectsGuard.isFreezable(array); // true
     * @example
     * const invalid = null;
     * objectsGuard.isFreezable(invalid); // false
     * @example
     * class MyClass { }
     * const invalid = new MyClass();
     * objectsGuard.isFreezable(invalid); // false
     */
    isFreezable(value: unknown): value is object {
        return this.isObject(value) && (recordsGuard.isRecord(value) || Array.isArray(value));
    }
}

const objectsGuard = new ObjectsGuard;
export default objectsGuard;