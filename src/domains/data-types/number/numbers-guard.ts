
class NumbersGuard {
    /**
     * Checks if the provided value is a number.
     * 
     * @param value - The value to check.
     * @returns True if the value is a number, otherwise false.
     * @since v1.0.0
     */
    isNumber(value: unknown): value is number {
        return typeof value === 'number';
    }

    /**
     * Checks if the provided value is a negative number.
     * 
     * @param value - The value to check.
     * @returns True if the value is a negative number, otherwise false.
     * @since v1.0.0
     */
    isNegative(value: unknown): value is number {
        return this.isNumber(value) && value < 0;
    }

    /**
     * Checks if the provided value is a positive number.
     * 
     * @param value - The value to check.
     * @returns True if the value is a positive number, otherwise false.
     * @since v1.0.0
     */
    isPositive(value: unknown): value is number {
        return this.isNumber(value) && value > 0;
    }

    /**
     * Checks if the provided value is `NaN` (Not-a-Number).
     * 
     * @param value - The value to check.
     * @returns True if the value is NaN, otherwise false.
     * @since v1.0.0
     */
    isNaN(value: unknown): value is typeof NaN {
        return typeof value === 'number' && isNaN(value);
    }

    /**
     * Checks if the provided value is an integer.
     *
     * @param value - The value to check.
     * @returns True if the value is an integer, otherwise false.
     * @since v1.0.0
     */
    isInteger(value: unknown): value is number {
        return this.isNumber(value) && Number.isInteger(value);
    }

    /**
     * Checks if the provided value is a finite number.
     * 
     * @param value - The value to check.
     * @returns True if the value is a finite number, otherwise false.
     * @since v1.0.0
     */
    isFinite(value: unknown): value is number {
        return this.isNumber(value) && Number.isFinite(value);
    }

    /**
     * Checks if the provided value is a floating point number.
     * 
     * @param value - The value to check.
     * @returns True if the value is a floating point number, otherwise false.
     * @since v1.0.0
     */
    isFloat(value: unknown): value is number {
        return this.isNumber(value) && !Number.isInteger(value);
    }
}


const numbersGuard = new NumbersGuard;
export default numbersGuard;