import arraysGuard from "./arrays-guard";
import recordsUtils from "../record/records-utils";
import numbersUtils from "../number/numbers-utils";

class ArraysUtils {
    /**
     * Returns the arraysGuard instance.
     * @since v1.0.0
     */
    get guard() { return arraysGuard };

    /**
     * Returns the first element of the array, or undefined if the array is empty.
     * 
     * @throws TypeError if the input is not an array.
     * @since v1.0.0
     */
    head<T>(array: T[]): T | undefined {
        if (!this.guard.isArray(array)) { throw new TypeError(`Expected an array but received ${typeof array}`); };
        return array[0];
    }

    /**
     * Returns the last element of the array, or undefined if the array is empty.
     * 
     * @throws TypeError if the input is not an array.
     * @since v1.0.0
     */
    last<T>(array: T[]): T | undefined {
        if (!this.guard.isArray(array)) { throw new TypeError(`Expected an array but received ${typeof array}`); };
        return array[array.length - 1];
    }

    /**
     * Removes all falsy values from the array, returning a new array.
     * 
     * Falsy values are those that evaluate to false when converted to a boolean,
     * such as `null`, `undefined`, `0`, `""`, and `NaN`.
     * 
     * @throws TypeError if the input is not an array.
     * @since v1.0.0
     */
    compact<T>(array: T[]): T[] {
        if (!this.guard.isArray(array)) { throw new TypeError(`Expected an array but received ${typeof array}`); };
        return array.filter(Boolean);
    }

    /**
     * Removes all duplicate values from the array, returning a new array.
     * 
     * Uses a Set to keep track of unique values, so the order of the elements
     * is not preserved.
     * 
     * @throws TypeError if the input is not an array.
     * @since v1.0.0
     */
    unique<T>(array: T[]): T[] {
        if (!this.guard.isArray(array)) { throw new TypeError(`Expected an array but received ${typeof array}`); };
        return Array.from(new Set(array));
    }

    /**
     * Divides the array into chunks of the given size.
     * 
     * The last chunk may contain fewer elements than the given size.
     * 
     * @throws TypeError if the input is not an array, or if the size is not a positive number.
     * @since v1.0.0
     * @example
     * const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
     * const result = chunk(arr, 3);
     * console.log(result);
     * // result: [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]
     */
    chunk<T>(array: T[], size: number): T[][] {
        if (!this.guard.isArray(array)) { throw new TypeError(`Expected an array but received ${typeof array}`); };
        if (!numbersUtils.guard.isPositive(size)) { throw new TypeError(`Expected a positive number but received ${size} as ${typeof size}`); };

        return Array.from({ length: Math.ceil(array.length / size) }, (_, i) => array.slice(i * size, i * size + size));
    }

    /**
     * Divides the array into chunks based on the given key function.
     * 
     * @throws TypeError if the input is not an array, or if the key function
     * does not return a string or number.
     * @since v1.0.0
     * @example
     * const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
     * const result = groupBy(arr, (item) => item % 3);
     * console.log(result);
     * // result: {
     * //   0: [3, 6, 9],
     * //   1: [1, 4, 7, 10],
     * //   2: [2, 5, 8]
     * // }
     */
    groupBy<T, K extends string | number>(
        arr: T[],
        keyFn: (item: T) => K
    ): Record<K, T[]> {
        if (!Array.isArray(arr)) {
            throw new TypeError("Expected an array as the first argument.");
        }

        return arr.reduce((acc, item) => {
            const key = keyFn(item);

            if (typeof key !== "string" && typeof key !== "number") {
                throw new TypeError("Key must be a string or number.");
            }

            (acc[key] ||= []).push(item);
            return acc;
        }, {} as Record<K, T[]>);
    }

    /**
     * Flattens the array up to the given depth.
     * 
     * @throws TypeError if the input is not an array, or if the depth is not a positive number.
     * @since v1.0.0
     * @example
     * const array = [1, 2, [3, 4, [5, 6]]];
     * const flattened = flatten(array);
     * console.log(flattened);
     * // flattened: [1, 2, 3, 4, 5, 6]
     */
    flatten<T>(array: T[], depth: number = 1) {
        if (!this.guard.isArray(array)) { throw new TypeError(`Expected an array but received ${typeof array}`); };
        if (!numbersUtils.guard.isPositive(depth)) { throw new TypeError(`Expected a positive number but received ${depth} as ${typeof depth}`); };

        return array.flat(depth);
    }

