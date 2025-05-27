import { NonEmptyArray } from "./docs";

class ArraysGuard {

    constructor() {
        this.isArrayOfNumbers = this.isArrayOf((value: unknown): value is number => typeof value === 'number');
        this.isArrayOfStrings = this.isArrayOf((value: unknown): value is string => typeof value === 'string');
        this.isArrayOfArrays = this.isArrayOf((value: unknown): value is Array<any> => Array.isArray(value));
    }

    /**
     * Checks if the provided value is an array.
     * 
     * @description
     * You can use this to create custom guards for arrays of specific types.
     * @param value - The value to check.
     * @returns True if the value is an array, otherwise false.
     * @since v1.0.0
     * @example
     * const isArrayOfNumbers = isArrayOf((value: unknown): value is number => typeof value === 'number');
     * const numbers = [1, 2, 3, 4, 5];
     * isArrayOfNumbers(numbers); // ✅ true
     */
    isArray(value: unknown): value is Array<any> {
        return Array.isArray(value);
    }

    /**
     * Checks if the provided value is a non-empty array.
     * 
     * @description
     * A non-empty array is an array that contains at least one element.
     * @param value - The value to check.
     * @returns True if the value is a non-empty array, otherwise false.
     * @since v1.0.0
     * @example
     * const empty = [];
     * arraysGuard.isNotEmpty(empty); // ❌ false
     * @example
     * const notEmpty = [1, 2, 3];
     * arraysGuard.isNotEmpty(notEmpty); // ✅ true
     */
    isNotEmpty<T extends Array<T>>(value: unknown): value is NonEmptyArray<T> {
        return this.isArray(value) && value.length > 0;
    }

    /**
     * Checks if the provided value is an array of the given type.
     * 
     * @param itemGuard - A function that takes an item and returns true if the
     * item is of the given type, otherwise false.
     * @returns A function that takes a value and returns true if the value is an
     * array and every item in the array is of the given type, otherwise false.
     * @since v1.0.0
     */
    isArrayOf<T>(
        itemGuard: (item: unknown) => item is T,
    ): (value: unknown) => value is T[] {
        return (value: unknown): value is T[] => this.isArray(value) && value.every(itemGuard);
    }

    /**
     * Checks if the provided value is an array of numbers.
     * 
     * @param value - The value to check.
     * @returns True if the value is an array of numbers, otherwise false.
     * @since v1.0.0
     */
    readonly isArrayOfNumbers;

    /**
     * Checks if the provided value is an array of strings.
     * 
     * @param value - The value to check.
     * @returns True if the value is an array of strings, otherwise false.
     * @since v1.0.0
     */
    readonly isArrayOfStrings;

    /**
     * Checks if the provided value is an array of arrays.
     * 
     * @param value - The value to check.
     * @returns True if the value is an array of arrays, otherwise false.
     * @since v1.0.0
     */
    readonly isArrayOfArrays;
}

const arraysGuard = new ArraysGuard;
export default arraysGuard;