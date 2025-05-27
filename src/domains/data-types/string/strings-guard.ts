class StringGuard {
    /**
     * Checks if the provided value is a string.
     * 
     * @param value - The value to check.
     * @returns True if the value is a string, otherwise false.
     * @since v1.0.0
     */
    isString(value: unknown): value is string {
        return typeof value === 'string';
    }

    /**
     * Checks if the provided string value is empty.
     * 
     * @param value - The value to check.
     * @returns True if the value is an empty string, otherwise false.
     * @since v1.0.0
     */
    isEmpty(value: unknown): value is string {
        return this.isString(value) && value.length === 0;
    }

    /**
     * Checks if the provided string value is not empty.
     * 
     * @param value - The value to check.
     * @returns True if the value is a non-empty string, otherwise false.
     * @since v1.0.0
     */
    isNotEmpty(value: unknown): value is string {
        return this.isString(value) && value.length > 0;
    }

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
    isValidString(value: unknown): value is string {
        return this.isString(value) && value.trim().length > 0;
    }    

    /**
     * Checks if the provided value is an alphabetic string.
     * 
     * @param value - The value to check.
     * @returns True if the value is a string containing only alphabetic characters, otherwise false.
     * @since v1.0.0
     */
    isAlpha(value: unknown): value is string {
        return typeof value === 'string' && /^[A-Za-z]+$/.test(value);
    }

    /**
     * Checks if the provided value is an alphanumeric string.
     * 
     * @param value - The value to check.
     * @returns True if the value is a string containing only alphabetic and numeric characters, otherwise false.
     * @since v1.0.0
     */
    isAlphaNumeric(value: unknown): value is string {
        return typeof value === 'string' && /^[A-Za-z0-9]+$/.test(value);
    }

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
    isUUID(value: unknown, version?: 'v1' | 'v4' | 'v5'): value is string {
        if (typeof value !== 'string') { return false }
        if (!version) { version = 'v4' }

        switch (version) {
            case 'v1':
                return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
            case 'v4':
                return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
            case 'v5':
                return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
            default:
                throw new SyntaxError(`Invalid UUID version: ${version}`);
        }
    }    
}

const stringsGuard = new StringGuard;
export default stringsGuard;