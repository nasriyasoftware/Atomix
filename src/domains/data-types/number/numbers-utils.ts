import numbersGuard from "./numbers-guard";

class NumbersUtils {
    /**
     * Returns the numbersGuard instance.
     * @since v1.0.0
     */
    get guard() { return numbersGuard }
}

const numbersUtils = new NumbersUtils;
export default numbersUtils;