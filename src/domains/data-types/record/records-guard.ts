class RecordsGuard {
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
     * recordsGuard.isRecord(record); // ✅ true
     * @example
     * const invalid = null;
     * recordsGuard.isRecord(invalid); // ❌ false
     * @example
     * const invalid = [1, 2, 3];
     * recordsGuard.isRecord(invalid); // ❌ false
     */
    isRecord(value: unknown): value is Record<string, any> {
        return typeof value === 'object' &&
            value !== null &&
            !Array.isArray(value) &&
            !(value instanceof Set) &&
            !(value instanceof Map) &&
            !(value instanceof Date) &&
            !(value instanceof RegExp) &&
            Object.getPrototypeOf(value) === Object.prototype;
    }

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
     * recordsGuard.isEmpty(record); // ✅ true
     * @example
     * const invalid = null;
     * recordsGuard.isEmpty(invalid); // ❌ false
     * @example
     * const invalid = [1, 2, 3];
     * recordsGuard.isEmpty(invalid); // ❌ false
     */
    isEmpty(value: unknown): boolean {
        return this.isRecord(value) && Object.keys(value).length === 0;
    }
}

const recordsGuard = new RecordsGuard;
export default recordsGuard;