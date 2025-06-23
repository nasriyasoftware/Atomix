import stringsUtils from "./domains/data-types/string/strings-utils";
import objectsUtils from "./domains/data-types/object/objects-utils";
import recordsUtils from "./domains/data-types/record/records-utils";
import arraysUtils from "./domains/data-types/array/arrays-utils";
import numbersUtils from "./domains/data-types/number/numbers-utils";
import regexUtils from "./domains/data-types/regex/regex-utils";

class ValueIs {
    /**
     * Checks if the provided value is defined, i.e. not null and not undefined.
     * 
     * @param value - The value to check.
     * @returns True if the value is defined, otherwise false.
     * @example
     * valueIs.defined(null); // ❌ false
     * valueIs.defined(undefined); // ❌ false
     * valueIs.defined(0); // ✅ true
     * @since v1.0.0
     */
    defined(value: unknown): value is NonNullable<unknown> {
        return value !== undefined && value !== null;
    }
    /**
     * Checks if the provided value is an instance of the specified class.
     * 
     * @template T - The type of the instance.
     * @param value - The value to check.
     * @param constructor - The constructor function to check against.
     * @returns True if the value is an instance of the constructor, otherwise false.
     * @example
     * const date = new Date();
     * valueIs.instanceOf(date, Date); // ✅ true
     * @example
     * const number = 42;
     * valueIs.instanceOf(number, Date); // ❌ false
     * @since v1.0.0
     */
    instanceOf<T>(value: unknown, constructor: abstract new (...args: any[]) => T): value is T {
        return value instanceof constructor;
    }

    /**
     * Checks if the provided value is an instance of the specified class, or if its
     * type matches the constructor in a loose sense.
     * 
     * For example, if the value is a number, it will return true for the Number
     * constructor, even if the value is not an instance of Number (i.e. it is a
     * primitive number, not a boxed Number object).
     * 
     * @template T - The type of the instance.
     * @param value - The value to check.
     * @param constructor - The constructor function to check against.
     * @returns True if the value is an instance of the constructor, or if its type
     * matches the constructor in a loose sense, otherwise false.
     * @example
     * const number = 42;
     * valueIs.instanceOfLoose(number, Number); // ✅ true
     * @example
     * const string = 'hello';
     * valueIs.instanceOfLoose(string, String); // ✅ true
     * @example
     * const boolean = true;
     * valueIs.instanceOfLoose(boolean, Boolean); // ✅ true
     * @example
     * const date = new Date();
     * valueIs.instanceOfLoose(date, Date); // ✅ true
     * @example
     * const invalid = null;
     * valueIs.instanceOfLoose(invalid, Date); // ❌ false
     * @since v1.0.0
     */
    instanceOfLoose<T>(
        value: unknown,
        constructor: abstract new (...args: any[]) => T
    ): value is T {
        if (typeof value === 'object' && value !== null) {
            return value instanceof constructor;
        }

        // Handle boxed primitives like Number, String, Boolean
        const type = constructor as unknown;
        switch (type) {
            case Number:
                return typeof value === 'number';
            case String:
                return typeof value === 'string';
            case Boolean:
                return typeof value === 'boolean';
            default:
                return false;
        }
    }

    // ==========================================
    // ============= Numbers Guards =============
    // ==========================================

    /**
     * Checks if the provided value is a number.
     * 
     * @param value - The value to check.
     * @returns True if the value is a number, otherwise false.
     * @since v1.0.0
     */
    readonly number = numbersUtils.guard.isNumber;

    /**
     * Checks if the provided value is a negative number.
     * 
     * @param value - The value to check.
     * @returns True if the value is a negative number, otherwise false.
     * @since v1.0.0
     */
    readonly negativeNumber = numbersUtils.guard.isNegative.bind(numbersUtils.guard);

    /**
     * Checks if the provided value is a positive number.
     * 
     * @param value - The value to check.
     * @returns True if the value is a positive number, otherwise false.
     * @since v1.0.0
     */
    readonly positiveNumber = numbersUtils.guard.isPositive.bind(numbersUtils.guard);

