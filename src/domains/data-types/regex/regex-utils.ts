import regexGuard from "./regex-guard";

class RegexUtils {
    /**
     * Returns the regexGuard instance.
     * @since v1.0.0
     */
    get guard() { return regexGuard }

    /**
     * Converts a glob expression to a regular expression.
     * @param glob The glob expression to convert.
     * @param options Options to customize the conversion.
     * @param options.globstar Whether or not to enable globstar matching (e.g. `** /foo`).
     * @param options.flags A string containing additional flags to pass to the created RegExp.
     * @returns The regular expression representation of the glob expression.
     * @since v1.0.0
     */
    globToRegExp(
        glob: string,
        options?: { globstar?: boolean; flags?: string }
    ): RegExp {
        const globstar = options?.globstar ?? true;
        const flags = options?.flags ?? '';
        let re = '';
        let inGroup = false;
        let escaping = false;

        for (let i = 0; i < glob.length; i++) {
            const char = glob[i];

            // Handle escaped characters (e.g., \*, \?, \{, etc.)
            if (escaping) {
                re += '\\' + char;
                escaping = false;
                continue;
            }

            if (char === '\\') {
                escaping = true;
                continue;
            }

            switch (char) {
                case '/':
                    re += '\\/';
                    break;

                case '.':
                case '+':
                case '^':
                case '$':
                case '!':
                case '=':
                case '|':
                case '(':
                case ')':
                    re += '\\' + char;
                    break;

                case '*': {
                    const prev = glob[i - 1];
                    let starCount = 1;

                    while (glob[i + 1] === '*') {
                        i++;
                        starCount++;
                    }

                    const next = glob[i + 1];
                    const isGlobstar =
                        globstar &&
                        starCount > 1 &&
                        (prev === '/' || prev === undefined) &&
                        (next === '/' || next === undefined);

                    if (isGlobstar) {
                        re += '((?:[^\\/]*(?:\\/|$))*)';
                        if (next === '/') i++; // skip slash after globstar
                    } else {
                        re += '[^\\/]*';
                    }

                    break;
                }

                case '?':
                    re += '.';
                    break;

                case '{':
                    inGroup = true;
                    re += '(';
                    break;

                case '}':
                    inGroup = false;
                    re += ')';
                    break;

                case ',':
                    re += inGroup ? '|' : ',';
                    break;

                // allow valid character classes (e.g., [jt])
                case '[':
                case ']':
                    re += char;
                    break;

                default:
                    re += char;
                    break;
            }
        }

        // Only anchor if not global, to behave like globs
        const anchored = flags.includes('g') ? re : `^${re}$`;
        return new RegExp(anchored, flags);
    }
}

const regexUtils = new RegexUtils;
export default regexUtils;