class RegexGuard {
    /**
     * Checks if the given pattern is a glob-like pattern, meaning it contains at least one of the
     * characters `*` or `?`.
     * @param pattern The pattern to check.
     * @returns true if the given pattern is a glob-like pattern, false otherwise.
     * @since v1.0.0
     */
    isGlobLike(pattern: string): boolean {
        return /[*?]/.test(pattern);
    }
}

const regexGuard = new RegexGuard;
export default regexGuard;