    /**
     * Checks if the provided value is an integer.
     *
     * @param value - The value to check.
     * @returns True if the value is an integer, otherwise false.
     * @since v1.0.0
     */
    readonly integer = numbersUtils.guard.isInteger.bind(numbersUtils.guard);

    /**
     * Checks if the provided value is a floating point number.
     * 
     * @param value - The value to check.
     * @returns True if the value is a floating point number, otherwise false.
     * @since v1.0.0
     */
    readonly float = numbersUtils.guard.isFloat.bind(numbersUtils.guard);

    /**
     * Checks if the provided value is a finite number.
     * 
     * @param value - The value to check.
     * @returns True if the value is a finite number, otherwise false.
     * @since v1.0.0
     */
    readonly finite = numbersUtils.guard.isFinite.bind(numbersUtils.guard);

    /**
     * Checks if the provided value is `NaN` (Not-a-Number).
     * 
     * @param value - The value to check.
     * @returns True if the value is NaN, otherwise false.
     * @since v1.0.0
     */
    readonly NaN = numbersUtils.guard.isNaN.bind(numbersUtils.guard);

    // =========================================
    // ============= String Guards =============
    // =========================================

    /**
     * Checks if the provided value is a string.
     * 
     * @param value - The value to check.
     * @returns True if the value is a string, otherwise false.
     * @since v1.0.0
     */
    readonly string = stringsUtils.guard.isString;

    /**
     * Checks if the provided string value is blank (contains only whitespace).
     * 
     * @param value - The value to check.
     * @returns True if the value is a string containing only whitespace, otherwise false.
     * @since v1.0.0
     */
    readonly blankString = stringsUtils.guard.isBlank.bind(stringsUtils.guard);

    /**
     * Checks if the provided string value is empty.
     * 
     * @param value - The value to check.
     * @returns True if the value is an empty string, otherwise false.
     * @since v1.0.0
     */
    readonly emptyString = stringsUtils.guard.isEmpty.bind(stringsUtils.guard);

    /**
     * Checks if the provided string value is not empty.
     * 
     * @param value - The value to check.
     * @returns True if the value is a non-empty string, otherwise false.
     * @since v1.0.0
     */
    readonly notEmptyString = stringsUtils.guard.isNotEmpty.bind(stringsUtils.guard);

    /**
     * Checks if the provided value is a valid string.
     * 
     * @param value - The value to check.
     * @returns True if the value is a valid string, otherwise false.
     * @since v1.0.0
     * @description
     * A valid string is a string that is not empty and has some content.
     * The string is trimmed before its length is checked.
     */
    readonly validString = stringsUtils.guard.isValidString.bind(stringsUtils.guard);

    /**
     * Checks if the provided value is an alphabetic string.
     * 
     * @param value - The value to check.
     * @returns True if the value is a string containing only alphabetic characters, otherwise false.
     * @since v1.0.0
     */
    readonly alphaString = stringsUtils.guard.isAlpha;

    /**
     * Checks if the provided value is an alphanumeric string.
     * 
     * @param value - The value to check.
     * @returns True if the value is a string containing only alphabetic and numeric characters, otherwise false.
     * @since v1.0.0
     */
    readonly alphaNumericString = stringsUtils.guard.isAlphaNumeric;

    /**
     * Checks if the provided value is a valid UUID string.
     * 
     * @param value - The value to check.
     * @param version - The UUID version to check against, defaults to v4.
     * @returns True if the value is a valid UUID, otherwise false.
     * @since v1.0.0
     * @description
     * A valid UUID is a string of the following format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
     * The format is different for each version.
     */
    readonly uuid = stringsUtils.guard.isUUID;

    /**
     * Checks if the given pattern is a glob-like pattern, meaning it contains at least one of the
     * characters `*` or `?`.
     * @param pattern The pattern to check.
     * @returns true if the given pattern is a glob-like pattern, false otherwise.
     * @since v1.0.0
     */
    readonly globLike = regexUtils.guard.isGlobLike;