    /**
     * Recursively flattens the array until all nested arrays have been flattened.
     * 
     * @throws TypeError if the input is not an array.
     * @since v1.0.0
     * @example
     * const array = [1, 2, [3, 4, [5, 6, [7, 8, [9, 10]]]]];
     * const flattened = deepFlatten(array);
     * console.log(flattened);
     * // flattened: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
     */
    deepFlatten<T>(array: T[]) {
        return this.flatten(array, Infinity);
    }

    /**
     * Computes the difference between two arrays.
     * 
     * @throws TypeError if either argument is not an array.
     * @since v1.0.0
     * @example
     * const array1 = [1, 2, 3];
     * const array2 = [2, 3, 4];
     * const result = difference(array1, array2);
     * console.log(difference);
     * // difference: [1, 4]
     */
    difference<T>(a: T[], b: T[]) {
        if (!this.guard.isArray(a)) { throw new TypeError(`Expected "array1" to be an array but received ${typeof a}`); };
        if (!this.guard.isArray(b)) { throw new TypeError(`Expected "array2" to be an array but received ${typeof b}`); };

        const combined = new Set([...a, ...b])
        return Array.from(combined).filter(item => !a.includes(item) || !b.includes(item));
    }

    /**
     * Computes the intersection between two arrays.
     * 
     * @throws TypeError if either argument is not an array.
     * @since v1.0.0
     * @example
     * const array1 = [1, 2, 3];
     * const array2 = [2, 3, 4];
     * const result = intersect(array1, array2);
     * console.log(result);
     * // result: [2, 3]
     */
    intersect<T>(a: T[], b: T[]) {
        if (!this.guard.isArray(a)) { throw new TypeError(`Expected "array1" to be an array but received ${typeof a}`); };
        if (!this.guard.isArray(b)) { throw new TypeError(`Expected "array2" to be an array but received ${typeof b}`); };

        const combined = new Set([...a, ...b])
        return Array.from(combined).filter(item => a.includes(item) && b.includes(item));
    }


    /**
     * Toggles the existence of a value in an array.
     * 
     * @description
     * If the value does not exist in the array, it is added. If it does exist, it is removed.
     * @param arr - The array to toggle the value in.
     * @param value - The value to toggle.
     * @param options - An object containing the property "mutable".
     * @param options.mutable - If true, the array is modified in place. If false, a new array is returned without the toggled value. Defaults to `false`.
     * @returns The modified array, or a new array if "mutable" is false.
     * @since v1.0.0
     * @example
     * let array = [1, 2, 3];
     * const result = toggleValue(array, 2);
     * console.log(result);
     * // result: [1, 3]
     * @example
     * let array = [1, 2, 3];
     * const result = toggleValue(array, 2, { mutable: true });
     * console.log(array);
     * // array: [1, 3]
     */
    toggleValue<T>(arr: T[], value: T, options?: { mutable?: boolean }) {
        if (!this.guard.isArray(arr)) { throw new TypeError(`Expected an array but received ${typeof arr}`); };

        const mutable = (() => {
            if (options === undefined) { return false; };
            if (!recordsUtils.guard.isRecord(options)) { throw new TypeError(`Expected an object but received ${typeof options}`); };
            if (!recordsUtils.hasOwnProperty(options, "mutable")) { throw new SyntaxError(`Property "mutable" is required when the options object is provided`); }
            if (typeof options.mutable !== "boolean") { throw new TypeError(`Expected a boolean but received ${typeof options.mutable}`); };

            return options.mutable === true;
        })();

        const index = arr.indexOf(value);
        const exists = index > -1;

        if (mutable) {
            if (index > -1) { arr.splice(index, 1); } else { arr.push(value); }
            return arr;
        }

        return exists ? arr.filter(item => item !== value) : [...arr, value];
    }

