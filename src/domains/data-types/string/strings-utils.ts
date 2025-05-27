import stringsGuard from "./strings-guard";

class StringsUtils {
    /**
     * Returns the stringsGuard instance.
     * @since v1.0.0
     */
    get guard() { return stringsGuard }
}

const stringsUtils = new StringsUtils;
export default stringsUtils