    // ==========================================
    // ============= Objects Guards =============
    // ==========================================

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
     * objectsUtils.guard.isObject(object); // true
     * @example
     * const invalid = null;
     * objectsUtils.guard.isObject(invalid); // false
     * @example
     * class MyClass { }
     * const invalid = new MyClass();
     * objectsUtils.guard.isObject(invalid); // false
     */
    readonly object = objectsUtils.guard.isObject;

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
     * objectsUtils.guard.isFreezable(object); // true
     * @example
     * const array = [1, 2, 3];
     * objectsUtils.guard.isFreezable(array); // true
     * @example
     * const invalid = null;
     * objectsUtils.guard.isFreezable(invalid); // false
     * @example
     * class MyClass { }
     * const invalid = new MyClass();
     * objectsUtils.guard.isFreezable(invalid); // false
     */
    readonly freezable = objectsUtils.guard.isFreezable.bind(objectsUtils.guard);

    // ==========================================
    // ============= Records Guards =============
    // ==========================================

    /**
     * Checks if the provided value is a Record.
     * 
     * @param value - The value to check.
     * @returns True if the value is a Record, otherwise false.
     * @since v1.0.0
     * @description
     * A Record is an object that is not null, is not an array, and contains
     * at least one key-value pair.
     * 
     * @example
     * const record = { foo: 'bar' };
     * recordsUtils.guard.isRecord(record); // ✅ true
     * @example
     * const invalid = null;
     * recordsUtils.guard.isRecord(invalid); // ❌ false
     * @example
     * const invalid = [1, 2, 3];
     * recordsUtils.guard.isRecord(invalid); // ❌ false
     */
    readonly record = recordsUtils.guard.isRecord;

    /**
     * Checks if the provided value is an empty Record.
     * 
     * @param value - The value to check.
     * @returns True if the value is an empty Record, otherwise false.
     * @since v1.0.0
     * @description
     * An empty Record is a Record that contains no key-value pairs.
     * 
     * @example
     * const record = { };
     * recordsUtils.guard.isEmpty(record); // ✅ true
     * @example
     * const invalid = null;
     * recordsUtils.guard.isEmpty(invalid); // ❌ false
     * @example
     * const invalid = [1, 2, 3];
     * recordsUtils.guard.isEmpty(invalid); // ❌ false
     */
    readonly emptyRecord = recordsUtils.guard.isEmpty.bind(recordsUtils.guard);

    // ==========================================
    // ============= Arrays Guards ==============
    // ==========================================

    /**
     * Checks if the provided value is an array.
     * 
     * @param value - The value to check.
     * @returns True if the value is an array, otherwise false.
     * @since v1.0.0
     */
    readonly array = arraysUtils.guard.isArray;

    /**
     * Checks if the provided value is a non-empty array.
     * 
     * @param value - The value to check.
     * @returns True if the value is a non-empty array, otherwise false.
     * @since v1.0.0
     */
    readonly notEmptyArray = arraysUtils.guard.isNotEmpty.bind(arraysUtils.guard);

    /**
     * Checks if the provided value is an array of the given type.
     * 
     * @param itemGuard - A function that takes an item and returns true if the
     * item is of the given type, otherwise false.
     * @returns A function that takes a value and returns true if the value is an
     * array and every item in the array is of the given type, otherwise false.
     * @since v1.0.0
     */
    readonly arrayOf = arraysUtils.guard.isArrayOf.bind(arraysUtils.guard);

    /**
     * Checks if the provided value is an array of numbers.
     * 
     * @param value - The value to check.
     * @returns True if the value is an array of numbers, otherwise false.
     * @since v1.0.0
     */
    readonly arrayOfNumbers = arraysUtils.guard.isArrayOfNumbers.bind(arraysUtils.guard);

    /**
     * Checks if the provided value is an array of strings.
     * 
     * @param value - The value to check.
     * @returns True if the value is an array of strings, otherwise false.
     * @since v1.0.0
     */
    readonly arrayOfStrings = arraysUtils.guard.isArrayOfStrings.bind(arraysUtils.guard);
}

const valueIs = new ValueIs;
export default valueIs;