    /**
     * Asynchronously maps each element of the array using the provided asynchronous function.
     * 
     * @param arr - The array to map over.
     * @param fn - An asynchronous function that takes an element and its index 
     * and returns a promise of the new element.
     * @returns A promise that resolves to an array of results after all mapping 
     * operations have been completed.
     * @throws TypeError if the first argument is not an array or if the second
     * argument is not a function.
     * @since v1.0.0
     * @example
     * const arr = [1, 2, 3];
     * const result = await mapAsync(arr, async (item) => item * 2);
     * console.log(result);
     * // result: [2, 4, 6]
     */
    async mapAsync<T, U>(arr: T[], fn: (item: T, index: number) => Promise<U>) {
        if (!this.guard.isArray(arr)) { throw new TypeError(`Expected an array but received ${typeof arr}`); };
        if (typeof fn !== "function") { throw new TypeError(`Expected a function but received ${typeof fn}`); };
        return Promise.all(arr.map((item, index) => fn(item, index)));
    }

    /**
     * Generates an array of numbers in a given range.
     * 
     * @param start - The start of the range.
     * @param end - The end of the range.
     * @param step - The step between each number in the range, defaults to 1.
     * @returns An array of numbers from the start of the range to the end of the range, inclusive.
     * @throws TypeError if any of the arguments are not numbers.
     * @throws TypeError if the start or end values are not integers.
     * @throws RangeError if the end value is less than the start value.
     * @since v1.0.0
     * @example
     * const result = range(1, 5);
     * console.log(result);
     * // result: [1, 2, 3, 4, 5]
     */
    range(start: number, end: number, step = 1) {
        if (!numbersUtils.guard.isNumber(start)) { throw new TypeError(`Expected a number for the "start" value but received ${typeof start}`); };
        if (numbersUtils.guard.isNegative(start)) { throw new TypeError(`Expected zero or a positive number for the "start" value but received ${start}`); };
        if (!numbersUtils.guard.isInteger(start)) { throw new TypeError(`Expected an integer for the "start" value but received ${start}`); };

        if (!numbersUtils.guard.isNumber(end)) { throw new TypeError(`Expected a number for the "end" value but received ${typeof end}`); };
        if (numbersUtils.guard.isNegative(end)) { throw new TypeError(`Expected zero or a positive number for the "end" value but received ${end}`); };
        if (!numbersUtils.guard.isInteger(end)) { throw new TypeError(`Expected an integer for the "end" value but received ${end}`); };

        if (end < start) { throw new RangeError(`Expected the "end" value to be greater than or equal to the "start" value but received ${end} < ${start}`); };

        if (!numbersUtils.guard.isNumber(step)) { throw new TypeError(`Expected a number for the "step" value but received ${typeof step}`); };
        if (numbersUtils.guard.isNegative(step)) { throw new TypeError(`Expected zero or a positive number for the "step" value but received ${step}`); };
        if (!numbersUtils.guard.isInteger(step)) { throw new TypeError(`Expected an integer for the "step" value but received ${step}`); };

        return Array.from({ length: (end - start) / step + 1 }, (_, i) => start + i * step);
    }

    /**
     * Transposes a matrix of arrays.
     * 
     * @param matrix - The matrix to transpose.
     * @returns The transposed matrix.
     * @throws TypeError if the input is not an array of arrays.
     * @since v1.0.0
     * @example
     * const matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
     * const transposed = transpose(matrix);
     * console.log(transposed);
     * // transposed: [[1, 4, 7], [2, 5, 8], [3, 6, 9]]
     */
    transpose<T>(matrix: T[][]): T[][] {
        if (!this.guard.isArray(matrix)) { throw new TypeError(`Expected an array but received ${typeof matrix}`); };
        if (!this.guard.isArrayOfArrays(matrix)) { throw new TypeError(`Expected an array of arrays but received ${matrix}`); };

        if (matrix.length === 0) return [];
        return matrix[0].map((_, i) => matrix.map(row => row[i]));
    }

    /**
     * Shuffles the elements of the array in place and returns the shuffled array.
     * 
     * @param arr - The array to shuffle.
     * @returns The shuffled array.
     * @throws TypeError if the input is not an array.
     * @since v1.0.0
     * @example
     * const arr = [1, 2, 3, 4, 5];
     * const shuffled = shuffle(arr);
     * console.log(shuffled);
     * // shuffled: [1, 4, 2, 5, 3]
     */
    shuffle<T>(arr: T[]): T[] {
        if (!this.guard.isArray(arr)) { throw new TypeError(`Expected an array but received ${typeof arr}`); };
        return [...arr].sort(() => Math.random() - 0.5);
    }
}

const arraysUtils = new ArraysUtils;
export default arraysUtils;